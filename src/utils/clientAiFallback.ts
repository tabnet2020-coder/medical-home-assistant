import { GoogleGenAI } from '@google/genai';
import { medicinesList, activeIngredientsList, labReferencesList } from '../data/medicalDatabase';
import type { MedicineAnalysisResult, LabAnalysisResult, Medicine, ParsedLabItem, LabStatus } from '../types';

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

// Helper: Parse base64 string
function parseBase64(imageBase64: string, fallbackMime = 'image/jpeg') {
  let cleanBase64 = imageBase64;
  let detectedMime = fallbackMime;

  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    detectedMime = parts[0].replace(/^data:/, '').trim() || fallbackMime;
    cleanBase64 = parts[1].trim();
  } else if (imageBase64.includes(',')) {
    cleanBase64 = imageBase64.split(',')[1].trim();
  }
  return { cleanBase64, detectedMime };
}

// Helper: Clean JSON response from Gemini
function cleanJsonOutput(rawText: string): any {
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  let jsonSubstring = cleaned;
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(jsonSubstring);
}

// Get GoogleGenAI client on browser side
export function getBrowserGeminiClient(): GoogleGenAI | null {
  const apiKey =
    (typeof process !== 'undefined' &&
      (process.env?.GEMINI_API_KEY ||
        process.env?.API_KEY ||
        (process.env as any)?.GOOGLE_API_KEY)) ||
    ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) ||
    ((import.meta as any).env?.GEMINI_API_KEY as string) ||
    ((import.meta as any).env?.API_KEY as string) ||
    '';

  if (!apiKey) {
    console.warn('No Gemini API Key available on client-side');
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

// -----------------------------------------------------------------------------------
// Client-side Fallback: Analyze Medicine
// -----------------------------------------------------------------------------------
export async function analyzeMedicineClientFallback(
  imageBase64: string,
  mimeTypeFallback: string = 'image/jpeg'
): Promise<MedicineAnalysisResult> {
  const ai = getBrowserGeminiClient();
  if (!ai) {
    throw new Error('مفتاح الذكاء الاصطناعي غير متوفر في المتصفح.');
  }

  const { cleanBase64, detectedMime } = parseBase64(imageBase64, mimeTypeFallback);

  const prompt = `أنت صيدلي خبير ونظام بصري فائق الدقة متخصص في قراءة عبوات الأدوية والمكملات الغذائية والوصفات الطبية.
قم بفحص صورة علبة الدواء أو المكمل الغذائي بدقة بالغة واستخرج كافة البيانات بصيغة JSON حصراً بدون أي مقدمات أو أسطر إضافية:

{
  "detectedTradeName": "الاسم التجاري كما هو مطبوع على العبوة بالإنجليزية أو العربية (مثل: NosiFol, Panadol, Augmentin, Lipitor)",
  "detectedActiveIngredient": "المادة أو المواد الفعالة بدقة وتركيزها بالإنجليزية والعربية (مثال: Myo-Inositol, D-Chiro-Inositol, Folic Acid, Zinc أو Paracetamol)",
  "detectedManufacturer": "الشركة الصيدلانية المصنعة (مثل: Sakura, GSK, Pfizer, Julphar)",
  "detectedStrength": "التركيز الدوائي المطبوع (مثل: 500mg, 1000mg, Sachets)",
  "detectedDosageForm": "الشكل الصيدلاني (أقراص Tablets, أكياس فوارة Sachets, كبسولات Capsules, شراب Syrup)",
  "confidenceScore": 95,
  "textClarity": "high",
  "rawOcrText": "جميع النصوص المطبوعة أو المكتوبة بخط اليد المكتشفة",
  "drugClass": "التصنيف العلاجي الدقيق باللغة العربية",
  "mechanismOfAction": "آلية العمل الصيدلانية بأسلوب علمي مبسط",
  "indications": ["دواعي الاستعمال التفصيلية باللغة العربية"],
  "sideEffects": ["الآثار الجانبية الشائعة باللغة العربية"],
  "safetyWarnings": ["التحذيرات وموانع الاستعمال الهامة"],
  "drugInteractions": ["أبرز التفاعلات الدوائية الخطرة"],
  "specialPopulations": "إرشادات خاصة للحوامل، المرضعات، كبار السن، مرضى الكلى والكبد",
  "storageAdvice": "شروط الحفظ السليم والتخزين",
  "commercialAlternatives": [
    {
      "tradeNameAr": "اسم بديل متوفر في ليبيا والدول العربية",
      "tradeNameEn": "Alternative Name",
      "strength": "التركيز",
      "dosageForm": "الشكل",
      "manufacturer": "الشركة"
    }
  ],
  "elderlyFriendlySummary": "ملخص مبسط جداً ومطمئن باللغة العربية الواضحة (سطرين) موجه لكبير السن يشرح ما هو الدواء ولماذا يستخدم.",
  "howToTake": "طريقة وتوقيت الاستخدام الدقيق (مثلاً: كيس يذاب في نصف كوب ماء، قبل الأكل أو بعده، صباحاً أو مساءً).",
  "handwrittenNotes": "أي كتابة بخط يد الطبيب أو الصيدلي بالقلم على العلبة (مثلاً الجرعة أو التعليمات)، أو اتركه فارغاً إذا لم توجد.",
  "expiryDate": "تاريخ انتهاء الصلاحية المطبوع على العلبة بدقة (مثال: 08/2027 أو غير محدد)."
}`;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let aiData: any = null;
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
      aiData = cleanJsonOutput(rawText);
      if (aiData) break;
    } catch (err) {
      console.warn(`[Client AI Fallback] Error with model ${model}:`, err);
      lastError = err;
    }
  }

  if (!aiData) {
    throw lastError || new Error('فشلت معالجة الصورة عبر الذكاء الاصطناعي في المتصفح.');
  }

  const detectedTradeName = aiData.detectedTradeName || 'دواء تم فحصه بالذكاء الاصطناعي';
  const detectedActiveIngredient = aiData.detectedActiveIngredient || '';
  const detectedManufacturer = aiData.detectedManufacturer || '';
  const detectedStrength = aiData.detectedStrength || '';
  const detectedDosageForm = aiData.detectedDosageForm || '';
  const confidenceScore = Number(aiData.confidenceScore) || 90;
  const textClarity: 'high' | 'medium' | 'low' = aiData.textClarity || 'high';
  const rawOcrText = aiData.rawOcrText || '';

  // Match against local medicines database
  const normalizedTrade = normalizeStr(detectedTradeName);
  let matchedMed = medicinesList.find(
    m =>
      normalizeStr(m.tradeNameAr).includes(normalizedTrade) ||
      normalizeStr(m.tradeNameEn).includes(normalizedTrade) ||
      normalizedTrade.includes(normalizeStr(m.tradeNameEn)) ||
      normalizedTrade.includes(normalizeStr(m.tradeNameAr))
  );

  // Match against active ingredient
  let matchedActive = activeIngredientsList.find(a => {
    if (matchedMed && a.id === matchedMed.activeIngredientId) return true;
    const normAct = normalizeStr(detectedActiveIngredient);
    return (
      normAct.includes(normalizeStr(a.nameEn)) ||
      normAct.includes(normalizeStr(a.nameAr)) ||
      normalizeStr(a.nameEn).includes(normAct)
    );
  });

  // Calculate alternatives from database or AI
  let commercialAlternatives: Medicine[] = [];
  if (matchedActive) {
    commercialAlternatives = medicinesList.filter(
      m => m.activeIngredientId === matchedActive!.id && (!matchedMed || m.id !== matchedMed.id)
    );
  }

  if (commercialAlternatives.length === 0 && Array.isArray(aiData.commercialAlternatives)) {
    commercialAlternatives = aiData.commercialAlternatives.map((alt: any, idx: number) => ({
      id: `client-alt-${idx}`,
      tradeNameAr: typeof alt === 'string' ? alt : alt.tradeNameAr || alt.tradeName || 'دواء بديل',
      tradeNameEn: typeof alt === 'object' ? alt.tradeNameEn || alt.tradeName || '' : '',
      activeIngredientId: matchedActive?.id || 'gen',
      strength: (typeof alt === 'object' && alt.strength) || detectedStrength || 'مطابق',
      dosageForm: (typeof alt === 'object' && alt.dosageForm) || detectedDosageForm || 'مستحضر صيدلاني',
      manufacturer: (typeof alt === 'object' && alt.manufacturer) || 'شركة صيدلانية معتمدة',
      prescriptionRequired: matchedMed ? matchedMed.prescriptionRequired : true,
      descriptionAr: `دواء بديل مكافئ يحتوي على نفس المادة الفعالة (${detectedActiveIngredient || matchedActive?.nameAr || ''}).`,
    }));
  }

  const finalTradeName = detectedTradeName || (matchedMed ? matchedMed.tradeNameAr : 'دواء غير محدد');
  const finalActiveIngredient =
    detectedActiveIngredient || (matchedActive ? `${matchedActive.nameAr} (${matchedActive.nameEn})` : 'غير محدد بدقة');
  const finalManufacturer = detectedManufacturer || (matchedMed ? matchedMed.manufacturer : 'غير محدد');
  const finalStrength = detectedStrength || (matchedMed ? matchedMed.strength : '');
  const finalDosageForm = detectedDosageForm || (matchedMed ? matchedMed.dosageForm : '');
  const finalElderlySummary =
    aiData.elderlyFriendlySummary ||
    (matchedActive && matchedActive.indications.length > 0
      ? `هذا الدواء (${finalTradeName}) علاج آمن ومهم لصحتك، يُستخدم أساساً من أجل: ${matchedActive.indications[0]}. احرص على تناوله بانتظام.`
      : `علاج دوائي مخصص للمساعدة في تحسين صحتك والتخفيف من الأعراض. يرجى اتباع إرشادات الطبيب.`);

  const finalHowToTake =
    aiData.howToTake || (matchedActive ? matchedActive.safeUsageAdvice : 'تناول الدواء مع كوب ماء كافٍ وفق توجيهات الطبيب أو الصيدلي.');

  return {
    detectedTradeName: finalTradeName,
    detectedActiveIngredient: finalActiveIngredient,
    detectedManufacturer: finalManufacturer,
    detectedStrength: finalStrength,
    detectedDosageForm: finalDosageForm,
    drugClass: aiData.drugClass || (matchedActive ? matchedActive.drugClass : undefined),
    mechanismOfAction: aiData.mechanismOfAction || undefined,
    drugInteractions: Array.isArray(aiData.drugInteractions) ? aiData.drugInteractions : undefined,
    specialPopulations: aiData.specialPopulations || undefined,
    storageAdvice: aiData.storageAdvice || undefined,
    confidenceScore,
    textClarity,
    rawOcrText,
    matchedMedicine: matchedMed || undefined,
    activeIngredientData: matchedActive || undefined,
    commercialAlternatives,
    indicationsSummary:
      Array.isArray(aiData.indications) && aiData.indications.length > 0
        ? aiData.indications
        : matchedActive
        ? matchedActive.indications
        : ['يرجى مراجعة الصيدلي للتحقق من دواعي الاستعمال.'],
    sideEffectsSummary:
      Array.isArray(aiData.sideEffects) && aiData.sideEffects.length > 0
        ? aiData.sideEffects
        : matchedActive
        ? matchedActive.sideEffects
        : ['يرجى قراءة النشرة الداخلية للدواء.'],
    safetyWarnings:
      Array.isArray(aiData.safetyWarnings) && aiData.safetyWarnings.length > 0
        ? aiData.safetyWarnings
        : matchedActive
        ? matchedActive.warnings
        : ['هذا الدواء يجب أن يؤخذ تحت إشراف صيدلي أو طبيب.'],
    elderlyFriendlySummary: finalElderlySummary,
    howToTake: finalHowToTake,
    handwrittenNotes: aiData.handwrittenNotes ? String(aiData.handwrittenNotes).trim() : undefined,
    expiryDate: aiData.expiryDate || 'غير محدد على الجزء الظاهر من العلبة',
    requiresConfirmation: confidenceScore < 80,
    timestamp: new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------------
// Client-side Fallback: Analyze Lab Sheet
// -----------------------------------------------------------------------------------
export async function analyzeLabClientFallback(
  imageBase64: string,
  mimeTypeFallback: string = 'image/jpeg'
): Promise<LabAnalysisResult> {
  const ai = getBrowserGeminiClient();
  if (!ai) {
    throw new Error('مفتاح الذكاء الاصطناعي غير متوفر في المتصفح.');
  }

  const { cleanBase64, detectedMime } = parseBase64(imageBase64, mimeTypeFallback);

  const prompt = `أنت طبيب استشاري ومختص في التحاليل الطبية المخبرية.
قم بقراءة صورة تقرير التحليل الطبي المرفقة واستخرج جميع الفحوصات والنتائج والأرقام المطبوعة في ورقة التحليل بدقة عالية بصيغة JSON حصراً:

{
  "patientName": "اسم المريض إن وجد بالإنجليزية أو العربية",
  "labName": "اسم المختبر أو المستشفى إن وجد",
  "testDate": "تاريخ الفحص إن وجد",
  "confidenceScore": 95,
  "tests": [
    {
      "testName": "اسم الفحص (مثل: Hemoglobin, Fasting Glucose, ALT, Creatinine)",
      "code": "رمز التحليل القياسي إن وجد (مثل: HGB, GLU, ALT, CREAT, WBC)",
      "value": 13.5,
      "unit": "g/dL",
      "referenceRangeText": "النطاق المرجعي الطبيعي المطبوع في ورقة التحليل نفسها (مثل: 12.0 - 16.0 g/dL)",
      "aiStatus": "NORMAL أو HIGH أو LOW حسب النطاق المرجعي للورقة",
      "simplifiedExplanationAr": "شرح طبي مبسط جداً ومطمئن باللغة العربية للنتيجة بناءً على النطاق المرجعي المطبوع",
      "causesOfElevation": "أسباب الارتفاع إن كان مرتفعاً",
      "causesOfDecrease": "أسباب الانخفاض إن كان منخفضاً",
      "lifestyleAdvice": "نصيحة نمط حياة أو تغذية سريعة للمريض"
    }
  ],
  "overallSummaryAr": "ملخص شامل ومطمئن لحالة التحاليل بوجه عام باللغة العربية الواضحة دون تهويل."
}`;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  let aiData: any = null;
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
      aiData = cleanJsonOutput(rawText);
      if (aiData) break;
    } catch (err) {
      console.warn(`[Client AI Lab Fallback] Error with model ${model}:`, err);
      lastError = err;
    }
  }

  if (!aiData) {
    throw lastError || new Error('فشلت معالجة ورقة التحليل عبر الذكاء الاصطناعي في المتصفح.');
  }

  const rawTests: any[] = Array.isArray(aiData.tests) ? aiData.tests : [];
  let normalCount = 0;
  let highCount = 0;
  let lowCount = 0;

  const processedTests: ParsedLabItem[] = rawTests.map((item, idx) => {
    const rawName = (item.testName || '').toLowerCase();
    const rawCode = (item.code || '').toUpperCase();

    // Match with local reference guide
    const ref = labReferencesList.find(
      r =>
        r.code.toUpperCase() === rawCode ||
        r.aliases.some(a => a.toLowerCase() === rawName || a.toLowerCase() === rawCode.toLowerCase()) ||
        rawName.includes(r.nameEn.toLowerCase())
    );

    let status: LabStatus = 'NORMAL';
    let simplifiedExplanation = '';

    const numVal = Number(item.value);

    if (ref && !isNaN(numVal)) {
      if (numVal < ref.minValue) {
        status = 'LOW';
        lowCount++;
        simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) أقل من المعدل الطبيعي (${ref.minValue} - ${ref.maxValue}). ${ref.lowMeaningAr}`;
      } else if (numVal > ref.maxValue) {
        status = 'HIGH';
        highCount++;
        simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) أعلى من المعدل الطبيعي (${ref.minValue} - ${ref.maxValue}). ${ref.highMeaningAr}`;
      } else {
        status = 'NORMAL';
        normalCount++;
        simplifiedExplanation = `القيمة (${item.value} ${item.unit || ref.unit}) ضمن النطاق الطبيعي السليم (${ref.minValue} - ${ref.maxValue}). ${ref.normalDescriptionAr}`;
      }
    } else {
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
      simplifiedExplanation =
        item.simplifiedExplanationAr ||
        `القيمة (${item.value} ${item.unit || ''}) حسب النطاق المرجعي للورقة (${item.referenceRangeText || 'المخبري'}). النتيجة تبدو ${
          status === 'NORMAL' ? 'ضمن النطاق الطبيعي' : status === 'HIGH' ? 'أعلى من المعدل' : 'أقل من المعدل'
        }. يرجى مراجعة الطبيب.`;
    }

    return {
      id: `client-test-${idx}-${Date.now()}`,
      testName: item.testName || 'فحص معملي',
      code: ref ? ref.code : item.code || 'TEST',
      extractedValue: !isNaN(numVal) ? numVal : 0,
      extractedUnit: item.unit || (ref ? ref.unit : ''),
      referenceRangeText: item.referenceRangeText || (ref ? `${ref.minValue} - ${ref.maxValue} ${ref.unit}` : undefined),
      status,
      refData: ref || undefined,
      simplifiedExplanationAr: simplifiedExplanation,
      confidence: item.confidence || Number(aiData.confidenceScore) || 90,
      causesOfElevation: item.causesOfElevation || (ref ? ref.highMeaningAr : undefined),
      causesOfDecrease: item.causesOfDecrease || (ref ? ref.lowMeaningAr : undefined),
      lifestyleAdvice: item.lifestyleAdvice || (ref ? ref.homeAdviceAr : undefined),
    };
  });

  let overallSummaryAr = aiData.overallSummaryAr || '';
  if (!overallSummaryAr) {
    if (highCount === 0 && lowCount === 0 && normalCount > 0) {
      overallSummaryAr = 'جميع النتائج المستخرجة تقع ضمن النطاقات المرجعية الطبيعية، ومؤشرات الفحص تبدو مطمئنة للغاية.';
    } else {
      overallSummaryAr = `تم فحص ${processedTests.length} نتائج مخبرية؛ وجد منها (${normalCount}) ضمن المعدل الطبيعي، و(${highCount}) أعلى من المعدل، و(${lowCount}) أقل من المعدل. يوصى بمناقشة هذه القيم مع الطبيب المعالج.`;
    }
  }

  return {
    patientName: aiData.patientName,
    labName: aiData.labName,
    testDate: aiData.testDate,
    tests: processedTests,
    overallSummaryAr,
    normalCount,
    highCount,
    lowCount,
    confidenceScore: Number(aiData.confidenceScore) || 90,
    requiresConfirmation: (Number(aiData.confidenceScore) || 90) < 80,
    timestamp: new Date().toISOString(),
  };
}
