import React from 'react';
import { AlertCircle, ChevronLeft } from 'lucide-react';

interface Props {
  onOpenDetails: () => void;
}

export const DisclaimerBanner: React.FC<Props> = ({ onOpenDetails }) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-amber-800">تنبيه طبي وقانوني:</span>
          <span>
            هذا التطبيق أداة مساعدة وتثقيفية فقط، ولا يغني إطلاقاً عن استشارة الطبيب أو الصيدلي قبل تناول أو تغيير أي دواء.
          </span>
        </div>
        <button
          onClick={onOpenDetails}
          className="text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-0.5 cursor-pointer text-[11px]"
        >
          <span>قراءة الإقرار الطبي الكامل</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
