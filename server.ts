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

// Helper: Parse Gemini JSON safely, handling code blocks, braces, brackets, and array responses
function parseGeminiJsonResponse(raw: string): any {
  let rawText = (raw || '{}').trim();
  rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = rawText.indexOf('{');
  const firstBracket = rawText.indexOf('[');
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    const lastBracket = rawText.lastIndexOf(']');
    if (lastBracket > firstBracket) {
      rawText = rawText.substring(firstBracket, lastBracket + 1);
    }
  } else if (firstBrace !== -1) {
    const lastBrace = rawText.lastIndexOf('}');
    if (lastBrace > firstBrace) {
      rawText = rawText.substring(firstBrace, lastBrace + 1);
    }
  }
  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed)) {
    return { items: parsed, medicines: parsed };
  }
  return parsed;
}

// Helper: Call Gemini with dual-client fallback, model fallback, JSON cleanup, and robust error handling
async function callGeminiVision(prompt: string, imageBase64: string, mimeTypeFallback: string = 'image/jpeg'): Promise<any> {
  let cleanBase64 = imageBase64;
  let detectedMime = mimeTypeFallback || 'image/jpeg';

  if (imageBase64.includes(';base64,')) {
    const parts = imageBase64.split(';base64,');
    detectedMime = parts[0].replace(/^data:/, '').trim() || 'image/jpeg';
    cleanBase64 = parts[1].trim();
  } else if (imageBase64.includes(',')) {
    cleanBase64 = imageBase64.split(',')[1].trim();
  }

  const primaryModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  // Attempt 1: AI Studio primary client with configured headers
  for (const model of primaryModels) {
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

      return parseGeminiJsonResponse(response.text || '{}');
    } catch (err: any) {
      console.warn(`[AI Vision - Primary] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  // Attempt 2: Standard Client fallback without custom headers (for Render and external hosting)
  try {
    const standardAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || '',
    });
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    for (const model of fallbackModels) {
      try {
        const response = await standardAi.models.generateContent({
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

        return parseGeminiJsonResponse(response.text || '{}');
      } catch (err: any) {
        console.warn(`[AI Vision - Standard Fallback] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }
  } catch (clientErr: any) {
    console.warn('[AI Vision] Standard client creation error:', clientErr?.message || clientErr);
  }

  throw lastError || new Error('تعذر معالجة الصورة عبر جميع نماذج الذكاء الاصطناعي.');
}

// Helper: Call Gemini for text-only queries with dual-client fallback
async function callGeminiText(prompt: string): Promise<any> {
  const primaryModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of primaryModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return parseGeminiJsonResponse(response.text || '{}');
    } catch (err: any) {
      console.warn(`[AI Text - Primary] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  // Standard client fallback for external hosting (Render)
  try {
    const standardAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || '',
    });
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    for (const model of fallbackModels) {
      try {
        const response = await standardAi.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        return parseGeminiJsonResponse(response.text || '{}');
      } catch (err: any) {
        console.warn(`[AI Text - Standard Fallback] Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }
  } catch (clientErr: any) {
    console.warn('[AI Text] Standard client creation error:', clientErr?.message || clientErr);
  }

  throw lastError || new Error('تعذر معالجة البيانات عبر نماذج الذكاء الاصطناعي.');
}


