import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  RefreshCw, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  ShieldCheck, 
  Apple, 
  Moon, 
  Ban, 
  Share2,
  Sparkles,
  Calendar
} from 'lucide-react';
import { healthTipsList, HealthTip, HealthTipCategory } from '../data/healthTips';

interface HealthTipBannerProps {
  className?: string;
}

export const HealthTipBanner: React.FC<HealthTipBannerProps> = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  // Deterministically select today's single tip based on day of the year
  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const dailyIndex = dayOfYear % healthTipsList.length;
    setCurrentIndex(dailyIndex);
  }, []);

  const currentTip = healthTipsList[currentIndex % healthTipsList.length] || healthTipsList[0];

  const handleNextTip = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % healthTipsList.length);
      setAnimating(false);
    }, 150);
  };

  const handleCopyTip = async () => {
    if (!currentTip) return;
    const textToCopy = `💡 نصيحة اليوم الصحية (${currentTip.categoryLabelAr}):\n${currentTip.titleAr}\n\n📌 الإجراء العملي:\n${currentTip.tipAr}\n\n🔬 الأثر الطبي:\n${currentTip.scientificFactAr}\n\n— المساعد الطبي المنزلي`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getCategoryTheme = (category: HealthTipCategory) => {
    switch (category) {
      case 'smoking':
        return {
          icon: Ban,
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          accent: 'text-rose-600',
          bgGradient: 'from-rose-50/60 via-white to-amber-50/30',
          border: 'border-rose-100',
        };
      case 'fitness':
        return {
          icon: Activity,
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          accent: 'text-sky-600',
          bgGradient: 'from-sky-50/60 via-white to-emerald-50/30',
          border: 'border-sky-100',
        };
      case 'prevention':
        return {
          icon: ShieldCheck,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'text-emerald-600',
          bgGradient: 'from-emerald-50/60 via-white to-teal-50/30',
          border: 'border-emerald-100',
        };
      case 'nutrition':
        return {
          icon: Apple,
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          accent: 'text-amber-600',
          bgGradient: 'from-amber-50/60 via-white to-orange-50/30',
          border: 'border-amber-100',
        };
      case 'habits':
        return {
          icon: Moon,
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          accent: 'text-indigo-600',
          bgGradient: 'from-indigo-50/60 via-white to-teal-50/30',
          border: 'border-indigo-100',
        };
      default:
        return {
          icon: Lightbulb,
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accent: 'text-emerald-600',
          bgGradient: 'from-emerald-50/50 via-white to-slate-50',
          border: 'border-emerald-100',
        };
    }
  };

  const theme = getCategoryTheme(currentTip.category);
  const CategoryIcon = theme.icon;

  return (
    <div className={`bg-white rounded-2xl border ${theme.border} shadow-xs overflow-hidden transition-all duration-300 ${className}`}>
      {/* Top Header Bar */}
      <div className={`px-4 sm:px-6 py-3 bg-gradient-to-r ${theme.bgGradient} border-b border-slate-100 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-amber-500 shrink-0">
            <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 tracking-tight">نصيحة اليوم الصحية</span>
              <span className="text-slate-300 text-xs">•</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg} flex items-center gap-1`}>
                <CategoryIcon className="w-2.5 h-2.5" />
                {currentTip.categoryLabelAr}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNextTip}
            title="تغيير النصيحة عشوائياً"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${animating ? 'animate-spin' : ''}`} />
            <span>نصيحة أخرى</span>
          </button>

          <button
            onClick={handleCopyTip}
            title="نسخ ومشاركة النصيحة"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-600" />
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'توسيع' : 'طي'}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Single Tip Body */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-3">
          <div className={`transition-opacity duration-150 ${animating ? 'opacity-30' : 'opacity-100'}`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 mt-0.5">
                <CategoryIcon className={`w-5 h-5 ${theme.accent}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {currentTip.titleAr}
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">
                    #{currentTip.tag}
                  </span>
                </div>

                {/* Practical Advice */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-800 text-xs sm:text-sm leading-relaxed mb-2.5">
                  <span className="font-bold text-slate-900 block mb-0.5">💡 الإجراء اليومي المقترح:</span>
                  {currentTip.tipAr}
                </div>

                {/* Scientific Fact */}
                <div className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-600 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-2.5 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">الأثر الطبي المثبت: </span>
                    <span>{currentTip.scientificFactAr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 mt-2.5 border-t border-slate-100">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>نصيحة يومية متجددة تلقائياً • موضوع اليوم: {currentTip.categoryLabelAr}</span>
              </span>
              {isCopied && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> تم نسخ النصيحة!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
