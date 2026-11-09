export type PatientHealthCondition =
  | 'hypertension'
  | 'diabetes'
  | 'kidney'
  | 'pregnancy'
  | 'penicillin_allergy'
  | 'nsaid_allergy'
  | 'heart_disease';

export interface VisitorLogEntry {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  device: string;
  browser: string;
  action: string;
  details?: string;
}

export interface VisitorStatsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  onlineNow: number;
  totalScans: number;
  breakdown: {
    medicine: number;
    lab: number;
    prescription: number;
    interaction: number;
    barcode: number;
  };
  recentVisitors?: VisitorLogEntry[];
}

export interface ActiveIngredient {
  id: string;
  nameEn: string;
  nameAr: string;
  drugClass: string;
  indications: string[];
  sideEffects: string[];
  severeSideEffects?: string[];
  warnings: string[];
  safeUsageAdvice: string;
}

export interface Medicine {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  activeIngredientId: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  prescriptionRequired: boolean;
  barcode?: string;
  descriptionAr: string;
  notes?: string;
  imageUrl?: string;
  packColor?: 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'teal' | 'indigo' | 'slate';
  originCountry?: string;
  dosagePackDetails?: string;
}

export interface CommercialAlternative {
  medicine: Medicine;
  activeIngredient: ActiveIngredient;
  isSameStrength: boolean;
  matchScore: number;
}

export type LabStatus = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW' | 'ABNORMAL' | 'UNKNOWN';

export interface LabReference {
  id: string;
  code: string;
  aliases: string[];
  nameAr: string;
  nameEn: string;
  category: 'cbc' | 'blood_sugar' | 'lipids' | 'liver' | 'kidney' | 'vitamins_hormones' | 'inflammation' | 'urine_stool' | 'coagulation' | 'other';
  categoryAr: string;
  minValue: number;
  maxValue: number;
  unit: string;
  normalDescriptionAr: string;
  highMeaningAr: string;
  lowMeaningAr: string;
  homeAdviceAr: string;
  preparationAdviceAr?: string;
}

export interface ParsedLabItem {
  id: string;
  testName: string;
  testNameAr?: string;
  code: string;
  extractedValue: number | string;
  value?: number | string;
  isNumeric?: boolean;
  numericValue?: number | null;
  extractedUnit: string;
  unit?: string;
  referenceRangeText?: string;
  minValue?: number | null;
  maxValue?: number | null;
  category?: string;
  categoryAr?: string;
  status: LabStatus;
  refData?: LabReference;
  simplifiedExplanationAr: string;
  confidence: number;
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
  confidenceScore: number;
  textClarity: 'high' | 'medium' | 'low';
  rawOcrText?: string;
  matchedMedicine?: Medicine;
  activeIngredientData?: ActiveIngredient;
  commercialAlternatives: Medicine[];
  indicationsSummary: string[];
  sideEffectsSummary: string[];
  safetyWarnings: string[];
  personalSafetyAlerts?: string[];
  elderlyFriendlySummary?: string;
  howToTake?: string;
  handwrittenNotes?: string;
  expiryDate?: string;
  requiresConfirmation: boolean;
  serverFallbackUsed?: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface LabAnalysisResult {
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  labName?: string;
  testDate?: string;
  tests: ParsedLabItem[];
  overallSummaryAr: string;
  normalCount: number;
  highCount: number;
  lowCount: number;
  confidenceScore: number;
  requiresConfirmation: boolean;
  serverFallbackUsed?: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface ImageEnhancementOptions {
  contrast: number;
  brightness: number;
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
  nameEn?: string;
  nameAr?: string;
  name?: string;
  tradeName?: string;
  extractedName?: string;
  arabicName?: string;
  activeIngredient?: string;
  dosageForm?: string;
  dosageFormAr?: string;
  form?: string;
  strength?: string;
  dosageInstructionAr?: string;
  dosageAndFrequencyAr?: string;
  dosage?: string;
  instructions?: string;
  frequencyAr?: string;
  timingAr?: string;
  purposeAr?: string;
  purpose?: string;
  indication?: string;
  duration?: string;
  durationAr?: string;
  importantWarningAr?: string;
  pharmacistWarning?: string;
  warning?: string;
  notes?: string;
  alternatives?: string[];
  confidence?: number;
  needsPharmacistVerification?: boolean;
}

export interface PrescriptionAnalysisResult {
  doctorName?: string;
  doctorOrClinicName?: string;
  clinicOrHospital?: string;
  patientName?: string;
  prescriptionDate?: string;
  diagnosisNotes?: string;
  diagnosisOrNotesAr?: string;
  medicines: PrescribedMedicineItem[];
  items?: PrescribedMedicineItem[];
  medications?: PrescribedMedicineItem[];
  overallAdviceAr: string;
  elderlySummaryAr: string;
  pharmacistConfirmationAlert: string;
  confidenceScore: number;
  overallConfidence?: number;
  rawOcrText?: string;
  serverFallbackUsed?: boolean;
  errorMessage?: string;
  timestamp: string;
}
