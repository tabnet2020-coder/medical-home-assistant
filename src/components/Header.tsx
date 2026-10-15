import React, { useState, useEffect } from 'react';
import {
  Pill,
  FileSpreadsheet,
  BookOpen,
  Database,
  History,
  ShieldCheck,
  Sparkles,
  MapPin,
  GitCommit
} from 'lucide-react';
import { APP_CURRENT_VERSION } from '../data/changelog';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'medicine' | 'lab' | 'medicine_directory' | 'lab_guide';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenHistory: () => void;
  savedCount: number;
  onOpenChangelog?: () => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenHistory,
  savedCount,
  onOpenChangelog,
}) => {
  const [isElderlyMode, setIsElderlyMode] = useState(false);

  useEffect(() => {
    try {
      const isSaved = localStorage.getItem('elderly_mode') === 'true';
      if (isSaved) {
        document.documentElement.classList.add('elderly-mode');
        setIsElderlyMode(true);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable in Header:', e);
    }
  }, []);

  const toggleElderlyMode = () => {
    const nextState = !isElderlyMode;
    setIsElderlyMode(nextState);
    if (nextState) {
      document.documentElement.classList.add('elderly-mode');
      try {
        localStorage.setItem('elderly_mode', 'true');
      } catch (e) {
        console.warn('LocalStorage setItem unavailable:', e);
      }
    } else {
      document.documentElement.classList.remove('elderly-mode');
      try {
        localStorage.setItem('elderly_mode', 'false');
      } catch (e) {
        console.warn('LocalStorage setItem unavailable:', e);
      }
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2.5 flex-wrap gap-2">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center text-white shrink-0">
              <div className="w-full h-full bg-emerald-700/20 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
                <Pill className="w-5 h-5 sm:w-6 sm:rotate-45 rotate-45" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                  المساعد الطبي المنزلي
                </h1>
                <span className="hidden sm:flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 items-center gap-1 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  مبادرة إنسانية مجانية
                </span>
              </div>
              <p className="hidden md:flex text-xs text-slate-500 font-medium items-center gap-1.5 mt-0.5">
                <span>دليلك الصحي الموثوق لقراءة التحاليل والتعرف على الأدوية والبدائل</span>
              </p>
            </div>
          </div>

          {/* Quick Actions (Elderly Mode, PWA Install, History & Version) */}
          <div className="flex items-center shrink-0 gap-1.5">
            {/* Elderly Mode (وضع كبار السن A+) */}
            <button
              onClick={toggleElderlyMode}
              title={isElderlyMode ? 'إيقاف وضع كبار السن (الخط العادي)' : 'تفعيل وضع كبار السن (تكبير الخط A+)'}
              className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isElderlyMode
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              <span className="font-black text-xs sm:text-sm leading-none font-mono">A+</span>
              <span className="hidden md:inline">{isElderlyMode ? 'الخط مكبّر' : 'وضع كبار السن'}</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {onOpenChangelog && (
              <button
                onClick={onOpenChangelog}
                title="سجل التحديثات والإصدارات (Changelog)"
                className="hidden lg:flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer"
              >
                <GitCommit className="w-3.5 h-3.5 text-emerald-600" />
                <span>{APP_CURRENT_VERSION}</span>
              </button>
            )}

            <button
              onClick={onOpenHistory}
              title="سجل الفحوصات المحفوظة"
              className="shrink-0 relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">السجل المحفوظ</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center -mr-0.5 sm:-mr-1">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar border-t border-slate-100 pt-1">
          <button
            onClick={() => setActiveTab('medicine')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'medicine'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Pill className={`w-4 h-4 ${activeTab === 'medicine' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>وحدة فحص الأدوية والبدائل</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lab'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'lab' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>وحدة قراءة أوراق التحاليل</span>
          </button>

          <button
            onClick={() => setActiveTab('medicine_directory')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'medicine_directory'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === 'medicine_directory' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>دليل الأدوية والبدائل</span>
          </button>

          <button
            onClick={() => setActiveTab('lab_guide')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'lab_guide'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'lab_guide' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>موسوعة التحاليل المرجعية</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
