import {
  History,
  X,
  Trash2,
  Calendar,
  Pill,
  FileSpreadsheet,
  ArrowRight,
  Printer,
  ShieldAlert,
  FileText
} from 'lucide-react';

import { SavedHistoryItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: SavedHistoryItem[];
  onSelect: (item: SavedHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const ScanHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">سجل الفحوصات والتحاليل المحفوظة</h3>
              <p className="text-xs text-slate-500">{items.length} عنصر محفوظ محلياً</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                مسح الكل
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">لا يوجد سجلات محفوظة بعد</p>
              <p className="mt-1">
                عند فحص أي دواء أو تحليل، يمكنك الضغط على زر الحفظ لحفظه والرجوع إليه لاحقاً.
              </p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="border border-slate-200 hover:border-emerald-500 rounded-xl p-3.5 bg-white transition-all flex items-start justify-between gap-3 group"
              >
                <div 
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded-md bg-slate-100 text-slate-600">
                      {item.type === 'medicine' ? (
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      ) : item.type === 'interaction' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      ) : item.type === 'prescription' ? (
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                      )}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.summary}</p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="فتح التقرير"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>يتم حفظ السجلات محلياً في متصفحك لضمان خصوصيتك.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
