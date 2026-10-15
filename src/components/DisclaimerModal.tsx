import React from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export const DisclaimerModal: React.FC<Props> = ({ isOpen, onAccept, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-amber-200 overflow-hidden transform transition-all text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">إخلاء المسؤولية القانونية والطبية</h2>
            <p className="text-amber-100 text-xs mt-0.5">تنبيه هام ومحوري قبل استخدام التطبيق</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-700 leading-relaxed text-sm">
          <div className="p-4 bg-amber-50 border-r-4 border-amber-500 rounded-lg">
            <p className="font-bold text-amber-900 text-base mb-1">
              أداة مساعدة وتثقيفية فقط
            </p>
            <p className="text-amber-800 text-xs leading-5">
              هذا التطبيق مصمم لمساعدة المستخدمين في المنزل على فهم وقراءة التحاليل الطبية والتعرف على أسماء الأدوية وبدائلها، وهو <strong>ليس بديلاً على الإطلاق عن الاستشارة الطبية المتخصصة أو توجيهات الصيدلي القانوني</strong>.
            </p>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>استشارة الطبيب أولاً:</strong> يجب الرجوع للطبيب المعالج قبل تناول أو إيقاف أو تعديل جرعة أي دواء أو استبداله ببديل تجاري آخر.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>دقة قراءة التحاليل:</strong> قد تتأثر قراءة الفحوصات البصرية بجودة الصورة أو الإضاءة أو الخط، ويجب دائماً مقارنة النتائج بالورقة الأصلية من المختبر.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>الحالات الطارئة:</strong> في حالات الطوارئ الطبية أو الحساسية الحادة، يرجى التوجه لأقرب مركز طوارئ فوراً أو الاتصال بالإسعاف.</span>
            </li>
          </ul>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              حماية وخصوصية: لا يتم حفظ بياناتك الطبية دون إذنك
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <PhoneCall className="w-3.5 h-3.5" />
              طوارئ الإسعاف: 123 / 997
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            بالضغط على موافق، تقر بأنك قرأت هذا التنبيه وفهمت غرضه.
          </p>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            أوافق وأتفهم ذلك
          </button>
        </div>
      </div>
    </div>
  );
};