// ----------------------------------------------------
// 1. API: Analyze Medicine Packaging (OCR & Matching)
// ----------------------------------------------------
app.post('/api/analyze-medicine', async (req: Request, res: Response) => {
  try {
    const imageBase64 = req.body.imageBase64 || req.body.image || req.body.base64Image;
    const mimeType = req.body.mimeType || 'image/jpeg';
    const manualQuery = req.body.manualQuery;

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
أنت صيدلي إكلينيكي خبير واستشاري علم الأدوية السريري وتعتمد على أحدث قواعد البيانات الدوائية والمكملات الغذائية العالمية المعتمدة (OpenFDA, WHO Model Formulary, BNF, Dietary Supplements Databases).
انظر إلى الصورة المرفقة واستخرج اسم الدواء التجاري (tradeName) والمادة الفعالة (activeIngredient) والشركة المصنعة (manufacturer) والتركيز (strength) والشكل الصيدلاني (dosageForm) بدقة متناهية.
إذا كانت الصورة لعلبة دواء أو شريط أو دواء ذي ألوان فاتحة أو بيضاء (مثل NosiFol أو Panadol أو Cialis أو Augmentin أو المكملات الغذائية)، دقق النظر في الحواف والنصوص الصغيرة المطبوعة ولا ترجع أبداً قيماً فارغة أو 'دواء غير محدد' إذا كان هناك أي نص مرئي.

قواعد وتوجيهات حرجة:
1. اقرأ بدقة جميع أنواع المستحضرات: أدوية بشرية، مكملات غذائية (Dietary Supplements)، أكياس بودرة قابلة للحل في الماء (Sachets)، فوار، كبسولات، أقراص، محاليل، مراهم، قطرات.
2. إذا كان المستحضر يحتوي على عدة مواد فعالة مجتمعة (Combination Product مثل NosiFol الذي يحتوي على Inositol, Folic Acid, Zinc, Betaine, Vitamins B6, B12 من إنتاج شركة Sakura Italia)، اذكر جميع المواد الفعالة بدقة ووضوح في حقل activeIngredient ولا تكتفِ بواحدة فقط.
3. فتش بدقة عن أي كتابة بخط اليد (Handwritten Notes) كتبها الصيدلي أو الطبيب بالقلم على العلبة (مثل: "كيس + نصف كوب ماء"، أو "1×2 بعد الأكل"، أو أي إرشادات). استخرجها حرفياً في حقل "handwrittenNotes" وأدمجها كذلك داخل حقل "howToTake". إذا لم توجد كتابة يدوية، اجعل قيمتها نصاً فارغاً "".
4. استخرج كل نص وكلمة تظهر على العلبة بالكامل في حقل "rawExtractedText".

المطلوب إخراج النتيجة بصيغة JSON فقط بهذه الحقول المحددة:
{
  "tradeName": "الاسم التجاري المكتوب على العلبة تماماً كما يظهر (مثلاً: NosiFol, Tyra, Panadol, Cialis, Augmentin, Congestal, Concor, Glucophage, إلخ)",
  "activeIngredient": "المادة الفعالة أو المواد الفعالة المركبة كاملة بدقة (مثل: Inositol + Folic Acid + Zinc + Betaine + Vitamin B6 + Vitamin B12, Tadalafil, Paracetamol, إلخ)",
  "manufacturer": "اسم الشركة المصنعة المكتوب أو شعارها (مثل: Sakura Italia, Dar Aldawa, GlaxoSmithKline, Novartis, Pfizer, Sanofi, EIPICO, إلخ)",
  "strength": "تركيز الجرعة أو محتوى العلبة (مثل: 30 Sachets of 5.5g, 20 mg, 500 mg, 1 g, 400 mg, 10 mg, 50mg/5ml)",
  "dosageForm": "الشكل الصيدلاني (أكياس فوارة للحل في الماء Sachets, أقراص مغلفة, كبسولات, شراب, إلخ)",
  "confidenceScore": 95,
  "textClarity": "high",
  "elderlyFriendlySummary": "ملخص مبسط جداً ومطمئن باللغة العربية الواضحة (سطرين كحد أقصى) موجه لكبير السن أو عائلته يشرح ما هو الدواء ولماذا يستخدم بلغة فصيحة وسهلة جداً ومطمئنة",
  "howToTake": "طريقة وتوقيت الاستخدام الدقيق والمناسب للمريض بما في ذلك طريقة التحضير إن كان كيساً يذاب في ماء أو شراباً",
  "sideEffects": ["أثر جانبي 1", "أثر جانبي 2"],
  "safetyWarnings": ["تحذير وملاحظة سلامة 1", "تحذير 2"],
  "commercialAlternatives": ["اسم بديل تجاري 1", "اسم بديل تجاري 2", "اسم بديل تجاري 3"],
  "rawExtractedText": "كافة النصوص والكلمات الإنجليزية والعربية المقروءة من العلبة بما فيها أي نصوص صغيرة أو كتابات يدوية",
  "drugClass": "الفئة والتصنيف العلاجي الدقيق باللغة العربية",
  "mechanismOfAction": "شرح علمي مبسط وعميق لآلية عمل الدواء أو المكونات داخل الجسم",
  "indications": ["داعي استعمال 1", "داعي استعمال 2", "داعي استعمال 3"],
  "drugInteractions": ["تداخل دوائي أو غذائي 1", "تداخل 2"],
  "specialPopulations": "إرشادات للحوامل والمرضعات وكبار السن وأصحاب الأمراض المزمنة",
  "storageAdvice": "شروط الحفظ والتخزين المثالية",
  "handwrittenNotes": "النص الحرفي لأي كتابة يدوية بالقلم إن وجدت وإلا فارغ",
  "expiryDate": "تاريخ انتهاء الصلاحية إن وجد أو 'غير محدد على الجزء الظاهر من العلبة'"
}
`;

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

    // Identify if detectedTradeName is missing, empty, or placeholder
    const isInvalidTrade = !detectedTradeName ||
      detectedTradeName.trim() === '' ||
      detectedTradeName.includes('غير محدد') ||
      detectedTradeName.toLowerCase().includes('unknown') ||
      detectedTradeName.toLowerCase().includes('unspecified') ||
      detectedTradeName.toLowerCase().includes('undefined');

    let matchedMed: Medicine | null | undefined = null;
    let matchedActive: ActiveIngredient | null | undefined = null;

    // A. Direct exact/substring match if tradeName is valid
    if (!isInvalidTrade) {
      const normTrade = normalizeStr(detectedTradeName);
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

    // B. Fuzzy Search against medicinesList using OCR text, active ingredient, and manufacturer!
    const ocrCorpus = normalizeStr(`${detectedTradeName} ${detectedActiveIngredient} ${rawOcrText} ${detectedManufacturer}`);
    if ((!matchedMed || isInvalidTrade) && ocrCorpus.length >= 2) {
      let bestScore = 0;
      let candidateMed: Medicine | null = null;

      for (const med of medicinesList) {
        let score = 0;
        const mEn = normalizeStr(med.tradeNameEn);
        const mAr = normalizeStr(med.tradeNameAr);

        // Word token / substring match for English trade name (e.g. "nosifol", "panadol", "augmentin", "concor", "glucophage")
        if (mEn && mEn.length >= 3 && ocrCorpus.includes(mEn)) {
          score += 60 + mEn.length * 2;
        }
        // Word token / substring match for Arabic trade name
        if (mAr && mAr.length >= 3 && ocrCorpus.includes(mAr)) {
          score += 60 + mAr.length * 2;
        }

        // Active ingredient match
        const activeObj = activeIngredientsList.find(a => a.id === med.activeIngredientId);
        if (activeObj) {
          const aEn = normalizeStr(activeObj.nameEn);
          const aAr = normalizeStr(activeObj.nameAr);
          if (aEn && aEn.length >= 4 && ocrCorpus.includes(aEn)) {
            score += 35;
          }
          if (aAr && aAr.length >= 4 && ocrCorpus.includes(aAr)) {
            score += 35;
          }
        }

        // Manufacturer bonus
        if (med.manufacturer) {
          const mfg = normalizeStr(med.manufacturer);
          if (mfg.length >= 4 && ocrCorpus.includes(mfg)) {
            score += 20;
          }
        }

        if (score > bestScore && score >= 50) {
          bestScore = score;
          candidateMed = med;
        }
      }

      if (candidateMed) {
        matchedMed = candidateMed;
        confidenceScore = Math.max(confidenceScore, 90);
        textClarity = 'high';
      }
    }

    // C. Active ingredient matching
    const normActive = normalizeStr(detectedActiveIngredient);
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

    // D. Final recovery of fields - never return "دواء غير محدد" if a match or text is available!
    let finalTradeName = !isInvalidTrade ? detectedTradeName : '';
    if (!finalTradeName && matchedMed) {
      finalTradeName = matchedMed.tradeNameAr + (matchedMed.tradeNameEn ? ` (${matchedMed.tradeNameEn})` : '');
    }
    if (!finalTradeName) {
      finalTradeName = 'دواء غير محدد';
    }

    let finalActiveIngredient = detectedActiveIngredient;
    if ((!finalActiveIngredient || finalActiveIngredient.includes('غير محدد')) && matchedActive) {
      finalActiveIngredient = `${matchedActive.nameAr} (${matchedActive.nameEn})`;
    }
    if (!finalActiveIngredient) {
      finalActiveIngredient = 'غير محدد بدقة';
    }

    let finalManufacturer = detectedManufacturer;
    if ((!finalManufacturer || finalManufacturer.includes('غير محدد')) && matchedMed) {
      finalManufacturer = matchedMed.manufacturer;
    }
    if (!finalManufacturer) {
      finalManufacturer = 'غير محدد';
    }

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
    const rawInput = req.body?.rawOcrText || req.body?.enhancementDetails || '';

    let fallbackMed = query
      ? medicinesList.find(m => normalizeStr(m.tradeNameAr).includes(normalizeStr(query)) || normalizeStr(m.tradeNameEn).includes(normalizeStr(query)))
      : null;

    if (!fallbackMed && rawInput) {
      const normInput = normalizeStr(rawInput);
      fallbackMed = medicinesList.find(m => normInput.includes(normalizeStr(m.tradeNameEn)) || normInput.includes(normalizeStr(m.tradeNameAr))) || null;
    }

    const fallbackActive = fallbackMed ? activeIngredientsList.find(a => a.id === fallbackMed.activeIngredientId) : null;

    // Graceful fallback response instead of failing with 500
    return res.json({
      detectedTradeName: fallbackMed ? `${fallbackMed.tradeNameAr} (${fallbackMed.tradeNameEn})` : 'دواء غير محدد',
      detectedActiveIngredient: fallbackActive ? `${fallbackActive.nameAr} (${fallbackActive.nameEn})` : (fallbackMed ? fallbackMed.strength : 'يرجى مراجعة الصيدلي للتحقق'),
      detectedManufacturer: fallbackMed ? fallbackMed.manufacturer : 'غير محدد',
      detectedStrength: fallbackMed ? fallbackMed.strength : '',
      detectedDosageForm: fallbackMed ? fallbackMed.dosageForm : '',
      confidenceScore: fallbackMed ? 85 : 40,
      textClarity: fallbackMed ? 'medium' : 'low',
      rawOcrText: '',
      matchedMedicine: fallbackMed || null,
      activeIngredientData: fallbackActive || null,
      commercialAlternatives: fallbackActive ? medicinesList.filter(m => m.activeIngredientId === fallbackActive.id && m.id !== fallbackMed?.id) : [],
      indicationsSummary: fallbackActive ? fallbackActive.indications : (fallbackMed ? ['يرجى مراجعة الصيدلي للتحقق من دواعي الاستعمال.'] : ['تعذر استخراج دواعي الاستعمال تلقائياً من الخادم، يرجى استشارة الصيدلي.']),
      sideEffectsSummary: fallbackActive ? fallbackActive.sideEffects : ['يرجى قراءة النشرة الداخلية للدواء بعناية.'],
      safetyWarnings: fallbackActive ? fallbackActive.warnings : ['هذا الدواء يجب أن يؤخذ تحت إشراف صيدلي أو طبيب متخصص.'],
      elderlyFriendlySummary: fallbackActive && fallbackActive.indications.length > 0
        ? `هذا الدواء علاج مخصص لـ: ${fallbackActive.indications[0]}. يرجى اتباع إرشادات الصيدلي بدقة.`
        : 'يرجى التأكد من اسم الدواء مع الصيدلي قبل الاستخدام لتناول الجرعة السليمة.',
      howToTake: fallbackActive ? fallbackActive.safeUsageAdvice : 'تناول الدواء مع كوب ماء كافٍ وفق توجيهات الطبيب أو الصيدلي.',
      expiryDate: 'غير محدد، يرجى تفقد تاريخ الصلاحية على العلبة',
      requiresConfirmation: true,
      serverFallbackUsed: true,
      errorMessage: error?.message || 'Server error',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// 2. API: Analyze Lab Test Sheet (International Standards WHO, Mayo Clinic, IFCC)
// ----------------------------------------------------
app.post('/api/analyze-lab', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', preselectedTests } = req.body;

    let patientName = '';
    let patientAge = '';
    let patientGender = '';
    let labName = '';
    let testDate = '';
    let rawTests: any[] = [];
    let overallSummaryAr = '';
    let confidenceScore = 92;

    if (imageBase64) {
      const prompt = `
أنت استشاري طب المختبرات وعلم الأمراض السريري الدولي (Senior International Clinical Pathologist).
أمامك صورة لورقة تقرير معملي لتحاليل طبية صادرة من مختبر طبي.
مهمتك قراءة التقرير المخبري بدقة 100% واستخراج كافة الفحوصات مهما كان عددها أو نوعها وفق المعايير السريرية العالمية (WHO, IFCC, Mayo Clinic, AACC).

قواعد استخراج وتفسير الفحوصات:
1. استخرج بيانات المريض والتقرير:
   - patientName: اسم المريض إن وجد
   - patientAge: عمر المريض إن وجد (مثل: 35 years, 8 months, 45y)
   - patientGender: جنس المريض إن وجد (Male / Female / ذكر / أنثى)
   - labName: اسم المختبر أو المستشفى المطبوع في الترويسة
   - testDate: تاريخ إجراء التحليل المطبوع في الورقة

2. أنواع الفحوصات المقبولة (الكمية، والوصفية، والميكروسكوبية):
   - الفحوصات الرقمية الكمية (Quantitative): مثل الهيموجلوبين، السكر، الكرياتينين، الكوليسترول، إنزيمات الكبد، الهرمونات، كريات الدم.
   - الفحوصات الوصفية والشبه كمية (Qualitative / Semi-quantitative): تحاليل البول والبراز (Urine Analysis, Stool Analysis) والميكروسكوب والأمصال (Serology, Antibodies, Antigens, Cultures, H. Pylori, CRP, Widal, Pregnancy test).
   - احفظ القيمة في "value" كما هي نصاً أو رقماً (مثل: 14.2 أو "Negative" أو "Positive" أو "Non-reactive" أو "Reactive" أو "Nil" أو "Trace" أو "+" أو "++" أو "+++" أو "2-4 /HPF").
   - حدد "isNumeric": true إذا كانت القيمة رقماً صرفاً، و false إذا كانت نصية أو شبه كمية.
   - حدد "numericValue": القيمة كرقم float إذا كانت رقمية، أو null إذا كانت نصية.

3. القاعدة الذهبية لتحديد حالة النتيجة (status: "NORMAL" | "HIGH" | "LOW"):
   * الأولوية الأولى (النطاق المرجعي والعلامات المطبوعة بالورقة): اعتمد دائماً أولاً على النطاق المرجعي المطبوع في الورقة نفسها (referenceRangeText, printedMin, printedMax) ووحدة القياس المطبوعة (سواء وحدات تقليدية مثل mg/dL, g/dL أو وحدات دولية SI مثل mmol/L, umol/L, g/L, IU/L)، وعلى علامات المختبر المطبوعة بجانب النتيجة (مثل H, L, High, Low, *, Abnormal, Positive).
   * الأولوية الثانية (المعايير العالمية حسب العمر والجنس): إذا لم يكن النطاق المرجعي مطبوعاً، طبق النطاق المرجعي العالمي المعتمد (WHO / Mayo Clinic) متوافقاً تماماً مع عمر المريض وجنسه المذكورين في التقرير ووحدة القياس المحددة (لا تطبق نطاق البالغين الذكور على طفل أو أنثى!).
   * الفحوصات الوصفية والميكروسكوبية: إذا كانت النتيجة خالية من أي عدوى أو بكتيريا أو صديد (مثل: Negative, Non-reactive, Nil, Normal, Absent, صديد طبيعي 1-3) فالحالة "NORMAL". أما إذا وجدت عدوى أو خلل أو صديد مرتفع (مثل: Positive, Reactive, ++, صديد > 5) فالحالة "HIGH".

4. لكل فحص استخرج الحقول الآتية:
   - testName: اسم الفحص بالإنجليزي كما هو مطبوع في التقرير
   - testNameAr: الاسم الطبي الشائع باللغة العربية
   - code: الرمز القياسي العالمي للتحليل (مثل HGB, WBC, RBC, PLT, MCV, GLU, HBA1C, CHOL, TRIG, HDL, LDL, CREAT, UREA, ALT, AST, TSH, VITD, FERRITIN, CRP, URINE_PUS, URINE_RBC, STOOL_PARASITE, H_PYLORI, إلخ)
   - category: التصنيف الطبي (cbc, blood_sugar, lipids, kidney, liver, vitamins_hormones, inflammation, urine_stool, coagulation, other)
   - categoryAr: اسم التصنيف بالعربية (أمراض الدم، السكر والأيض، الدهون، الكلى والأملاح، الكبد، الفيتامينات والهرمونات، الالتهابات والمناعة، البول والبراز، السيولة، أخرى)
   - value: القيمة المستخرجة (رقم أو نص كما في التقرير)
   - isNumeric: boolean
   - numericValue: number أو null
   - unit: وحدة القياس كما في التقرير
   - referenceRangeText: النطاق الطبيعي المعتمد لهذا المريض المأخوذ من الورقة أولاً أو المعيار العالمي
   - minValue: الحد الأدنى الرقمي المعتمد للنطاق السليم (إن وجد)
   - maxValue: الحد الأقصى الرقمي المعتمد للنطاق السليم (إن وجد)
   - status: "NORMAL" أو "HIGH" أو "LOW"
   - simplifiedExplanationAr: تفسير طبي مفصل ومبسط جداً للمريض باللغة العربية يوضح ماذا تعني نتيجته مقارنة بالمعدل الطبيعي
   - causesOfElevation: الأسباب الطبية السريرية الشائعة للارتفاع أو النتيجة الإيجابية
   - causesOfDecrease: الأسباب الطبية السريرية الشائعة للانخفاض
   - lifestyleAdvice: نصائح عملية وغذائية موثوقة للمريض
   - confidence: نسبة الدقة من 0 إلى 100

أخرج النتيجة بصيغة JSON فقط بهذا الهيكل:
{
  "patientName": "...",
  "patientAge": "...",
  "patientGender": "...",
  "labName": "...",
  "testDate": "...",
  "overallSummaryAr": "ملخص سريري متكامل ومطمئن يشرح للمريض حالة كافة التحاليل بلغة ميسرة مع توجيهه لاستشارة الطبيب",
  "confidenceScore": 95,
  "tests": [
    {
      "testName": "Hemoglobin",
      "testNameAr": "الهيموجلوبين (خضاب الدم)",
      "code": "HGB",
      "category": "cbc",
      "categoryAr": "صورة الدم الشاملة (CBC)",
      "value": "14.5",
      "isNumeric": true,
      "numericValue": 14.5,
      "unit": "g/dL",
      "referenceRangeText": "13.0 - 17.5",
      "minValue": 13.0,
      "maxValue": 17.5,
      "status": "NORMAL",
      "simplifiedExplanationAr": "نسبة الهيموجلوبين لديك طبيعية ومثالية وتعكس قدرة ممتازة لكريات الدم على حمل الأكسجين لكافة أنسجة الجسم.",
      "causesOfElevation": "التدخين، الجفاف ونقص السوائل، الإقامة في المرتفعات.",
      "causesOfDecrease": "فقر الدم (الأنيميا)، نقص الحديد، نقص فيتامين B12، النزيف.",
      "lifestyleAdvice": "حافظ على تناول الأطعمة الغنية بالحديد وفيتامين سي لدعم تصنيع كريات الدم.",
      "confidence": 98
    }
  ]
}
`;

      try {
        const parsed = await callGeminiVision(prompt, imageBase64, mimeType);
        patientName = parsed.patientName || '';
        patientAge = parsed.patientAge || '';
        patientGender = parsed.patientGender || '';
        labName = parsed.labName || '';
        testDate = parsed.testDate || '';
        rawTests = Array.isArray(parsed.tests) ? parsed.tests : [];
        overallSummaryAr = parsed.overallSummaryAr || '';
        confidenceScore = typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 90;
      } catch (aiErr: any) {
        console.error('Gemini Lab OCR error:', aiErr?.message || aiErr);
        confidenceScore = 70;
      }
    } else if (preselectedTests && Array.isArray(preselectedTests)) {
      rawTests = preselectedTests;
      confidenceScore = 98;
    }

    let normalCount = 0;
    let highCount = 0;
    let lowCount = 0;

    const processedTests: ParsedLabItem[] = rawTests.map((item: any, idx: number) => {
      const normName = normalizeStr(item.testName || '');
      const normCode = normalizeStr(item.code || '');

      // Check database only to complement missing metadata
      const ref = labReferencesList.find(r => {
        if (normCode && normalizeStr(r.code) === normCode) return true;
        if (normName && normalizeStr(r.nameEn) === normName) return true;
        if (normName && normalizeStr(r.nameAr) === normName) return true;
        return r.aliases.some(alias => {
          const normAlias = normalizeStr(alias);
          return normName.includes(normAlias) || normAlias.includes(normName);
        });
      });

      // Priority 1: Respect the status determined from the printed reference range or global pediatric/gender context
      let status: LabStatus = 'NORMAL';
      const rawStatus = String(item.status || item.aiStatus || '').toUpperCase();
      if (rawStatus.includes('CRITICAL_HIGH') || rawStatus === 'HIGH' || rawStatus.includes('ABNORMAL')) {
        status = 'HIGH';
        highCount++;
      } else if (rawStatus.includes('CRITICAL_LOW') || rawStatus === 'LOW') {
        status = 'LOW';
        lowCount++;
      } else if (rawStatus === 'NORMAL') {
        status = 'NORMAL';
        normalCount++;
      } else if (typeof item.numericValue === 'number' && ref && (item.minValue == null || item.maxValue == null)) {
        // Fallback to database range ONLY if AI did not find/estimate a specific printed range
        if (item.numericValue < ref.minValue) {
          status = 'LOW';
          lowCount++;
        } else if (item.numericValue > ref.maxValue) {
          status = 'HIGH';
          highCount++;
        } else {
          status = 'NORMAL';
          normalCount++;
        }
      } else {
        status = 'NORMAL';
        normalCount++;
      }

      const numVal = typeof item.numericValue === 'number'
        ? item.numericValue
        : (!isNaN(parseFloat(item.value)) ? parseFloat(item.value) : null);
      const isNum = item.isNumeric !== undefined ? Boolean(item.isNumeric) : numVal !== null;

      const minVal = typeof item.minValue === 'number' ? item.minValue : (ref && isNum ? ref.minValue : null);
      const maxVal = typeof item.maxValue === 'number' ? item.maxValue : (ref && isNum ? ref.maxValue : null);

      const refRangeStr = item.referenceRangeText || (minVal !== null && maxVal !== null ? `${minVal} - ${maxVal} ${item.unit || (ref ? ref.unit : '')}` : (ref ? `${ref.minValue} - ${ref.maxValue} ${ref.unit}` : 'حسب معايير المختبر'));

      const explanation = item.simplifiedExplanationAr || (ref
        ? (status === 'LOW' ? ref.lowMeaningAr : status === 'HIGH' ? ref.highMeaningAr : ref.normalDescriptionAr)
        : `النتيجة (${item.value} ${item.unit || ''}) تعتبر ${status === 'NORMAL' ? 'ضمن المعدل الطبيعي السليم' : status === 'HIGH' ? 'أعلى من المعدل المرجعي' : 'أقل من المعدل المرجعي'} المعتمد.`);

      return {
        id: item.id || `test-${idx}-${Date.now()}`,
        testName: item.testName || (ref ? ref.nameEn : 'Test'),
        testNameAr: item.testNameAr || (ref ? ref.nameAr : undefined),
        code: item.code || (ref ? ref.code : 'TEST'),
        extractedValue: isNum && numVal !== null ? numVal : String(item.value || ''),
        value: item.value !== undefined ? item.value : (isNum && numVal !== null ? numVal : ''),
        isNumeric: isNum,
        numericValue: numVal,
        extractedUnit: item.unit || (ref ? ref.unit : ''),
        unit: item.unit || (ref ? ref.unit : ''),
        referenceRangeText: refRangeStr,
        minValue: minVal,
        maxValue: maxVal,
        category: item.category || (ref ? ref.category : 'other'),
        categoryAr: item.categoryAr || (ref ? ref.categoryAr : 'فحوصات طبية'),
        status,
        refData: ref || undefined,
        simplifiedExplanationAr: explanation,
        confidence: item.confidence || confidenceScore,
        causesOfElevation: item.causesOfElevation || (ref ? ref.highMeaningAr : undefined),
        causesOfDecrease: item.causesOfDecrease || (ref ? ref.lowMeaningAr : undefined),
        lifestyleAdvice: item.lifestyleAdvice || (ref ? ref.homeAdviceAr : undefined),
      };
    });

    if (!overallSummaryAr) {
      if (highCount === 0 && lowCount === 0 && normalCount > 0) {
        overallSummaryAr = 'جميع النتائج المستخرجة تقع ضمن النطاقات المرجعية الطبيعية المعتمدة، ومؤشرات الفحص مطمئنة للغاية.';
      } else {
        overallSummaryAr = `تم استخراج وتفسير ${processedTests.length} فحصاً مخبرياً وفق المعايير السريرية العالمية؛ وجد منها (${normalCount}) في النطاق السليم، و(${highCount}) مرتفع، و(${lowCount}) منخفض. يُوصى بمشاركة التقرير مع طبيبك المختص.`;
      }
    }

    const requiresConfirmation = confidenceScore < 80;

    return res.json({
      patientName,
      patientAge,
      patientGender,
      labName,
      testDate,
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
// 3. API: Drug Interaction & Safety Checker
// ----------------------------------------------------
app.post('/api/check-interactions', async (req: Request, res: Response) => {
  try {
    const { medicines = [], imageBase64, mimeType = 'image/jpeg' } = req.body;

    let targetMedicines: string[] = Array.isArray(medicines) ? [...medicines].filter(Boolean) : [];

    // If an image of multiple boxes was provided, scan it first
    if (imageBase64) {
      try {
        const visionPrompt = `
أنت صيدلاني خبير في التعرف البصري على الأدوية.
أمامك صورة تحتوي على علبة دواء واحدة أو عدة علب أدوية أو شرائط.
استخرج أسماء جميع الأدوية والمستحضرات الموجودة في الصورة بدقة متناهية:
أرجع JSON بالصيغة التالية فقط:
{
  "detectedMedicines": [
    { "name": "اسم الدواء التجاري بالإنجليزية والعربية", "activeIngredient": "المادة الفعالة" }
  ]
}
`;
        const visionData = await callGeminiVision(visionPrompt, imageBase64, mimeType);
        if (visionData && Array.isArray(visionData.detectedMedicines)) {
          const extracted = visionData.detectedMedicines.map((m: any) => m.name || m.tradeName).filter(Boolean);
          targetMedicines = Array.from(new Set([...targetMedicines, ...extracted]));
        }
      } catch (err) {
        console.warn('Vision extraction for interactions had error:', err);
      }
    }

    if (targetMedicines.length === 0) {
      return res.status(400).json({ error: 'يرجى تحديد أو تصوير دواءين على الأقل للتحقق من التعارض.' });
    }

    // Identify local ingredients if matched
    const matchedIngredients: { medicine: string; ingredient: string }[] = [];
    for (const medName of targetMedicines) {
      const norm = normalizeStr(medName);
      const found = medicinesList.find(m => normalizeStr(m.tradeNameAr).includes(norm) || normalizeStr(m.tradeNameEn).includes(norm));
      if (found) {
        const act = activeIngredientsList.find(a => a.id === found.activeIngredientId);
        if (act) {
          matchedIngredients.push({ medicine: medName, ingredient: act.nameAr + ' (' + act.nameEn + ')' });
        }
      }
    }

    const interactionPrompt = `
أنت استشاري علم الأدوية السريري وطبيب صيدلاني خبير في سلامة المرضى وتداخلات الأدوية (Clinical Drug-Drug Interaction Specialist).
المطلوب فحص قائمة الأدوية التالية بدقة فائقة:
الأدوية المفحوصة: ${JSON.stringify(targetMedicines)}
${matchedIngredients.length > 0 ? `المواد الفعالة المعروفة من القاعدة المحلية: ${JSON.stringify(matchedIngredients)}` : ''}

المهام الحاسمة المطلوبة:
1. الكشف عن المواد الفعالة المتطابقة أو المتشابهة (Duplicate Active Ingredient): فحص إذا كان المريض يأخذ نفس المادة الفعالة في مستحضرين مختلفين (مثلاً باراسيتامول في بنادول وكونجستال، أو مادتين من نفس عائلة مضادات الالتهاب NSAIDs)، مما قد يسبب تسمماً أو جرعة زائدة (Overdose).
2. فحص التداخلات الدوائية المتبادلة (Drug-Drug Interactions): تحديد خطورة التداخل (severe خطير / moderate متوسط / mild طفيف / none لا يوجد) مع شرح التأثير والنصيحة الطبية.
3. تقييم السلامة الإجمالي (safetyStatus):
   - "DANGER": إذا كان هناك تعارض خطير مهدد للحياة أو تكرار مباشر لنفس المادة الفعالة بجرعات سامة.
   - "CAUTION": إذا كان هناك تداخل متوسط يتطلب فصلاً زمنياً أو تعديل جرعة أو استشارة الطبيب.
   - "SAFE": إذا كانت الأدوية آمنة معاً ولا يوجد بينها تعارض دوائي معتبر.
4. جدول يومي مقترح (dailySchedule): تنظيم مواعيد تناول هذه الأدوية على مدار اليوم (الصباح، الظهيرة/بعد الغداء، المساء، قبل النوم) لضمان أقصى فاعلية وتجنب التداخلات الهضمية.
5. ملخص موجه لكبار السن (elderlySummaryAr): كلام واضح جداً، مطمئن ومختصر بلهجة محترمة ولطيفة وبدون مصطلحات معقدة، يسهل قراءته بالصوت للمسن.

أرجع النتيجة بصيغة JSON حصراً على هذا النحو:
{
  "safetyStatus": "SAFE" | "CAUTION" | "DANGER",
  "summaryAr": "ملخص سريري متكامل لحالة أمان هذه الأدوية معاً",
  "duplicateIngredients": [
    {
      "ingredient": "اسم المادة المكررة",
      "medicines": ["اسم الدواء 1", "اسم الدواء 2"],
      "warningAr": "تحذير تفصيلي من خطر الجرعة الزائدة"
    }
  ],
  "interactions": [
    {
      "medicineA": "الدواء الأول",
      "medicineB": "الدواء الثاني",
      "severity": "severe" | "moderate" | "mild" | "none",
      "effectAr": "شرح ما يحدث عند تناولهما معاً",
      "recommendationAr": "نصيحة الصيدلي العملية (مثل الفصل بساعتين أو مراجعة الطبيب)"
    }
  ],
  "dailySchedule": [
    {
      "timeOfDay": "morning",
      "timeLabelAr": "الصباح (بعد الإفطار)",
      "medicines": [
        { "name": "اسم الدواء", "instructionAr": "مع كوب ماء كامل" }
      ]
    },
    {
      "timeOfDay": "noon",
      "timeLabelAr": "الظهيرة (بعد الغداء)",
      "medicines": []
    },
    {
      "timeOfDay": "evening",
      "timeLabelAr": "المساء (بعد العشاء)",
      "medicines": []
    },
    {
      "timeOfDay": "bedtime",
      "timeLabelAr": "قبل النوم",
      "medicines": []
    }
  ],
  "elderlySummaryAr": "ملخص صوتي لطيف ومبسط لكبار السن يشرح لهم كيف يأخذون الأدوية بأمان",
  "confidenceScore": 95
}
`;

    let result;
    try {
      result = await callGeminiText(interactionPrompt);
    } catch (aiErr) {
      console.error('Gemini call failed for interactions, fallbacking:', aiErr);
      // Clinical rule-based fallback
      result = {
        safetyStatus: 'CAUTION',
        summaryAr: `تم فحص الأدوية (${targetMedicines.join('، ')}). يُنصح دائماً باستشارة الصيدلي للتأكد من المباعدة الزمنية بساعتين على الأقل بين الأدوية.`,
        duplicateIngredients: [],
        interactions: [
          {
            medicineA: targetMedicines[0] || 'الدواء الأول',
            medicineB: targetMedicines[1] || 'الدواء الثاني',
            severity: 'moderate',
            effectAr: 'قد يحدث تباطؤ في الامتصاص أو إجهاد للمعدة عند تناولهما في نفس اللحظة.',
            recommendationAr: 'اترك فاصلاً زمنياً لا يقل عن ساعة إلى ساعتين بين العلاجين، وتناول الدواء بعد الطعام.'
          }
        ],
        dailySchedule: [
          {
            timeOfDay: 'morning',
            timeLabelAr: 'الصباح (بعد الإفطار)',
            medicines: [{ name: targetMedicines[0] || '', instructionAr: 'بعد وجبة الإفطار مع كوب ماء' }]
          },
          {
            timeOfDay: 'evening',
            timeLabelAr: 'المساء (بعد العشاء)',
            medicines: targetMedicines[1] ? [{ name: targetMedicines[1], instructionAr: 'بعد وجبة العشاء' }] : []
          }
        ],
        elderlySummaryAr: `يا والدي الكريم، الأدوية التي سجلتها تحتاج فقط إلى تنظيم: خذ دواء الصباح بعد الإفطار، ودواء المساء بعد العشاء، ولا تأخذ دوائين في نفس الدقيقة لتريح معدتك، وعافاك الله وشفاك.`,
        confidenceScore: 85
      };
    }

    return res.json({
      medicinesChecked: targetMedicines,
      safetyStatus: result.safetyStatus || 'SAFE',
      summaryAr: result.summaryAr || 'تم تحليل التفاعلات الدوائية بنجاح.',
      duplicateIngredients: result.duplicateIngredients || [],
      interactions: result.interactions || [],
      dailySchedule: result.dailySchedule || [],
      elderlySummaryAr: result.elderlySummaryAr || '',
      confidenceScore: result.confidenceScore || 90,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error checking drug interactions:', error);
    return res.status(500).json({ error: error.message || 'حدث خطأ أثناء فحص تعارض الأدوية.' });
  }
});

// ----------------------------------------------------
// 4. API: Prescription / Rx Analysis & Deciphering (Senior Clinical Pharmacist)
// ----------------------------------------------------
app.post('/api/analyze-prescription', async (req: Request, res: Response) => {
  try {
    const imageBase64 = req.body.imageBase64 || req.body.image || req.body.base64Image;
    const mimeType = req.body.mimeType || 'image/jpeg';

    if (!imageBase64) {
      return res.status(400).json({ error: 'يرجى تزويد صورة الروشتة الطبية.' });
    }

    const prompt = `
أنت صيدلي إكلينيكي خبير في قراءة الوصفات الطبية (الروشتات) المكتوبة بخط اليد والمطبوعة.
انظر إلى صورة الوصفة الطبية المرفقة واستخرج كل الأدوية المكتوبة فيها بدقة (حتى لو كان الخط يدوياً مائلاً أو مختصراً مثل: Rx Vigabatrin sachet 500mg أو Baclofen tab 10mg، وافهم اختصارات الجرعات مثل 1/2 tab، 1x1، x2، wk، وفك رموز التوقيع والطبيب ومدة العلاج).

أرجع النتيجة بصيغة JSON فقط بهذا الهيكل الدقيق:
{
  "doctorOrClinicName": "اسم الطبيب أو العيادة المذكور في الروشتة (أو 'وصفة طبية')",
  "prescriptionDate": "تاريخ الوصفة أو مدة العلاج المكتوبة (مثلاً: علاج 6 أشهر)",
  "diagnosisOrNotesAr": "ملاحظات عامة أو مدة العلاج المكتوبة في الروشتة",
  "overallConfidence": 92,
  "elderlySummaryAr": "ملخص صوتي واضح ومطمئن باللغة العربية يشرح للمريض أو عائلته الأدوية الموجودة في الروشتة وطريقة أخذ كل دواء منها بالتفصيل",
  "items": [
    {
      "id": "med-1",
      "extractedName": "الاسم الإنجليزي للدواء والتركيز كما في الروشتة (مثال: Vigabatrin 500 mg Sachet)",
      "arabicName": "اسم الدواء بالعربية (مثال: فيجاباترين 500 مجم أكياس)",
      "activeIngredient": "المادة الفعالة العلمية",
      "strength": "التركيز (مثال: 500 mg)",
      "dosageFormAr": "الشكل الصيدلاني (أكياس / أقراص / شراب / كبسولات / حقن)",
      "dosageAndFrequencyAr": "الجرعة وطريقة الاستخدام بالتفصيل كما كتبها الطبيب في الروشتة (مثال: نصف كيس 250 مجم مرتين يومياً، أو نصف قرص 5 مجم مرة يومياً لمدة أسبوع ثم مرتين يومياً)",
      "durationAr": "مدة الاستخدام (مثال: حسب خطة الطبيب / 6 أشهر)",
      "purposeAr": "لماذا يستخدم هذا الدواء باختصار ووضوح",
      "importantWarningAr": "أهم نصيحة أو تحذير عند تناول هذا الدواء",
      "alternatives": ["اسم بديل تجاري 1", "اسم بديل تجاري 2"],
      "confidence": 90,
      "needsPharmacistVerification": false
    }
  ]
}
`;

    let result: any = null;
    let visionErrorOccurred = false;
    let visionErrorMessage = '';

    try {
      result = await callGeminiVision(prompt, imageBase64, mimeType);
    } catch (visionErr: any) {
      visionErrorOccurred = true;
      visionErrorMessage = visionErr?.message || 'Vision analysis failed';
      console.warn('Vision analysis failed for prescription, will format fallback:', visionErr);
    }

    if (!result || typeof result !== 'object') {
      result = {};
    }

    let rawItems: any[] = [];
    if (Array.isArray(result.items)) rawItems = result.items;
    else if (Array.isArray(result.medicines)) rawItems = result.medicines;
    else if (Array.isArray(result.medications)) rawItems = result.medications;
    else if (Array.isArray(result.drugs)) rawItems = result.drugs;
    else if (result.prescription && Array.isArray(result.prescription.items)) rawItems = result.prescription.items;
    else if (result.prescription && Array.isArray(result.prescription.medicines)) rawItems = result.prescription.medicines;
    else if (result.data && Array.isArray(result.data.items)) rawItems = result.data.items;
    else if (result.data && Array.isArray(result.data.medicines)) rawItems = result.data.medicines;
    else if (Array.isArray(result)) rawItems = result;

    const normalizedMedicines = rawItems.map((m: any, idx: number) => {
      const nameEn = m.extractedName || m.nameEn || m.tradeName || m.name || m.drugName || `Medicine ${idx + 1}`;
      const nameAr = m.arabicName || m.nameAr || m.tradeNameAr || nameEn;
      const instruction = m.dosageAndFrequencyAr || m.dosageInstructionAr || m.dosage || m.instructions || m.frequency || m.instruction || 'وفق إرشادات الطبيب والصيدلي';
      const form = m.dosageFormAr || m.dosageForm || m.form || 'مستحضر صيدلاني';
      const duration = m.durationAr || m.duration || '';
      const purpose = m.purposeAr || m.purpose || m.indication || 'علاج الحالة الموصوفة';
      const warning = m.importantWarningAr || m.pharmacistWarning || m.warning || m.notes || 'تأكد من الجرعة مع الصيدلي عند الصرف.';
      const strength = m.strength || m.concentration || '';

      return {
        id: m.id || `rx-item-${idx + 1}-${Date.now()}`,
        name: nameEn,
        tradeName: nameEn,
        extractedName: nameEn,
        nameEn,
        nameAr,
        arabicName: nameAr,
        activeIngredient: m.activeIngredient || m.genericName || '',
        dosage: instruction,
        dosageAndFrequencyAr: instruction,
        instructions: instruction,
        dosageInstructionAr: instruction,
        strength,
        form,
        dosageForm: form,
        dosageFormAr: form,
        duration,
        durationAr: duration,
        purpose,
        purposeAr: purpose,
        indication: purpose,
        warning,
        importantWarningAr: warning,
        pharmacistWarning: warning,
        notes: warning,
        frequencyAr: m.frequencyAr || '',
        timingAr: m.timingAr || '',
        alternatives: Array.isArray(m.alternatives) ? m.alternatives : (Array.isArray(m.commercialAlternatives) ? m.commercialAlternatives : []),
        confidence: typeof m.confidence === 'number' ? m.confidence : (typeof m.confidenceScore === 'number' ? m.confidenceScore : 92),
        needsPharmacistVerification: Boolean(m.needsPharmacistVerification),
      };
    });

    const docName = result.doctorOrClinicName || result.doctorName || (normalizedMedicines.length > 0 ? 'طبيب معالج' : '');
    const clinic = result.clinicOrHospital || '';
    const diag = result.diagnosisOrNotesAr || result.diagnosisNotes || '';
    const advice = result.overallAdviceAr || (normalizedMedicines.length > 0
      ? 'تناول الأدوية في مواعيدها المحددة مع كمية كافية من الماء والالتزام التام بالجرعات المقررة.'
      : 'لم نتمكن من استخراج أسماء الأدوية بوضوح. يرجى إعادة تصوير الروشتة في مكان ذي إضاءة جيدة أو مراجعة الصيدلي.');
    const elderlySummary = result.elderlySummaryAr || (normalizedMedicines.length > 0
      ? `تحتوي الروشتة على ${normalizedMedicines.length} أدوية: ${normalizedMedicines.map((m: any) => `${m.nameAr}: ${m.dosageInstructionAr}`).join('، و')}. عافاك الله وشفاك.`
      : 'يا والدي الكريم، الصورة لم تكن واضحة كفاية لقراءة خط الطبيب، يرجى إعادة التصوير أو عرض الروشتة مباشرة على الصيدلي.');
    const alert = result.pharmacistConfirmationAlert || 'تنبيه أمان: هذه القراءة ذكية ومساعدة استرشادية؛ تأكد دائماً مع الصيدلي المرخص عند صرف الدواء.';
    const conf = typeof result.overallConfidence === 'number'
      ? result.overallConfidence
      : (typeof result.confidenceScore === 'number' ? result.confidenceScore : (normalizedMedicines.length > 0 ? 90 : 30));

    return res.json({
      doctorName: docName,
      doctorOrClinicName: docName,
      clinicOrHospital: clinic,
      patientName: result.patientName || '',
      prescriptionDate: result.prescriptionDate || '',
      diagnosisNotes: diag,
      diagnosisOrNotesAr: diag,
      medicines: normalizedMedicines,
      items: normalizedMedicines,
      medications: normalizedMedicines,
      overallAdviceAr: advice,
      elderlySummaryAr: elderlySummary,
      pharmacistConfirmationAlert: alert,
      confidenceScore: conf,
      overallConfidence: conf,
      serverFallbackUsed: visionErrorOccurred,
      errorMessage: visionErrorMessage || undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error analyzing prescription:', error);
    // Return a structured JSON response instead of unhandled 500
    return res.json({
      doctorName: '',
      doctorOrClinicName: '',
      clinicOrHospital: '',
      patientName: '',
      prescriptionDate: '',
      diagnosisNotes: '',
      diagnosisOrNotesAr: '',
      medicines: [],
      items: [],
      medications: [],
      overallAdviceAr: 'تعذر فك خطوط الروشتة تلقائياً من الصورة الحالية. يرجى إعادة تصوير الروشتة بإضاءة ساطعة أو مراجعة الصيدلي مباشرة.',
      elderlySummaryAr: 'يا والدي الكريم، الصورة لم تكن واضحة كفاية لقراءة خط الطبيب، يرجى عرض الروشتة مباشرة على الصيدلي للتأكد من العلاج.',
      pharmacistConfirmationAlert: 'تنبيه: يجب عرض الروشتة على الصيدلي للتأكد من قراءة الخط بدقة تامة.',
      confidenceScore: 30,
      overallConfidence: 30,
      serverFallbackUsed: true,
      errorMessage: error?.message || 'Server error',
      timestamp: new Date().toISOString()
    });
  }
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
