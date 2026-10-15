import React, { useState } from 'react';
import {
  ArrowRight,
  Pill,
  Building,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRightLeft,
  ExternalLink,
  Layers,
  Clock,
  HeartPulse
} from 'lucide-react';
import { Medicine, ActiveIngredient } from '../types';
import { medicinesList, activeIngredientsList } from '../data/medicalDatabase';
import { MedicinePackagingVisual } from './MedicinePackagingVisual';

interface MedicineDetailPageProps {
  medicine: Medicine;
  onBack: () => void;
  onSelectMedicine: (med: Medicine) => void;
  onSaveToHistory?: (med: Medicine) => void;
}

export const MedicineDetailPage: React.FC<MedicineDetailPageProps> = ({
  medicine,
  onBack,
  onSelectMedicine,
  onSaveToHistory
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Active ingredient
  const activeIngredient = activeIngredientsList.find(
    (a) => a.id === medicine.activeIngredientId
  );

  // All commercial alternatives sharing the same active ingredient
  const alternatives = medicinesList.filter(
    (m) => m.activeIngredientId === medicine.activeIngredientId && m.id !== medicine.id
  );

  // List of all pharmaceutical companies that manufacture this active ingredient
  const allRelatedMeds = medicinesList.filter(
    (m) => m.activeIngredientId === medicine.activeIngredientId
  );
  const manufacturerCompanies = Array.from(
    new Set(allRelatedMeds.map((m) => m.manufacturer))
  ).map((mfg) => {
    const medsByMfg = allRelatedMeds.filter((m) => m.manufacturer === mfg);
    return {
      name: mfg,
      products: medsByMfg
    };
  });

  const handleShare = async () => {
    const text = `💊 معلومات الدواء: ${medicine.tradeNameAr} (${medicine.tradeNameEn})\n• المادة الفعالة: ${activeIngredient?.nameAr || 'غير محدد'}\n• التركيز: ${medicine.strength}\n• الشركة: ${medicine.manufacturer}\n\n— المساعد الطبي المنزلي`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSaveToHistory) {
      onSaveToHistory(medicine);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-emerald-600" />
          <span>العودة إلى الصفحة السابقة</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="مشاركة معلومات الدواء"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'مشاركة الدواء'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="طباعة بطاقة الدواء"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">طباعة البطاقة</span>
          </button>

          {onSaveToHistory && (
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                saved
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{saved ? 'تم الحفظ في السجل' : 'حفظ في السجل'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Hero Section: Medicine Packaging Image + Core Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Packaging Box Visual Showcase (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <MedicinePackagingVisual medicine={medicine} size="lg" className="w-full shadow-lg" />
              <p className="text-[11px] text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>مجسم عبوة الدواء للتعرف البصري الفوري (اضغط على أيقونة العين لتكبير العبوة)</span>
              </p>
            </div>
          </div>

          {/* Details & Specifications (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {medicine.dosageForm}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {medicine.strength}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    medicine.prescriptionRequired
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {medicine.prescriptionRequired ? 'يتطلب وصفة طبية (Rx)' : 'بدون وصفة (OTC)'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {medicine.tradeNameAr}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-500 font-mono mt-1">
                {medicine.tradeNameEn}
              </p>
            </div>

            {/* Active Substance Card */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  المادة الفعالة الدوائية (Active Ingredient)
                </span>
                <p className="text-base font-extrabold text-emerald-950 mt-0.5">
                  {activeIngredient ? activeIngredient.nameAr : 'مادة فعالة قياسية'}
                </p>
                {activeIngredient && (
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    {activeIngredient.nameEn} • {activeIngredient.drugClass}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 block font-medium">الشركة المصنعة:</span>
                <span className="text-xs font-bold text-slate-800 block mt-1 truncate">
                  {medicine.manufacturer}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-400 block font-medium">شكل الجرعة:</span>
                <span className="text-xs font-bold text-slate-800 block mt-1 truncate">
                  {medicine.dosageForm}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block font-medium">الباركود الدولي:</span>
                <span className="text-xs font-mono font-bold text-slate-800 block mt-1 truncate">
                  {medicine.barcode || '62510002931'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
              {medicine.descriptionAr}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Medical Guide Sections (Indications, Warnings, Side Effects, Dosage) */}
      {activeIngredient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Indications (دواعي الاستعمال) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>دواعي الاستعمال والعلاج (Indications):</span>
            </h3>
            <ul className="space-y-2">
              {activeIngredient.indications.map((ind, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings & Precautions (التحذيرات وموانع الاستعمال) */}
          <div className="bg-white rounded-2xl border border-rose-200/80 p-5 sm:p-6 shadow-xs space-y-3 bg-rose-50/20">
            <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>موانع الاستعمال والتحذيرات الهامة (Warnings):</span>
            </h3>
            <ul className="space-y-2">
              {activeIngredient.warnings.map((warn, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-900 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Side Effects (الآثار الجانبية) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-600" />
              <span>الآثار الجانبية الشائعة (Side Effects):</span>
            </h3>
            <ul className="space-y-2 mb-3">
              {activeIngredient.sideEffects.map((side, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{side}</span>
                </li>
              ))}
            </ul>

            {activeIngredient.severeSideEffects && activeIngredient.severeSideEffects.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-rose-950">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  أعراض تستوجب مراجعة الطبيب فوراً:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-rose-800 pr-1">
                  {activeIngredient.severeSideEffects.map((sev, idx) => (
                    <li key={idx}>{sev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Safe Usage & Storage Advice (طريقة الاستخدام والتخزين) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>تعليمات الاستخدام الآمن والحفظ المنزلي:</span>
            </h3>
            <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100 text-xs sm:text-sm text-teal-950 leading-relaxed font-medium">
              {activeIngredient.safeUsageAdvice}
            </div>

            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <p>• <strong>ظروف التخزين:</strong> يحفظ في مكان جاف وبارد تحت درجة حرارة 25° مئوية، بعيداً عن الرطوبة وحرارة المطبخ أو الحمام.</p>
              <p>• <strong>الحفظ بعيداً عن الأطفال:</strong> احتفظ بالدواء في عبوته الأصلية محكمة الإغلاق بعيداً عن متناول أيدي الصغار.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. OTHER PHARMACEUTICAL COMPANIES MANUFACTURING THIS DRUG (الشركات المصنعة الأخرى) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <span>الشركات والمصانع المصنعة لنفس المادة الفعالة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              شركات دوائية مسجلة تنتج مستحضرات تحتوي على نفس المادة ({activeIngredient?.nameAr || medicine.tradeNameAr}):
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {manufacturerCompanies.length} شركات ومصانع دوائية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {manufacturerCompanies.map((mfg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all ${
                mfg.name === medicine.manufacturer
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{mfg.name}</span>
                </span>
                {mfg.name === medicine.manufacturer && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    الشركة الحالية
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                <span className="font-medium text-slate-600">المستحضرات: </span>
                {mfg.products.map((p, pIdx) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectMedicine(p)}
                    className="text-emerald-700 hover:underline font-bold mr-1 inline-block cursor-pointer"
                  >
                    {p.tradeNameAr}
                    {pIdx < mfg.products.length - 1 ? '،' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MATCHING COMMERCIAL ALTERNATIVES GALLERY (معرض البدائل التجارية بالصور) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <span>البدائل التجارية المتطابقة بالصور (Commercial Alternatives)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              أدوية بديلة مكافئة حيوياً بنسبة 100% تحتوي على نفس المادة الفعالة ({activeIngredient?.nameAr}) وتؤدي نفس الوظيفة تماماً.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            {alternatives.length} بدائل مطابقة
          </span>
        </div>

        <div className="p-6">
          {alternatives.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onSelectMedicine(alt)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-lg transition-all p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Visual packaging thumbnail */}
                    <div className="overflow-hidden rounded-xl">
                      <MedicinePackagingVisual medicine={alt} size="sm" className="w-full" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          بديل متطابق 100%
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          {alt.strength}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {alt.tradeNameAr}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        {alt.tradeNameEn}
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{alt.manufacturer}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>الشكل: {alt.dosageForm}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                      {alt.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMedicine(alt);
                      }}
                      className="w-full py-2 text-xs font-bold text-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>عرض تفاصيل هذا البديل كاملاً</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">لا توجد بدائل تجارية مسجلة حالياً لنفس المادة في قاعدة البيانات المحلية.</p>
              <p className="text-xs text-slate-400 mt-1">يرجى استشارة الصيدلي لمعرفة البدائل المتاحة تجارياً في منطقتك.</p>
            </div>
          )}

          {/* Safety Reminder */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">تنويه للسلامة الدوائية:</span>
              <span>
                تطابق المادة الفعالة يضمن الفعالية العلاجية، ولكن يُنصح دوماً بمراجعة الطبيب أو الصيدلي قبل استبدال أي دواء للتأكد من ملاءمة التركيز والشكل الصيدلاني لحالتك الطبية.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
