import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  RefreshCw,
  Pill,
  Activity,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  HeartPulse,
  Check,
  BookOpen
} from 'lucide-react';
import { medicinesList, activeIngredientsList, labReferencesList } from '../data/medicalDatabase';
import { Medicine, LabReference, PatientHealthCondition } from '../types';

interface Props {
  onSelectMedicine: (med: Medicine) => void;
  onOpenLabGuide: () => void;
  selectedConditions: PatientHealthCondition[];
  onToggleCondition: (cond: PatientHealthCondition) => void;
}

const HEALTH_CONDITIONS_LIST: { id: PatientHealthCondition; labelAr: string; icon: string }[] = [
  { id: 'hypertension', labelAr: 'ضغط الدم المرتفع', icon: '🩺' },
  { id: 'diabetes', labelAr: 'السكري', icon: '🩸' },
  { id: 'kidney', labelAr: 'قصور الكلى', icon: '💧' },
  { id: 'pregnancy', labelAr: 'حامل / مرضع', icon: '🤰' },
  { id: 'penicillin_allergy', labelAr: 'حساسية البنسلين', icon: '⚠️' },
  { id: 'nsaid_allergy', labelAr: 'قرحة المعدة / حساسية المسكنات', icon: '💊' },
  { id: 'heart_disease', labelAr: 'أمراض القلب والسيولة', icon: '❤️' },
];

const GENERAL_CULTURE_MED_TIPS = [
  {
    title: 'مضادات الالتهاب غير الستيرويدية (NSAIDs)',
    fact: 'مثل الإيبوبروفين والديكلوفيناك؛ يجب عدم تناولها على معدة فارغة نهائياً لتفادي خطر تقرحات المعدة والنزيف المعوي.',
    category: 'ثقافة دوائية عامة'
  },
  {
    title: 'أدوية الغدة الدرقية (Levothyroxine)',
    fact: 'تؤخذ حصراً على الريق صباحاً مع كوب ماء وقبل الإفطار بـ 30 إلى 60 دقيقة لضمان الامتصاص الكامل وعدم ارتباطها بالطعام.',
    category: 'إرشادات هرمونية'
  },
  {
    title: 'أدوية الستاتين لخفض الكوليسترول',
    fact: 'يوصى بتناولها مساءً قبل النوم، لأن الكبد يفرز وينشط تصنيع الكوليسترول في الجسم بشكل رئيسي خلال ساعات الليل.',
    category: 'صحة القلب والشرايين'
  },
  {
    title: 'المضادات الحيوية واستكمال الكورس',
    fact: 'إيقاف المضاد الحيوي بمجرد شعور التحسن يتيح للبكتيريا الأقوى البناء وتطوير مقاومة دوائية تجعل العلاج اللاحق أصعب بكثير.',
    category: 'الاستخدام الرشيد'
  },
  {
    title: 'مكملات الحديد والفيتامينات',
    fact: 'يفصل بين تناول حبوب الحديد ومنتجات الألبان أو القهوة والشاي بساعتين على الأقل، لأن الكالسيوم والكافيين يعيقان امتصاص الحديد.',
    category: 'التغذية والامتصاص'
  },
  {
    title: 'الباراسيتامول والجرعة القصوى',
    fact: 'الحد الأقصى للبالغين هو 4 جرامات يومياً (4000 مجم). تجاوزها يترتب عليه إجهاد وتسمم حاد في خلايا الكبد.',
    category: 'السلامة المنزلية'
  }
];

