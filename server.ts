import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  activeIngredientsList,
  medicinesList,
  labReferencesList
} from './src/data/medicalDatabase.ts';
import { LabStatus, ParsedLabItem, Medicine, ActiveIngredient } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Normalize strings for Arabic/English search
function normalizeStr(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove arabic diacritics
    .replace(/[^a-z0-9\u0600-\u06FF]/gi, ' ')
    .trim();
}

// Helper: Call Gemini with model fallback, JSON cleanup, and robust error handling
async function callGeminiVision(prompt: string, imageBase64: string, mimeTypeFallback: string): Promise<any> {
  let cleanBase64 = imageBase64;
  let detectedMime = mimeTypeFallback || 'image/jpeg';

  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    detectedMime = parts[0].replace(/^data:/, '').trim() || 'image/jpeg';
    cleanBase64 = parts[1].trim();
  } else if (imageBase64.includes(',')) {
    cleanBase64 = imageBase64.split(',')[1].trim();
  }

  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text || '{}';

      // Smart cleaning: strip markdown code blocks
      const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

      let jsonSubstring = cleaned;
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(jsonSubstring);
    } catch (err: any) {
      console.warn(`[AI Vision] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('تعذر معالجة الصورة عبر جميع نماذج الذكاء الاصطناعي.');
}

// ----------------------------------------------------
// 1. API: Analyze Medicine Packaging (OCR & Matching)
// ----------------------------------------------------
app.post('/api/analyze-medicine', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', manualQuery } = req.body;

    let detectedTradeName = '';
    let detectedActiveIngredient = '';
    let detectedManufacturer = '';
    let detectedStrength = '';
    let detectedDosageForm = '';
    let confidenceScore = 90;
    let textClarity: 'high' | 'medium' | 'low' = 'high';
    let rawOcrText = '';
    let drugClass = '';
    let mechanismOfAction = '';
    let aiIndications: string[] = [];
    let aiSideEffects: string[] = [];
    let aiSafetyWarnings: string[] = [];
    let aiDrugInteractions: string[] = [];
    let aiSpecialPopulations = '';
    let aiStorageAdvice = '';
    let aiCommercialAlternatives: any[] = [];
    let aiElderlyFriendlySummary = '';
    let aiHowToTake = '';
    let aiExpiryDate = '';
    let aiHandwrittenNotes = '';

    if (imageBase64) {
      const prompt = `
أنت خبير صيدلاني واستشاري علم الأدوية السريري (Clinical Pharmacologist) وتعتمد على أحدث قواعد البيانات الدوائية والمكملات الغذائية العالمية المعتمدة (OpenFDA, WHO Model Formulary, British National Formulary BNF, Dietary Supplements Databases).
أمامك صورة حقيقية لعلبة دواء أو شريط أقراص أو مكمل غذائي أو أكياس فوارة للحل في الماء (Sachets/Powder) أو مستحضر صيدلاني مركب، بما في ذلك العلب ذات الألوان الفاتحة أو البيضاء.
قم بمسح الصورة ضوئياً بدقة متناهية واستخرج جميع النصوص المطبوعة وأي كتابات يدوية مضافة:

قواعد وتوجيهات حرجة:
1. اقرأ بدقة جميع أنواع المستحضرات: أدوية بشرية، مكملات غذائية (Dietary Supplements)، أكياس بودرة قابلة للحل (Sachets)، فوار، كبسولات، أقراص، محاليل.
2. إذا كان المستحضر يحتوي على عدة مواد فعالة مجتمعة (Combination Product مثل NosiFol الذي يحتوي على Inositol, Folic Acid, Zinc, Betaine, Vitamins B6, B12 من إنتاج شركة Sakura Italia)، اذكر جميع المواد الفعالة بدقة ووضوح في حقل activeIngredient ولا تكتفِ بواحدة فقط.
3. فتش بدقة عن أي كتابة بخط اليد (Handwritten Notes) كتبها الصيدلي أو الطبيب بالقلم على العلبة (مثل تعليمات الجرعة: "كيس + نصف كوب ماء"، أو "1×2 بعد الأكل"، أو أي إرشادات بخط اليد). إذا وجدت أي كتابة يدوية، استخرجها حرفياً في حقل "handwrittenNotes" وأدمجها كذلك داخل حقل "howToTake". إذا لم توجد كتابة يدوية، اجعل قيمة "handwrittenNotes" نصاً فارغاً "".

المطلوب استخراج وكتابة المعلومات التالية بصيغة JSON فقط:
1. tradeName: الاسم التجاري المكتوب على العلبة تماماً كما يظهر (مثلاً: NosiFol, Tyra, Panadol, Cialis, Augmentin, Congestal, Concor, Glucophage, إلخ).
2. activeIngredient: المادة الفعالة أو المواد الفعالة المركبة كاملة بدقة (مثل: Inositol + Folic Acid + Zinc + Betaine + Vitamin B6 + Vitamin B12, Tadalafil, Paracetamol, إلخ).
3. manufacturer: اسم الشركة المصنعة المكتوب أو شعارها (مثل: Sakura Italia, Dar Aldawa, GlaxoSmithKline, Novartis, Pfizer, Sanofi, EIPICO, إلخ).
4. strength: تركيز الجرعة أو محتوى العلبة (مثل: 30 Sachets of 5.5g, 20 mg, 500 mg, 1 g, 400 mg, 10 mg, 50mg/5ml).
5. dosageForm: الشكل الصيدلاني (أكياس فوارة للحل في الماء Sachets, أقراص مغلفة Film Coated Tablets, كبسولات Capsules, شراب Syrup, إلخ).
6. drugClass: الفئة والتصنيف العلاجي الدقيق باللغة العربية (مثل: مكمل غذائي علاجي لدعم الخصوبة وتكيس المبايض، مسكن وخافض حرارة، مضاد حيوي).
7. mechanismOfAction: شرح علمي مبسط وعميق لآلية عمل الدواء أو المكونات داخل الجسم وكيف يعالج المشكلة.
8. indications: مصفوفة بـ 3-5 دواعي استعمال أساسية مثبتة طبياً ومخصصة لهذا الدواء (مثال لـ NosiFol: علاج متلازمة تكيس المبايض PCOS، تحسين الخصوبة وجودة البويضات، تنظيم الهرمونات).
9. sideEffects: مصفوفة بالآثار الجانبية الشائعة والمحتملة لهذا الدواء.
10. safetyWarnings: مصفوفة بالتحذيرات وموانع الاستعمال الحرجة وملاحظات السلامة.
11. drugInteractions: مصفوفة بأهم التداخلات الدوائية والغذائية المحذورة.
12. specialPopulations: إرشادات دقيقة للحوامل والمرضعات وكبار السن وأصحاب الأمراض المزمنة.
13. storageAdvice: شروط الحفظ والتخزين المثالية.
14. commercialAlternatives: قائمة بأشهر 3-5 بدائل تجارية معروفة تحتوي على نفس المادة الفعالة ونفس الجرعة، مع التركيز الشديد على البدائل المتوفرة في ليبيا والدول العربية.
15. elderlyFriendlySummary: ملخص مبسط جداً ومطمئن باللغة العربية الواضحة (سطرين كحد أقصى) موجه لكبير السن أو عائلته يشرح ما هو الدواء ولماذا يستخدم بلغة عامية فصيحة وسهلة جداً ومطمئنة.
16. howToTake: طريقة وتوقيت الاستخدام الدقيق والمناسب للمريض بما في ذلك طريقة التحضير إن كان كيساً يذاب في ماء أو شراباً (وإذا كانت هناك كتابة بخط يد الصيدلي أدمجها هنا).
17. handwrittenNotes: النص الحرفي لأي إرشادات أو جرعات كتبها الصيدلي أو الطبيب بخط يده على العلبة بالقلم إن وجدت، وإلا فارغ.
18. expiryDate: قراءة تاريخ انتهاء الصلاحية من العلبة بدقة إن ظهر (مثال: 08/2027 أو EXP 2026)، أو كتابة "غير محدد على الجزء الظاهر من العلبة".
19. confidenceScore: رقم من 0 إلى 100 يعكس وضوح قراءة اسم الدواء والمادة الفعالة من الصورة.
20. textClarity: "high" أو "medium" أو "low".
21. rawExtractedText: كافة النصوص والكلمات الإنجليزية والعربية المقروءة من العلبة بما فيها أي كتابة يدوية.

أخرج النتيجة بصيغة JSON فقط.`;

      try {
        const parsed = await callGeminiVision(prompt, imageBase64, mimeType);

        detectedTradeName = parsed.tradeName || '';
        detectedActiveIngredient = parsed.activeIngredient || '';
        detectedManufacturer = parsed.manufacturer || '';
        detectedStrength = parsed.strength || '';
        detectedDosageForm = parsed.dosageForm || '';
        confidenceScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 92;
        textClarity = parsed.textClarity || 'high';
        rawOcrText = parsed.rawExtractedText || '';
        drugClass = parsed.drugClass || '';
        mechanismOfAction = parsed.mechanismOfAction || '';
        aiIndications = parsed.indications || [];
        aiSideEffects = parsed.sideEffects || [];
        aiSafetyWarnings = parsed.safetyWarnings || [];
        aiDrugInteractions = parsed.drugInteractions || [];
        aiSpecialPopulations = parsed.specialPopulations || '';
        aiStorageAdvice = parsed.storageAdvice || '';
        aiCommercialAlternatives = parsed.commercialAlternatives || [];
        aiElderlyFriendlySummary = parsed.elderlyFriendlySummary || '';
        aiHowToTake = parsed.howToTake || '';
        aiExpiryDate = parsed.expiryDate || '';
        aiHandwrittenNotes = parsed.handwrittenNotes || '';
      } catch (aiErr: any) {
        console.error('Gemini OCR error:', aiErr?.message || aiErr);
        return res.status(500).json({
          error: aiErr?.message || 'تعذر قراءة صورة العلبة عبر الذكاء الاصطناعي. يرجى التأكد من وضوح الصورة وتجربة التقاطها مرة أخرى.'
        });
      }
    } else if (manualQuery) {
      detectedTradeName = manualQuery;
      confidenceScore = 98;
      textClarity = 'high';
    }

    // Match with database: ONLY if name is provided and at least 2 characters!
    const normTrade = normalizeStr(detectedTradeName);
    const normActive = normalizeStr(detectedActiveIngredient);

    let matchedMed: Medicine | null | undefined = null;
    if (normTrade && normTrade.length >= 2) {
      matchedMed = medicinesList.find(m => {
        const mAr = normalizeStr(m.tradeNameAr);
        const mEn = normalizeStr(m.tradeNameEn);
        return (
          mAr === normTrade ||
          mEn === normTrade ||
          (normTrade.length >= 3 && (mAr.includes(normTrade) || normTrade.includes(mAr))) ||
          (normTrade.length >= 3 && (mEn.includes(normTrade) || normTrade.includes(mEn)))
        );
      });
    }

    let matchedActive: ActiveIngredient | null | undefined = null;
    if (normActive && normActive.length >= 2) {
      matchedActive = activeIngredientsList.find(a => {
        const aAr = normalizeStr(a.nameAr);
        const aEn = normalizeStr(a.nameEn);
        return (
          aAr === normActive ||
          aEn === normActive ||
          (normActive.length >= 3 && (aAr.includes(normActive) || normActive.includes(aAr))) ||
          (normActive.length >= 3 && (aEn.includes(normActive) || normActive.includes(aEn)))
        );
      });
    }

    if (!matchedActive && matchedMed) {
      matchedActive = activeIngredientsList.find(a => a.id === matchedMed?.activeIngredientId);
    }

    if (!matchedMed && matchedActive) {
      matchedMed = medicinesList.find(m => m.activeIngredientId === matchedActive?.id);
    }

    // Prepare alternatives
    let commercialAlternatives = matchedActive
      ? medicinesList.filter(m => m.activeIngredientId === matchedActive?.id && m.id !== matchedMed?.id)
      : [];

    if (commercialAlternatives.length === 0 && Array.isArray(aiCommercialAlternatives) && aiCommercialAlternatives.length > 0) {
      commercialAlternatives = aiCommercialAlternatives.map((alt: any, idx: number) => ({
        id: `ai-alt-${idx}`,
        tradeNameAr: typeof alt === 'string' ? alt : (alt.tradeNameAr || alt.tradeName || 'دواء بديل'),
        tradeNameEn: typeof alt === 'object' ? (alt.tradeNameEn || alt.tradeName || '') : '',
        activeIngredientId: matchedActive?.id || 'gen',
        strength: (typeof alt === 'object' && alt.strength) || detectedStrength || 'مطابق',
        dosageForm: (typeof alt === 'object' && alt.dosageForm) || detectedDosageForm || 'مستحضر صيدلاني',
        manufacturer: (typeof alt === 'object' && alt.manufacturer) || 'شركة صيدلانية معتمدة',
        prescriptionRequired: matchedMed ? matchedMed.prescriptionRequired : true,
        descriptionAr: `دواء بديل مكافئ يحتوي على نفس المادة الفعالة (${detectedActiveIngredient || (matchedActive ? matchedActive.nameAr : '')}).`
      }));
    }

    const requiresConfirmation = confidenceScore < 80;

    // Use detected values directly from OCR/AI; NEVER fallback blindly to a wrong drug!
    const finalTradeName = detectedTradeName || (matchedMed ? matchedMed.tradeNameAr : 'دواء غير محدد');
    const finalActiveIngredient = detectedActiveIngredient || (matchedActive ? `${matchedActive.nameAr} (${matchedActive.nameEn})` : 'غير محدد بدقة');
    const finalManufacturer = detectedManufacturer || (matchedMed ? matchedMed.manufacturer : 'غير محدد');
    const finalStrength = detectedStrength || (matchedMed ? matchedMed.strength : '');
    const finalDosageForm = detectedDosageForm || (matchedMed ? matchedMed.dosageForm : '');
    const finalElderlySummary = aiElderlyFriendlySummary || (matchedActive && matchedActive.indications.length > 0
      ? `هذا الدواء (${finalTradeName}) علاج آمن ومهم لصحتك، يُستخدم أساساً من أجل: ${matchedActive.indications[0]}. احرص على تناوله بانتظام.`
      : `علاج دوائي مخصص للمساعدة في تحسين صحتك والتخفيف من الأعراض. يرجى اتباع إرشادات الطبيب.`);

    const finalHowToTake = aiHowToTake || (matchedActive ? matchedActive.safeUsageAdvice : 'تناول الدواء مع كوب ماء كافٍ وفق توجيهات الطبيب أو الصيدلي.');
    const finalExpiryDate = aiExpiryDate || 'غير محدد على الجزء الظاهر من العلبة';

    return res.json({
      detectedTradeName: finalTradeName,
      detectedActiveIngredient: finalActiveIngredient,
      detectedManufacturer: finalManufacturer,
      detectedStrength: finalStrength,
      detectedDosageForm: finalDosageForm,
      drugClass: drugClass || (matchedActive ? matchedActive.drugClass : undefined),
      mechanismOfAction: mechanismOfAction || undefined,
      drugInteractions: aiDrugInteractions.length > 0 ? aiDrugInteractions : undefined,
      specialPopulations: aiSpecialPopulations || undefined,
      storageAdvice: aiStorageAdvice || undefined,
      confidenceScore,
      textClarity,
      rawOcrText,
      matchedMedicine: matchedMed || null,
      activeIngredientData: matchedActive || null,
      commercialAlternatives,
      indicationsSummary: aiIndications.length > 0 ? aiIndications : (matchedActive ? matchedActive.indications : ['يرجى مراجعة الصيدلي للتحقق من دواعي الاستعمال.']),
      sideEffectsSummary: aiSideEffects.length > 0 ? aiSideEffects : (matchedActive ? matchedActive.sideEffects : ['يرجى قراءة النشرة الداخلية للدواء.']),
      safetyWarnings: aiSafetyWarnings.length > 0 ? aiSafetyWarnings : (matchedActive ? matchedActive.warnings : ['هذا الدواء يجب أن يؤخذ تحت إشراف صيدلي أو طبيب.']),
      elderlyFriendlySummary: finalElderlySummary,
      howToTake: finalHowToTake,
      handwrittenNotes: aiHandwrittenNotes ? aiHandwrittenNotes.trim() : undefined,
      expiryDate: finalExpiryDate,
      requiresConfirmation,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error analyzing medicine:', error);
    const query = req.body?.manualQuery;
    const fallbackMed = query
      ? medicinesList.find(m => normalizeStr(m.tradeNameAr).includes(normalizeStr(query)) || normalizeStr(m.tradeNameEn).includes(normalizeStr(query)))
      : null;

    // Graceful fallback response instead of failing with 500
    return res.json({
      detectedTradeName: fallbackMed ? fallbackMed.tradeNameAr : 'دواء غير محدد',
      detectedActiveIngredient: fallbackMed ? `${fallbackMed.strength} (${fallbackMed.dosageForm})` : 'يرجى مراجعة الصيدلي للتحقق',
      detectedManufacturer: fallbackMed ? fallbackMed.manufacturer : 'غير محدد',
      detectedStrength: fallbackMed ? fallbackMed.strength : '',
      detectedDosageForm: fallbackMed ? fallbackMed.dosageForm : '',
      confidenceScore: fallbackMed ? 80 : 35,
      textClarity: 'low',
      rawOcrText: '',
      matchedMedicine: fallbackMed || null,
      activeIngredientData: null,
      commercialAlternatives: [],
      indicationsSummary: fallbackMed ? ['يرجى مراجعة الصيدلي للتحقق من دواعي الاستعمال.'] : ['تعذر استخراج دواعي الاستعمال تلقائياً من الخادم، يرجى استشارة الصيدلي.'],
      sideEffectsSummary: ['يرجى قراءة النشرة الداخلية للدواء بعناية.'],
      safetyWarnings: ['هذا الدواء يجب أن يؤخذ تحت إشراف صيدلي أو طبيب متخصص.'],
      elderlyFriendlySummary: 'يرجى التأكد من اسم الدواء مع الصيدلي قبل الاستخدام لتناول الجرعة السليمة.',
      howToTake: 'تناول الدواء مع كوب ماء كافٍ وفق توجيهات الطبيب أو الصيدلي.',
      expiryDate: 'غير محدد، يرجى تفقد تاريخ الصلاحية على العلبة',
      requiresConfirmation: true,
      serverFallbackUsed: true,
      errorMessage: error?.message || 'Server error',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// 2. API: Analyze Lab Test Sheet (OCR & Comparisons)
// ----------------------------------------------------
app.post('/api/analyze-lab', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', preselectedTests } = req.body;

    let extractedTests: Array<{
      testName: string;
      code: string;
      value: number;
      unit: string;
      referenceRangeText?: string;
      confidence: number;
    }> = [];

    let overallSummaryAr = '';
    let confidenceScore = 90;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const prompt = `
أنت استشاري طب المختبرات والتحاليل الطبية السريرية (Clinical Pathologist).
أمامك صورة لورقة تقرير معملي لتحاليل دم أو فحوصات مخبرية.
مهمتك استخراج نتائج الفحوصات بدقة بالغة. احذر تماماً من الخلط بين الأرقام (مثل 7 و 1 أو 3 و 8) والتزم بالقيم والأرقام الموجودة في الورقة.

استخرج كل تحليل متوفر بالتقرير مع الخصائص التالية:
- testName: اسم الفحص كما هو مكتوب (مثال: Hemoglobin, WBC, Fasting Blood Sugar, Creatinine, Cholesterol, HbA1c, ALT, AST, TSH, etc.)
- code: الرمز الطبي المعتاد (WBC, RBC, HGB, PLT, GLU_FASTING, HBA1C, CHOL, TRIG, HDL, LDL, CREAT, UREA, ALT, AST, VITD, TSH, CRP, إلخ).
- value: القيمة العددية المسجلة بالفحص كرقم عشري دقيق.
- unit: وحدة القياس المكتوبة (مثل g/dL, mg/dL, %, 10^3/uL, U/L, إلخ).
- referenceRangeText: النطاق المرجعي المكتوب في الورقة إن وجد (مثل "13.0 - 17.5").
- aiStatus: حالة النتيجة بالاعتماد على النطاق المرجعي المطبوع بالورقة ("NORMAL" أو "HIGH" أو "LOW").
- simplifiedExplanationAr: توضيح طبي مبسط ومباشر باللغة العربية للنتيجة ومقارنتها بالنسبة الطبيعية المطبوعة بالورقة.
- confidence: نسبة يقين قراءة الرقم من 0 إلى 100.
- causesOfElevation: الأسباب الطبية والفسيولوجية الشائعة لارتفاع هذا المؤشر.
- causesOfDecrease: الأسباب الطبية والفسيولوجية الشائعة لانخفاض هذا المؤشر.
- lifestyleAdvice: نصائح وتوجيهات غذائية ونمط حياة داعم لصحة هذا المؤشر.

اكتب أيضاً:
- overallSummaryAr: تلخيص طبي شامل ومطمئن باللغة العربية يشرح حالة التحاليل بشكل عام ومبسط للمريض مع تأكيد استشارة الطبيب.
- confidenceScore: متوسط دقة قراءة المستند ككل.

أخرج النتيجة بصيغة JSON فقط كالتالي:
{
  "overallSummaryAr": "string",
  "confidenceScore": number,
  "tests": [
    {
      "testName": "string",
      "code": "string",
      "value": number,
      "unit": "string",
      "referenceRangeText": "string",
      "aiStatus": "NORMAL",
      "simplifiedExplanationAr": "string",
      "confidence": number,
      "causesOfElevation": "string",
      "causesOfDecrease": "string",
      "lifestyleAdvice": "string"
    }
  ]
}
`;

      try {
        const parsed = await callGeminiVision(prompt, imageBase64, mimeType);

        extractedTests = parsed.tests || [];
        overallSummaryAr = parsed.overallSummaryAr || '';
        confidenceScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 90;
      } catch (aiErr: any) {
        console.error('Gemini Lab OCR error:', aiErr?.message || aiErr);
        confidenceScore = 70;
      }
    } else if (preselectedTests && Array.isArray(preselectedTests)) {
      extractedTests = preselectedTests;
      confidenceScore = 98;
    }

    // Process extracted tests against our reference database
    let normalCount = 0;
    let highCount = 0;
    let lowCount = 0;

    const processedTests: ParsedLabItem[] = extractedTests.map((item: any, idx) => {
      // Find matching reference by code or aliases
      const normName = normalizeStr(item.testName);
      const normCode = normalizeStr(item.code);

      const ref = labReferencesList.find(r => {
        if (normCode && normalizeStr(r.code) === normCode) return true;
        if (normName && normalizeStr(r.nameEn) === normName) return true;
        if (normName && normalizeStr(r.nameAr) === normName) return true;
        return r.aliases.some(alias => {
          const normAlias = normalizeStr(alias);
          return normName.includes(normAlias) || normAlias.includes(normName);
        });
      });

      let status: LabStatus = 'NORMAL';
      let simplifiedExplanation = '';

      if (ref) {
        if (item.value < ref.minValue) {
          status = 'LOW';
          lowCount++;
          simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) أقل من المعدل الطبيعي (${ref.minValue} - ${ref.maxValue}). ${ref.lowMeaningAr}`;
        } else if (item.value > ref.maxValue) {
          status = 'HIGH';
          highCount++;
          simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) أعلى من المعدل الطبيعي (${ref.minValue} - ${ref.maxValue}). ${ref.highMeaningAr}`;
        } else {
          status = 'NORMAL';
          normalCount++;
          simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) ضمن النطاق الطبيعي السليم (${ref.minValue} - ${ref.maxValue}). ${ref.normalDescriptionAr}`;
        }
      } else {
        // Rely on aiStatus and simplifiedExplanationAr extracted from the sheet instead of UNKNOWN
        const rawAiStat = String(item.aiStatus || '').toUpperCase();
        if (rawAiStat.includes('HIGH')) {
          status = 'HIGH';
          highCount++;
        } else if (rawAiStat.includes('LOW')) {
          status = 'LOW';
          lowCount++;
        } else {
          status = 'NORMAL';
          normalCount++;
        }
        simplifiedExplanation = item.simplifiedExplanationAr || `القيمة (${item.value} ${item.unit || ''}) حسب النطاق المرجعي للورقة (${item.referenceRangeText || 'المخبري'}). النتيجة تبدو ${status === 'NORMAL' ? 'ضمن النطاق الطبيعي للمختبر' : status === 'HIGH' ? 'أعلى من المعدل الطبيعي' : 'أقل من المعدل الطبيعي'}. يرجى مراجعة الطبيب.`;
      }

      return {
        id: `test-${idx}-${Date.now()}`,
        testName: item.testName,
        code: ref ? ref.code : (item.code || 'TEST'),
        extractedValue: Number(item.value),
        extractedUnit: item.unit || (ref ? ref.unit : ''),
        referenceRangeText: item.referenceRangeText || (ref ? `${ref.minValue} - ${ref.maxValue} ${ref.unit}` : undefined),
        status,
        refData: ref || undefined,
        simplifiedExplanationAr: simplifiedExplanation,
        confidence: item.confidence || confidenceScore,
        causesOfElevation: item.causesOfElevation || (ref ? ref.highMeaningAr : undefined),
        causesOfDecrease: item.causesOfDecrease || (ref ? ref.lowMeaningAr : undefined),
        lifestyleAdvice: item.lifestyleAdvice || (ref ? ref.homeAdviceAr : undefined),
      };
    });

    if (!overallSummaryAr) {
      if (highCount === 0 && lowCount === 0 && normalCount > 0) {
        overallSummaryAr = 'جميع النتائج المستخرجة تقع ضمن النطاقات المرجعية الطبيعية، ومؤشرات الفحص تبدو مطمئنة للغاية.';
      } else {
        overallSummaryAr = `تم فحص ${processedTests.length} نتائج مخبرية؛ وجد منها (${normalCount}) ضمن المعدل الطبيعي، و(${highCount}) أعلى من المعدل، و(${lowCount}) أقل من المعدل. يوصى بمناقشة هذه القيم مع الطبيب المعالج لوضع الخطة المناسبة.`;
      }
    }

    const requiresConfirmation = confidenceScore < 80;

    return res.json({
      tests: processedTests,
      overallSummaryAr,
      normalCount,
      highCount,
      lowCount,
      confidenceScore,
      requiresConfirmation,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analyzing lab sheet:', error);
    return res.json({
      tests: [],
      overallSummaryAr: 'تعذر قراءة التحاليل تلقائياً من الصورة الحالية. يرجى التأكد من وضوح إضاءة الورقة أو اختيار أحد الفحوصات الجاهزة من القائمة للتعرف على دلالاتها.',
      normalCount: 0,
      highCount: 0,
      lowCount: 0,
      confidenceScore: 30,
      requiresConfirmation: true,
      errorMessage: error?.message || 'Server error',
      serverFallbackUsed: true,
      timestamp: new Date().toISOString(),
    });
  }
});

