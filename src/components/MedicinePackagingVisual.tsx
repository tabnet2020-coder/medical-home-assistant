import React, { useState } from 'react';
import { Pill, Building, ShieldCheck, Barcode, Eye, Sparkles, X, Layers } from 'lucide-react';
import { Medicine } from '../types';

interface MedicinePackagingVisualProps {
  medicine: Medicine;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MedicinePackagingVisual: React.FC<MedicinePackagingVisualProps> = ({
  medicine,
  size = 'md',
  showDetails = false,
  className = '',
  onClick
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Palette mapper for realistic pharmaceutical box styling based on drug name or explicit color
  const getTheme = (name: string, explicitColor?: string) => {
    if (explicitColor === 'red' || name.includes('إكسترا') || name.includes('بروفين') || name.includes('كاتافلام')) {
      return {
        headerBg: 'from-rose-600 to-red-700',
        accentBorder: 'border-red-400',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
        blisterBg: 'from-red-100 to-rose-200',
        stripColor: 'bg-red-600',
        lightBg: 'bg-red-50/50'
      };
    }
    if (explicitColor === 'blue' || name.includes('أوجمنتين') || name.includes('كيورام') || name.includes('سيتريزين')) {
      return {
        headerBg: 'from-blue-600 to-sky-700',
        accentBorder: 'border-sky-400',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        blisterBg: 'from-blue-100 to-sky-200',
        stripColor: 'bg-blue-600',
        lightBg: 'bg-blue-50/50'
      };
    }
    if (explicitColor === 'amber' || name.includes('سياليس') || name.includes('تايرا') || name.includes('فيتامين')) {
      return {
        headerBg: 'from-amber-500 to-yellow-600',
        accentBorder: 'border-amber-400',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        blisterBg: 'from-amber-100 to-yellow-200',
        stripColor: 'bg-amber-600',
        lightBg: 'bg-amber-50/50'
      };
    }
    if (explicitColor === 'purple' || name.includes('أوميبرازول') || name.includes('نيكسيوم') || name.includes('كونكور')) {
      return {
        headerBg: 'from-purple-600 to-indigo-700',
        accentBorder: 'border-purple-400',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
        blisterBg: 'from-purple-100 to-indigo-200',
        stripColor: 'bg-purple-600',
        lightBg: 'bg-purple-50/50'
      };
    }
    // Default medical emerald
    return {
      headerBg: 'from-emerald-600 to-teal-700',
      accentBorder: 'border-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      blisterBg: 'from-emerald-100 to-teal-200',
      stripColor: 'bg-emerald-600',
      lightBg: 'bg-emerald-50/50'
    };
  };

  const theme = getTheme(medicine.tradeNameAr, medicine.packColor);

  const containerSizes = {
    sm: 'h-36 text-[10px]',
    md: 'h-48 text-xs',
    lg: 'h-64 text-sm'
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`relative group rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:shadow-md hover:border-emerald-500' : ''
        } ${containerSizes[size]} ${className}`}
      >
        {/* If custom image url exists and loads */}
        {medicine.imageUrl ? (
          <div className="relative w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={medicine.imageUrl}
              alt={medicine.tradeNameAr}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // fallback to rendered packaging on error
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-white font-bold text-xs truncate drop-shadow-md">
                {medicine.tradeNameAr}
              </span>
            </div>
          </div>
        ) : (
          /* Realistic 3D Pharmaceutical Packaging Render */
          <div className="w-full h-full flex flex-col justify-between select-none relative bg-gradient-to-b from-slate-50 via-white to-slate-100">
            {/* Top Brand Header Bar */}
            <div className={`bg-gradient-to-r ${theme.headerBg} p-2.5 sm:p-3 text-white flex items-center justify-between shadow-2xs`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <Pill className="w-3.5 h-3.5 rotate-45 shrink-0 opacity-90" />
                <span className="font-extrabold tracking-tight truncate text-[11px] sm:text-xs">
                  {medicine.tradeNameEn}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/25 backdrop-blur-xs shrink-0">
                {medicine.strength}
              </span>
            </div>

            {/* Packaging Middle Area (Foil Blister & Emblem) */}
            <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-slate-900 truncate text-sm sm:text-base tracking-tight">
                  {medicine.tradeNameAr}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {medicine.dosageForm}
                </p>
              </div>

              {/* Blister tablet pack representation */}
              <div className="my-1.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2 shadow-inner">
                {[1, 2, 3, 4].map((dot) => (
                  <div
                    key={dot}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br ${theme.blisterBg} border border-white shadow-2xs flex items-center justify-center`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  </div>
                ))}
                <span className="text-[9px] font-mono text-slate-400 mr-1 hidden sm:inline">
                  {medicine.strength}
                </span>
              </div>

              {/* Bottom Metadata */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 truncate max-w-[70%]">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{medicine.manufacturer}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-slate-100 text-slate-600 font-mono">
                  Rx/OTC
                </span>
              </div>
            </div>

            {/* Subtle Hologram & Security Edge Strip */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-70" />
          </div>
        )}

        {/* Quick Zoom Trigger overlay button on hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
          title="معاينة مجسم العبوة بحجم كبير"
          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fullscreen Packaging Inspection Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className={`p-4 bg-gradient-to-r ${theme.headerBg} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 rotate-45" />
                <span className="font-bold text-sm">معاينة العبوة الصيدلانية</span>
              </div>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="h-56 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100 border border-slate-200 p-4 flex flex-col justify-between shadow-inner">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${theme.headerBg} text-white flex justify-between items-center`}>
                  <div>
                    <h3 className="font-extrabold text-base">{medicine.tradeNameEn}</h3>
                    <p className="text-xs text-white/80">{medicine.tradeNameAr}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-white/20 font-bold text-xs">{medicine.strength}</span>
                </div>

                {/* Foil blister mockup */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-around">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.blisterBg} border border-slate-300 shadow-xs flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">TAB</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold">{medicine.manufacturer}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Barcode className="w-3.5 h-3.5" />
                    {medicine.barcode || '62510098231'}
                  </span>
                </div>
              </div>

              {/* Text Description */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">{medicine.tradeNameAr} ({medicine.tradeNameEn})</p>
                <p>{medicine.descriptionAr}</p>
                {medicine.notes && (
                  <p className="text-amber-800 font-medium mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 ملاحظة: {medicine.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsZoomOpen(false)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
