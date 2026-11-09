import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  HeartPulse,
  Pill,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings2,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PatientHealthCondition } from '../types';
import { ActiveTab } from './Header';

export interface HealthConditionMeta {
  id: PatientHealthCondition;
  titleAr: string;
  shortDesc: string;
  criticalWarning: string;
  iconBg: string;
  badgeColor: string;
}

export const HEALTH_CONDITIONS_META: HealthConditionMeta[] = [
  {
    id: 'hypertension',
    titleAr: 'ارتفاع ضغط الدم',
    shortDesc: 'حذر من أدوية البرد ومضادات الاحتقان ومسكنات NSAIDs',
    criticalWarning: 'تجنب أدوية الرشح المحتوية على سودوإيفيدرين (Pseudoephedrine) والمسكنات مثل الإيبوبروفين بجرعات مستمرة.',
    iconBg: 'bg-red-50 text-red-600 border-red-200',
    badgeColor: 'bg-red-100 text-red-800 border-red-300'
  },
  {
    id: 'diabetes',
    titleAr: 'مرض السكري',
    shortDesc: 'حذر من الشرابات السكرية والكورتيزون ومعدلات السكر',
    criticalWarning: 'احذر من شراب السعال المحلى بالسكر، وأدوية الكورتيزون، وتحقق من تأثير المسكنات على جرعات الإنسولين.',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'kidney',
    titleAr: 'اعتلال أو قصور الكلى',
    shortDesc: 'حذر شديد من مضادات الالتهاب غير الستيرويدية (NSAIDs)',
    criticalWarning: 'ممنوع استخدام المسكنات القوية (بروفين، كتافلام، فولتارين) دون استشارة طبية وتعديل جرعات المضادات الحيوية.',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'pregnancy',
    titleAr: 'الحمل أو الرضاعة الطبيعية',
    shortDesc: 'أقصى درجات الحذر لتجنب تشوه الأجنة وتأثر حليب الأم',
    criticalWarning: 'يمنع تناول أي دواء دون مراجعة فئة مأمونيته للحوامل (FDA Categories) مع تجنب الرتينويدات وبعض المضادات.',
    iconBg: 'bg-pink-50 text-pink-600 border-pink-200',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  {
    id: 'penicillin_allergy',
    titleAr: 'حساسية البنسلين (Penicillin)',
    shortDesc: 'تحسس من الأموكسيسيلين والأوجمنتين وعائلة البيتالاكتام',
    criticalWarning: 'تجنب تماماً مشتقات البنسلين ومجموعة السيفالوسبورين إن كانت الحساسية شديدة ومفرطة (صدمة تأقية).',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 'nsaid_allergy',
    titleAr: 'حساسية / قرحة المسكنات (NSAIDs)',
    shortDesc: 'تحسس أو نزيف معدي من الأسبرين، البروفين، الديكلوفيناك',
    criticalWarning: 'استبدل مسكنات NSAIDs بالباراسيتامول النقي لحماية بطانة المعدة وتجنب الربو التحسسي الناتج عن الأسبرين.',
    iconBg: 'bg-orange-50 text-orange-600 border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'heart_disease',
    titleAr: 'أمراض القلب والشرايين',
    shortDesc: 'حذر من مميعات الدم وموسعات الأوعية وأدوية السيولة',
    criticalWarning: 'تجنب خلط مميعات الدم مع المسكنات أو مكملات السيولة (الجنكة والثوم وزيت السمك) لتفادي خطر النزيف.',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
];

// Featured dynamic spotlights rotated across visits
const ROTATING_SPOTLIGHTS = [
  {
    id: 'spotlight-rx',
    tab: 'prescription' as ActiveTab,
    badge: 'جديد ومحدّث 🚀',
    title: 'وحدة قراءة وتفسير روشتات الأطباء (Rx Reader)',
    desc: 'التقط صورة لروشتة الطبيب المكتوبة بخط اليد؛ يتعرف النظام على الأدوية، الجرعات، ومواعيد تناولها السريرية.',
    icon: FileText,
    accent: 'from-indigo-600 to-purple-700',
    badgeBg: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'spotlight-interaction',
    tab: 'drug_interactions' as ActiveTab,
    badge: 'سلامة الأسرة 🛡️',
    title: 'فحص تعارض وتكرار الأدوية والجرعة المزدوجة',
    desc: 'أدخل أو صوّر دوائين أو أكثر للتأكد من خلوها من تكرار المادة الفعالة (كازدواجية الباراسيتامول) وتنسيق مواعيد الأكل.',
    icon: ShieldAlert,
    accent: 'from-amber-600 to-orange-700',
    badgeBg: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'spotlight-lab',
    tab: 'lab' as ActiveTab,
    badge: 'دقة سريرية 🔬',
    title: 'قراءة تقارير المختبر ومقارنة المعدلات الطبيعية',
    desc: 'حوّل ورقة التحاليل الطبية الصعبة إلى تقرير واضح يفصل النتائج السليمة والمرتفعة والمنخفضة بنقرة واحدة.',
    icon: FileSpreadsheet,
    accent: 'from-teal-600 to-emerald-700',
    badgeBg: 'bg-teal-100 text-teal-800'
  },
  {
    id: 'spotlight-medicine',
    tab: 'medicine' as ActiveTab,
    badge: 'البدائل المتطابقة 💊',
    title: 'فحص الأدوية واستكشاف البدائل التجارية بنفس التركيز',
    desc: 'وفّر وقتك واكتشف البدائل التجارية المتطابقة علمياً والمصنوعة محلياً أو عالمياً بنفس المادة الفعالة وبسعر مناسب.',
    icon: Pill,
    accent: 'from-emerald-600 to-teal-800',
    badgeBg: 'bg-emerald-100 text-emerald-800'
  }
];

interface Props {
  onNavigateTab: (tab: ActiveTab) => void;
  activeConditions: PatientHealthCondition[];
  onToggleCondition: (condition: PatientHealthCondition) => void;
}

export const DynamicHomeHub: React.FC<Props> = ({
  onNavigateTab,
  activeConditions,
  onToggleCondition
}) => {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Dynamic rotation: cycle spotlight based on session counter or mount
  useEffect(() => {
    try {
      const storedIdx = parseInt(sessionStorage.getItem('home_spotlight_idx') || '0', 10);
      const nextIdx = (storedIdx + 1) % ROTATING_SPOTLIGHTS.length;
      sessionStorage.setItem('home_spotlight_idx', nextIdx.toString());
      setSpotlightIndex(nextIdx);
    } catch {
      setSpotlightIndex(Math.floor(Math.random() * ROTATING_SPOTLIGHTS.length));
    }
  }, []);

  const currentSpotlight = ROTATING_SPOTLIGHTS[spotlightIndex];
  const SpotlightIcon = currentSpotlight.icon;

  return (
    <div className="space-y-4 no-print" dir="rtl">
      {/* 1. Dynamic Rotating Spotlight Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-700/60">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>التدوير الذكي المقترح لجلسة اليوم</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white">
                {currentSpotlight.badge}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{currentSpotlight.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {currentSpotlight.desc}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab(currentSpotlight.tab)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <SpotlightIcon className="w-4 h-4" />
            <span>تجربة الوحدة الآن</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* 2. ملفي الصحي التحذيري (Personal Health Alert Profile) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  ملفي الصحي التحذيري للسلامة الشخصية
                </h3>
                {activeConditions.length > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {activeConditions.length} حالة نشطة
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                    لم تحدد بعد
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                حدد أمراضك المزمنة أو حساسيتك الدوائية؛ ليقوم التطبيق بتحذيرك فورياً عند مسح أي دواء يتعارض مع صحتك.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{isProfileExpanded ? 'طي الخيارات' : 'تخصيص الملف الصحي'}</span>
            {isProfileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Active Warning Banner when at least one condition is set */}
        {activeConditions.length > 0 && (
          <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                نظام الحماية الشخصي نشط: يراقب حالياً التوافق السريري مع (
                {activeConditions
                  .map(c => HEALTH_CONDITIONS_META.find(m => m.id === c)?.titleAr)
                  .filter(Boolean)
                  .join('، ')}
                )
              </span>
            </div>
            <span className="text-[11px] text-amber-800 font-medium">
              محفوظ بأمان في متصفحك محلياً 🔒
            </span>
          </div>
        )}

        {/* Expandable Health Conditions Selector Chips */}
        {isProfileExpanded && (
          <div className="p-4 sm:p-5 bg-white space-y-3 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-slate-700">
              اضغط على الحالات الصحية أو أنواع الحساسية التي تنطبق عليك لتفعيل التنبيهات الذكية:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {HEALTH_CONDITIONS_META.map(meta => {
                const isSelected = activeConditions.includes(meta.id);
                return (
                  <button
                    key={meta.id}
                    onClick={() => onToggleCondition(meta.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200 shadow-2xs'
                        : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-white border border-slate-300 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${isSelected ? 'text-rose-900' : 'text-slate-900'}`}>
                          {meta.titleAr}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-rose-700">نشط</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {meta.shortDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeConditions.length > 0 && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsProfileExpanded(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  حفظ وتطبيق الحماية
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