// ----------------------------------------------------
// 3. API: Directory endpoints (Medicines & Lab References)
// ----------------------------------------------------
app.get('/api/medicines', (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.json(medicinesList);
  }
  const norm = normalizeStr(query);
  const filtered = medicinesList.filter(m => {
    return (
      normalizeStr(m.tradeNameAr).includes(norm) ||
      normalizeStr(m.tradeNameEn).includes(norm) ||
      normalizeStr(m.strength).includes(norm) ||
      normalizeStr(m.manufacturer).includes(norm)
    );
  });
  return res.json(filtered);
});

app.get('/api/medicines/:id/alternatives', (req: Request, res: Response) => {
  const { id } = req.params;
  const med = medicinesList.find(m => m.id === id);
  if (!med) {
    return res.status(404).json({ error: 'الدواء غير موجود' });
  }
  const active = activeIngredientsList.find(a => a.id === med.activeIngredientId);
  const alternatives = medicinesList.filter(m => m.activeIngredientId === med.activeIngredientId && m.id !== med.id);

  return res.json({
    medicine: med,
    activeIngredient: active,
    alternatives
  });
});

app.get('/api/active-ingredients', (req: Request, res: Response) => {
  return res.json(activeIngredientsList);
});

app.get('/api/lab-references', (req: Request, res: Response) => {
  const category = req.query.category as string;
  if (category) {
    return res.json(labReferencesList.filter(l => l.category === category));
  }
  return res.json(labReferencesList);
});

// ----------------------------------------------------
// 4. Vite Dev Server / Static Hosting
// ----------------------------------------------------
async function startServer() {
  const distDir = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);

  if (process.env.NODE_ENV === 'production' || hasDist) {
    if (hasDist) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.sendFile(distIndex);
      });
    } else {
      console.warn('Production mode but dist folder not found. Please run "npm run build" first.');
    }
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Vite dev middleware error:', viteErr);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medical Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
