import React from 'react';
import { X, GitCommit, Sparkles, Calendar, CheckCircle2, History, ShieldCheck } from 'lucide-react';
import { releaseHistory, APP_CURRENT_VERSION } from '../data/changelog';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/15">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">سجل التعديلات والإصدارات (Changelog)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 font-mono">
                  {APP_CURRENT_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                متابعة دقيقة لكافة التحديثات والميزات المضافة لتطبيق المساعد الطبي المنزلي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-slate-100">
          {releaseHistory.map((rel, index) => (
            <div key={rel.version} className={`pt-5 first:pt-0 space-y-2.5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    {rel.version}
                  </span>
                  {rel.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {rel.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {rel.releaseDate}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800">
                {rel.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {rel.summary}
              </p>

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">أبرز التحسينات والميزات:</span>
                <ul className="space-y-1">
                  {rel.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>إشراف: عمر الطابوني (سبها) • تحديث مستمر</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
