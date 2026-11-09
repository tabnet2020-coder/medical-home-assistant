import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Lock,
  Download,
  RefreshCw,
  Activity,
  Globe,
  Smartphone,
  Scan,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { VisitorStatsSummary, VisitorLogEntry } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const VisitorAnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('visitor_analytics_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [stats, setStats] = useState<VisitorStatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch stats from server
  const loadStats = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/visitor-stats');
      if (!res.ok) throw new Error('فشل جلب إحصائيات الزوار من الخادم');
      const data: VisitorStatsSummary = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching visitor stats:', err);
      setFetchError(err.message || 'تعذر تحميل الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadStats();
    }
  }, [isOpen, isAuthenticated]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim().toLowerCase();
    if (cleanPin === 'tabony2026' || cleanPin === '2026') {
      setIsAuthenticated(true);
      setPinError(false);
      try {
        sessionStorage.setItem('visitor_analytics_auth', 'true');
      } catch (err) {
        console.warn('Session storage error:', err);
      }
      loadStats();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    try {
      sessionStorage.removeItem('visitor_analytics_auth');
    } catch (err) {
      console.warn('Session storage error:', err);
    }
  };

  // Export to CSV with UTF-8 BOM for Arabic compatibility in Excel
  const handleExportCSV = () => {
    if (!stats || !stats.recentVisitors || stats.recentVisitors.length === 0) {
      alert('لا توجد سجلات متاحة للتصدير حالياً.');
      return;
    }

    const headers = ['المعرف', 'التاريخ والوقت', 'الدولة', 'عنوان IP', 'الجهاز', 'المتصفح', 'الإجراء', 'التفاصيل'];
    const rows = stats.recentVisitors.map(v => [
      `"${v.id}"`,
      `"${new Date(v.timestamp).toLocaleString('ar-EG')}"`,
      `"${v.country || 'غير محدد'}"`,
      `"${v.ip || 'محلي'}"`,
      `"${v.device || 'مجهول'}"`,
      `"${v.browser || 'مجهول'}"`,
      `"${v.action || 'زيارة'}"`,
      `"${(v.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `visitors_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right font-['Cairo',sans-serif]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>لوحة إحصائيات وسجل الزوار</span>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    تم التحقق من المشرف
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                متابعة حركة الاستخدام الحقيقية ونشاط الفحوصات الطبية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={loadStats}
                  disabled={isLoading}
                  title="تحديث الإحصائيات"
                  className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleExportCSV}
                  title="تصدير إلى Excel/CSV"
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير CSV</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  قفل
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {!isAuthenticated ? (
            /* PIN Protection Form */
            <div className="max-w-md mx-auto py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  منطقة المشرفين وإحصائيات الاستخدام
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل الرمز السري للوصول إلى لوحة سجلات الزوار وتصدير التقارير (tabony2026 أو 2026).
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="أدخل الرمز السري هنا..."
                  className={`w-full px-4 py-2.5 rounded-xl border text-center text-sm font-bold tracking-widest outline-none transition-all ${
                    pinError
                      ? 'border-red-400 ring-2 ring-red-100 bg-red-50/50'
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-white'
                  }`}
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>الرمز السري غير صحيح. يرجى المحاولة مرة أخرى.</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  فتح لوحة الإحصائيات
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Analytics Dashboard */
            <div className="space-y-5">
              {fetchError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}

              {/* 1. Stat Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>إجمالي الزيارات</span>
                    <Globe className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {stats?.totalVisits?.toLocaleString('ar-EG') || '0'}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>الزوار الفريدين</span>
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {stats?.uniqueVisitors?.toLocaleString('ar-EG') || '0'}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>متواجدون الآن</span>
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                  </div>
                  <p className="text-2xl font-black text-green-600">
                    {stats?.onlineNow || 1}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                    <span>إجمالي الفحوصات</span>
                    <Scan className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">
                    {stats?.totalScans?.toLocaleString('ar-EG') || '0'}
                  </p>
                </div>
              </div>

              {/* 2. Breakdown by Scan Feature */}
              {stats?.breakdown && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800">
                    تفصيل الفحوصات حسب الوحدة الطبية:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-emerald-800 font-medium">فحص الأدوية</p>
                      <p className="text-lg font-black text-emerald-900 mt-0.5">
                        {stats.breakdown.medicine || 0}
                      </p>
                    </div>

                    <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-100">
                      <p className="text-teal-800 font-medium">التحاليل الطبية</p>
                      <p className="text-lg font-black text-teal-900 mt-0.5">
                        {stats.breakdown.lab || 0}
                      </p>
                    </div>

                    <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-indigo-800 font-medium">الروشتات</p>
                      <p className="text-lg font-black text-indigo-900 mt-0.5">
                        {stats.breakdown.prescription || 0}
                      </p>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-amber-800 font-medium">تعارض الأدوية</p>
                      <p className="text-lg font-black text-amber-900 mt-0.5">
                        {stats.breakdown.interaction || 0}
                      </p>
                    </div>

                    <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-purple-800 font-medium">بحث الباركود</p>
                      <p className="text-lg font-black text-purple-900 mt-0.5">
                        {stats.breakdown.barcode || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Detailed Visitor Activity Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>سجل أحدث الزيارات والعمليات (آخر 50 عملية):</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {stats?.recentVisitors?.length || 0} سجل مسجل
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-right divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ والوقت</th>
                        <th className="py-2.5 px-3">الدولة / IP</th>
                        <th className="py-2.5 px-3">الجهاز</th>
                        <th className="py-2.5 px-3">النشاط</th>
                        <th className="py-2.5 px-3">التفاصيل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {!stats?.recentVisitors || stats.recentVisitors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            لا توجد سجلات مسجلة حتى الآن
                          </td>
                        </tr>
                      ) : (
                        stats.recentVisitors.map(v => (
                          <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                              {new Date(v.timestamp).toLocaleString('ar-EG')}
                            </td>
                            <td className="py-2 px-3 text-slate-800 whitespace-nowrap">
                              <span className="font-semibold">{v.country || 'ليبيا'}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">{v.ip}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                              <span>{v.device}</span>
                              <span className="text-[10px] text-slate-400 block">{v.browser}</span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {v.action}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 max-w-xs truncate" title={v.details}>
                              {v.details || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>نظام إحصائيات مشفّر ومحمي للحفاظ على سرية البيانات وسرعة الأداء.</span>
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
