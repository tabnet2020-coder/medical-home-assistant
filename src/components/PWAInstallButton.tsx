import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed as an app, hide the button
  if (isInstalled) {
    return null;
  }

  // Android & Desktop Chrome flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer animate-pulse hover:animate-none"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="sm:hidden">تثبيت</span>
        <span className="hidden sm:inline">تثبيت التطبيق على هاتفك</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="whitespace-nowrap shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span className="sm:hidden">تثبيت</span>
          <span className="hidden sm:inline">تثبيت على الآيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-right animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>تثبيت التطبيق على هاتف الآيفون (iPhone)</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span>اضغط على زر <strong>المشاركة (Share)</strong></span>
                    <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" />
                    <span>في الشريط السفلي لمتصفح Safari.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span>مرر لأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong></span>
                    <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" />
                    <span>(Add to Home Screen).</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>سيظهر التطبيق فوراً على شاشة هاتفك مع أيقونته الخاصة ويعمل كتطبيق أصلي!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers without direct trigger (e.g. standard Chrome/Firefox mobile)
  return (
    <button
      onClick={() => {
        alert('لتثبيت التطبيق على هاتفك:\n1. افتح قائمة المتصفح (الثلاث نقاط ⋮ بالأعلى).\n2. اضغط على "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
      }}
      className="hidden sm:flex whitespace-nowrap shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
    >
      <Download className="w-3.5 h-3.5 text-emerald-600" />
      <span>تثبيت التطبيق</span>
    </button>
  );
};
