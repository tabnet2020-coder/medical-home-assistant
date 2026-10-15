import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Activity,
  Heart,
  Droplet,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { labReferencesList } from '../data/medicalDatabase';
import { LabReference } from '../types';

export const LabReferenceGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTest, setSelectedTest] = useState<LabReference | null>(null);

  const filteredList = labReferencesList.filter(item => {
    const matchesSearch =
      item.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-teal-600" />
              <span>موسوعة التحاليل الطبية والنسب المرجعية</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              دليل شامل للفحوصات المخبرية الأكثر شيوعاً، والنسب الطبيعية المعتمدة، ودلالات الارتفاع والانخفاض للمريض العادي.
            </p>
          </div>
          <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
            {labReferencesList.length} فحص معملي مرجعي
          </span>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الرمز (مثل: WBC, هيموجلوبين, سكر صائم, كرياتينين)..."
              className="w-full text-xs sm:text-sm pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer"
            >
              <option value="all">جميع فئات الفحوصات</option>
              <option value="cbc">صورة الدم الكاملة (CBC)</option>
              <option value="blood_sugar">السكر والأيض</option>
              <option value="lipids">دهون الدم والكوليسترول</option>
              <option value="kidney">وظائف الكلى</option>
              <option value="liver">وظائف الكبد</option>
              <option value="vitamins_hormones">الفيتامينات والغدد</option>
              <option value="inflammation">مؤشرات الالتهاب</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedTest(item)}
            className="bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md p-5 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {item.code}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {item.categoryAr}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                {item.nameAr}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {item.nameEn}
              </p>

              {/* Reference range pill */}
              <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">النسبة المرجعية السليمة:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {item.minValue} - {item.maxValue} {item.unit}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                {item.normalDescriptionAr}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
              <span>عرض تفاصيل دلالة الفحص</span>
              <span>←</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Detailed Lab Explanation */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800">
                  {selectedTest.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedTest.nameAr}
                </h3>
                <p className="text-xs text-slate-500">{selectedTest.nameEn}</p>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Reference range box */}
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl text-xs flex justify-between items-center">
              <span className="font-bold text-teal-900">المعدل الطبيعي القياسي:</span>
              <span className="font-mono font-black text-teal-800 text-sm">
                {selectedTest.minValue} - {selectedTest.maxValue} {selectedTest.unit}
              </span>
            </div>

            {selectedTest.preparationAdviceAr && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-start gap-2 text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">شروط إجراء الفحص: </span>
                  <span>{selectedTest.preparationAdviceAr}</span>
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>دلالة المعدل الطبيعي:</span>
                </h4>
                <p className="text-slate-700 leading-relaxed">{selectedTest.normalDescriptionAr}</p>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>ماذا يعني ارتفاع النتيجة؟</span>
                </h4>
                <p className="text-rose-800 leading-relaxed">{selectedTest.highMeaningAr}</p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <ArrowDownRight className="w-4 h-4 text-amber-600" />
                  <span>ماذا يعني انخفاض النتيجة؟</span>
                </h4>
                <p className="text-amber-800 leading-relaxed">{selectedTest.lowMeaningAr}</p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>إرشادات منزلية وتوصيات عامة:</span>
                </h4>
                <p className="text-emerald-900 leading-relaxed">{selectedTest.homeAdviceAr}</p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedTest(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
