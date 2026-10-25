export interface ActiveIngredient {
  id: string;
  nameEn: string;
  nameAr: string;
  drugClass: string;
  indications: string[]; // دواعي الاستعمال
  sideEffects: string[]; // الآثار الجانبية الشائعة
  severeSideEffects?: string[]; // آثار جانبية تستوجب مراجعة الطبيب فوراً
  warnings: string[]; // تحذيرات وموانع الاستعمال
  safeUsageAdvice: string; // إرشادات الاستخدام الآمن
}

export interface Medicine {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  activeIngredientId: string;
  strength: string; // مثل: 500mg, 1000mg, 400mg
  dosageForm: string; // أقراص، فوار، كبسولات، شراب، حقن
  manufacturer: string; // الشركة المصنعة
  prescriptionRequired: boolean; // هل يحتاج وصفة طبية (OTC أم Rx)
  barcode?: string;
  descriptionAr: string;
  notes?: string;
  imageUrl?: string;
  packColor?: 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'teal' | 'indigo' | 'slate';
  originCountry?: string; // بلد المنشأ (مثل: بريطانيا، الأردن، الإمارات، سويسرا، مصر، فرنسا)
  dosagePackDetails?: string; // تفاصيل العبوة (مثل: شريط يحتوي على 10 أقراص)
}

export interface CommercialAlternative {
  medicine: Medicine;
  activeIngredient: ActiveIngredient;
  isSameStrength: boolean;
  matchScore: number;
}

export type LabStatus = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'UNKNOWN';

export interface LabReference {
  id: string;
  code: string; // e.g., WBC, RBC, HGB, GLU, HBA1C, CHOL
  aliases: string[]; // أسماء أخرى ومترادفات
  nameAr: string;
  nameEn: string;
  category: 'cbc' | 'blood_sugar' | 'lipids' | 'liver' | 'kidney' | 'vitamins_hormones' | 'inflammation';
  categoryAr: string;
  minValue: number;
  maxValue: number;
  unit: string;
  normalDescriptionAr: string;
  highMeaningAr: string;
  lowMeaningAr: string;
  homeAdviceAr: string;
  preparationAdviceAr?: string; // e.g., صيام 10-12 ساعة
}

export interface ParsedLabItem {
  id: string;
  testName: string;
  code: string;
  extractedValue: number;
  extractedUnit: string;
  referenceRangeText?: string;
  status: LabStatus;
  refData?: LabReference;
  simplifiedExplanationAr: string;
  confidence: number; // 0-100
  causesOfElevation?: string;
  causesOfDecrease?: string;
  lifestyleAdvice?: string;
  note?: string;
}

export interface MedicineAnalysisResult {
  detectedTradeName: string;
  detectedActiveIngredient: string;
  detectedManufacturer?: string;
  detectedStrength?: string;
  detectedDosageForm?: string;
  drugClass?: string;
  mechanismOfAction?: string;
  drugInteractions?: string[];
  specialPopulations?: string;
  storageAdvice?: string;
  confidenceScore: number; // 0-100
  textClarity: 'high' | 'medium' | 'low';
  rawOcrText?: string;
  matchedMedicine?: Medicine;
  activeIngredientData?: ActiveIngredient;
  commercialAlternatives: Medicine[];
  indicationsSummary: string[];
  sideEffectsSummary: string[];
  safetyWarnings: string[];
  elderlyFriendlySummary?: string;
  howToTake?: string;
  handwrittenNotes?: string;
  expiryDate?: string;
  requiresConfirmation: boolean; // True if confidence < 80%
  timestamp: string;
}

export interface LabAnalysisResult {
  patientName?: string;
  labName?: string;
  testDate?: string;
  tests: ParsedLabItem[];
  overallSummaryAr: string;
  normalCount: number;
  highCount: number;
  lowCount: number;
  confidenceScore: number;
  requiresConfirmation: boolean;
  timestamp: string;
}

export interface ImageEnhancementOptions {
  contrast: number; // 100 is normal, 150 high
  brightness: number; // 100 is normal
  grayscale: boolean;
  sharpen: boolean;
}

export interface SavedHistoryItem {
  id: string;
  type: 'medicine' | 'lab' | 'interaction' | 'prescription';
  title: string;
  timestamp: string;
  summary: string;
  data: MedicineAnalysisResult | LabAnalysisResult | DrugInteractionResult | PrescriptionAnalysisResult;
}

export interface DuplicateIngredientAlert {
  ingredient: string;
  medicines: string[];
  warningAr: string;
}

export interface DrugInteractionDetail {
  medicineA: string;
  medicineB: string;
  severity: 'severe' | 'moderate' | 'mild' | 'none';
  effectAr: string;
  recommendationAr: string;
}

export interface DailyScheduleSlot {
  timeOfDay: 'morning' | 'noon' | 'evening' | 'bedtime';
  timeLabelAr: string;
  medicines: {
    name: string;
    instructionAr: string;
  }[];
}

export interface DrugInteractionResult {
  medicinesChecked: string[];
  safetyStatus: 'SAFE' | 'CAUTION' | 'DANGER';
  summaryAr: string;
  duplicateIngredients: DuplicateIngredientAlert[];
  interactions: DrugInteractionDetail[];
  dailySchedule: DailyScheduleSlot[];
  elderlySummaryAr: string;
  confidenceScore: number;
  timestamp: string;
}

export interface PrescribedMedicineItem {
  id: string;
  nameEn: string;
  nameAr: string;
  activeIngredient?: string;
  dosageForm?: string;
  strength?: string;
  dosageInstructionAr: string;
  frequencyAr: string;
  timingAr: string;
  purposeAr: string;
  duration?: string;
  pharmacistWarning?: string;
}

export interface PrescriptionAnalysisResult {
  doctorName?: string;
  clinicOrHospital?: string;
  prescriptionDate?: string;
  diagnosisNotes?: string;
  medicines: PrescribedMedicineItem[];
  overallAdviceAr: string;
  elderlySummaryAr: string;
  pharmacistConfirmationAlert: string;
  confidenceScore: number;
  rawOcrText?: string;
  timestamp: string;
}