export const DynamicHomeHub: React.FC<Props> = ({
  onSelectMedicine,
  onOpenLabGuide,
  selectedConditions,
  onToggleCondition,
}) => {
  const [spotlightMedicine, setSpotlightMedicine] = useState<Medicine>(medicinesList[0]);
  const [spotlightLab, setSpotlightLab] = useState<LabReference>(labReferencesList[0]);
  const [cultureTip, setCultureTip] = useState(GENERAL_CULTURE_MED_TIPS[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandomContent = () => {
    setIsSpinning(true);
    const randomMed = medicinesList[Math.floor(Math.random() * medicinesList.length)];
    const randomLab = labReferencesList[Math.floor(Math.random() * labReferencesList.length)];
    const randomTip = GENERAL_CULTURE_MED_TIPS[Math.floor(Math.random() * GENERAL_CULTURE_MED_TIPS.length)];

    setSpotlightMedicine(randomMed);
    setSpotlightLab(randomLab);
    setCultureTip(randomTip);

    setTimeout(() => setIsSpinning(false), 350);
  };

  useEffect(() => {
    pickRandomContent();
  }, []);

  const hour = new Date().getHours();
  let timeGreeting = 'صباح الصحة والعافية';
  let timeAdvice = 'تذكير الصباح: أدوية الغدة والحموضة تؤخذ على الريق، وأدوية الضغط بانتظام.';
  let TimeIcon = Sunrise;
  let badgeTheme = 'bg-amber-50 text-amber-900 border-amber-200';

  if (hour >= 12 && hour < 17) {
    timeGreeting = 'طاب يومك بكل صحة';
    timeAdvice = 'تذكير الظهيرة: احرص على ترطيب جسمك بالماء، وتناول أدوية السكري والمسكنات بعد الوجبات.';
    TimeIcon = Sun;
    badgeTheme = 'bg-sky-50 text-sky-900 border-sky-200';
  } else if (hour >= 17 && hour < 21) {
    timeGreeting = 'مساء الخير والعافية';
    timeAdvice = 'تذكير المساء: راجع جدول أدويتك المسائية، وتجنب المنبهات الثقيلة قبل النوم.';
    TimeIcon = Sunset;
    badgeTheme = 'bg-indigo-50 text-indigo-900 border-indigo-200';
  } else if (hour >= 21 || hour < 5) {
    timeGreeting = 'أمسية هادئة وصحية';
    timeAdvice = 'تذكير الليل: وقت أدوية الكوليسترول ومضادات الحساسية، والاستعداد لنوم عميق مريح.';
    TimeIcon = Moon;
    badgeTheme = 'bg-slate-800 text-slate-100 border-slate-700';
  }

  const activeIngredient = activeIngredientsList.find(
    a => a.id === spotlightMedicine.activeIngredientId
  );

  return (
    <div className="space-y-4 no-print">
      {/* 1. Dynamic Rotation Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${badgeTheme}`}>
          <div className="flex items-center gap-2.5">
            <TimeIcon className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-black">{timeGreeting} — </span>
              <span className="text-xs font-medium opacity-90">{timeAdvice}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={pickRandomContent}
            className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 border border-slate-200/80 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
            title="تحديث معلومات الأدوية والثقافة العامة في الصفحة"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>تحديث محتوى الصفحة</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-b from-slate-50/60 to-white">
          {/* Card 1: Spotlight Medicine (Changes dynamically every open) */}
          <div
            onClick={() => onSelectMedicine(spotlightMedicine)}
            className="p-4 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/70 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Pill className="w-3 h-3" />
                  دواء تحت الضوء (ثقافة عامة)
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500">{spotlightMedicine.strength}</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700">
                {spotlightMedicine.tradeNameAr} ({spotlightMedicine.tradeNameEn})
              </h4>
              <p className="text-[11px] text-emerald-900 font-semibold mt-0.5">
                المادة الفعالة: {activeIngredient?.nameAr || spotlightMedicine.dosageForm}
              </p>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                {spotlightMedicine.descriptionAr}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span>اضغط لعرض البدائل والمواصفات الكاملة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Spotlight Lab Test */}
          <div
            onClick={onOpenLabGuide}
            className="p-4 rounded-xl bg-teal-50/50 hover:bg-teal-50 border border-teal-200/70 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  مؤشر تحاليل معملي
                </span>
                <span className="text-[11px] font-mono font-bold text-teal-800">
                  {spotlightLab.minValue} - {spotlightLab.maxValue} {spotlightLab.unit}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-teal-700">
                {spotlightLab.nameAr}
              </h4>
              <p className="text-[11px] text-teal-900 font-semibold mt-0.5">
                التصنيف: {spotlightLab.categoryAr}
              </p>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                {spotlightLab.normalDescriptionAr}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-teal-200/50 flex items-center justify-between text-[11px] font-bold text-teal-700">
              <span>فتح موسوعة التحاليل الشاملة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Rotating General Culture Clinical Tip */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-700" />
                  {cultureTip.category}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900">{cultureTip.title}</h4>
              <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">
                {cultureTip.fact}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
              <span>معلومة تثقيفية متجددة تلقائياً</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Safety Profile ("ملفي الصحي التحذيري") */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:px-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              ملفي الصحي التحذيري (فحص تعارض الأدوية مع حالتك تلقائياً):
            </h3>
          </div>
          {selectedConditions.length > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              مفعّل ({selectedConditions.length} حالات محددة)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {HEALTH_CONDITIONS_LIST.map(cond => {
            const isSelected = selectedConditions.includes(cond.id);
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onToggleCondition(cond.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{cond.icon}</span>
                <span>{cond.labelAr}</span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};