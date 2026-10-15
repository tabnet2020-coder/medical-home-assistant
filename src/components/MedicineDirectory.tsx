import React, { useState } from 'react';
import {
  Search,
  Pill,
  Building,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  Sparkles,
  Info,
  Filter,
  ExternalLink
} from 'lucide-react';
import { medicinesList, activeIngredientsList } from '../data/medicalDatabase';
import { Medicine, ActiveIngredient } from '../types';
import { MedicinePackagingVisual } from './MedicinePackagingVisual';

interface Props {
  onSelectMedicineForAnalysis?: (med: Medicine) => void;
  onOpenMedicineDetail?: (med: Medicine) => void;
}

export const MedicineDirectory: React.FC<Props> = ({ 
  onSelectMedicineForAnalysis,
  onOpenMedicineDetail 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string>('all');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  // Filter medicines
  const filteredMedicines = medicinesList.filter(med => {
    const matchesSearch =
      med.tradeNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.tradeNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.strength.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIngredient =
      selectedIngredientFilter === 'all' || med.activeIngredientId === selectedIngredientFilter;

    return matchesSearch && matchesIngredient;
  });

  // Get active ingredient for selected medicine
  const activeIngredient = selectedMedicine
    ? activeIngredientsList.find(a => a.id === selectedMedicine.activeIngredientId)
    : null;

  // Commercial alternatives sharing same active ingredient
  const commercialAlternatives = selectedMedicine
    ? medicinesList.filter(
        m => m.activeIngredientId === selectedMedicine.activeIngredientId && m.id !== selectedMedicine.id
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Pill className="w-6 h-6 text-emerald-600 rotate-45" />
              <span>دليل الأدوية والبدائل التجارية التفاعلي</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              ابحث عن أي دواء بالاسم التجاري أو العلمي لاستعراض الشركة المصنعة، المادة الفعالة، مجسم العبوة بالصور، والبدائل المتطابقة تماماً.
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
            {medicinesList.length} مستحضر دوائي مسجل بالصور
          </span>
        </div>

        {/* Search & Filters */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم التجاري (مثل: بانادول، بروفين، أوجمنتين، تايرا، سياليس)..."
              className="w-full text-xs sm:text-sm pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedIngredientFilter}
              onChange={e => setSelectedIngredientFilter(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
            >
              <option value="all">كل المواد الفعالة ({activeIngredientsList.length})</option>
              {activeIngredientsList.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Medicine Cards + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Medicine List Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMedicines.map(med => {
            const ingredient = activeIngredientsList.find(a => a.id === med.activeIngredientId);
            const isSelected = selectedMedicine?.id === med.id;

            return (
              <div
                key={med.id}
                onClick={() => setSelectedMedicine(med)}
                className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Packaging Visual Showcase */}
                  <div className="mb-3 overflow-hidden rounded-xl">
                    <MedicinePackagingVisual medicine={med} size="sm" className="w-full" />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {med.dosageForm}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {med.strength}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 hover:text-emerald-700 transition-colors">
                    {med.tradeNameAr}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {med.tradeNameEn}
                  </p>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">المادة:</span>
                      <span className="truncate">{ingredient?.nameAr}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{med.manufacturer}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>تصفح البدائل والمواصفات</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Medicine Details & Alternatives Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 lg:sticky lg:top-24 space-y-4">
          {selectedMedicine ? (
            <>
              {/* Packaging visual in sidebar */}
              <div className="overflow-hidden rounded-xl">
                <MedicinePackagingVisual medicine={selectedMedicine} size="md" className="w-full shadow-xs" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedMedicine.dosageForm} • {selectedMedicine.strength}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedMedicine.prescriptionRequired ? 'وصفة طبية Rx' : 'OTC بدون وصفة'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedMedicine.tradeNameAr}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedMedicine.tradeNameEn}
                </p>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedMedicine.descriptionAr}
                </p>
              </div>

              {/* Button to open full medicine page */}
              {onOpenMedicineDetail && (
                <button
                  type="button"
                  onClick={() => onOpenMedicineDetail(selectedMedicine)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>فتح صفحة الدواء الكاملة ومجسم العبوة ←</span>
                </button>
              )}

              {/* Active Ingredient Specs */}
              {activeIngredient && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                  <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>المادة الفعالة: {activeIngredient.nameAr}</span>
                  </h4>
                  <p className="text-emerald-900 text-[11px]">
                    {activeIngredient.drugClass}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-5">
                    <strong>الاستخدام الآمن:</strong> {activeIngredient.safeUsageAdvice}
                  </p>
                </div>
              )}

              {/* Commercial Alternatives Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
                  <span>البدائل التجارية المطابقة بالصور ({commercialAlternatives.length}):</span>
                </h4>

                {commercialAlternatives.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {commercialAlternatives.map(alt => (
                      <div
                        key={alt.id}
                        onClick={() => {
                          if (onOpenMedicineDetail) {
                            onOpenMedicineDetail(alt);
                          } else {
                            setSelectedMedicine(alt);
                          }
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer text-xs group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {alt.tradeNameAr}
                          </span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                            {alt.strength}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                          <span>{alt.tradeNameEn} • {alt.manufacturer}</span>
                          <span className="text-emerald-600 text-[10px] font-bold">عرض الصفحة ←</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg text-center">
                    لا توجد بدائل أخرى مسجلة لهذه التركيبة المحددة.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3 rotate-45" />
              <p className="font-bold text-slate-600 text-sm">اختر أي دواء من القائمة</p>
              <p className="mt-1 text-slate-400">لعرض مجسم العبوة الصيدلانية، وخصائص المادة الفعالة، والبدائل التجارية المتطابقة في الأسواق.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
