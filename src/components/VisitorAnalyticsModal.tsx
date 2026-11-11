import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Activity,
  Lock,
  X,
  Download,
  RefreshCw,
  Smartphone,
  Globe,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { VisitorStatsSummary } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  publicStats?: any;
  onRefreshPublicStats?: () => void;
}

const VALID_ADMIN_CODES = ['tabony2026', '2026'];

export const VisitorAnalyticsModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<VisitorStatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/visitor-stats');
      if (res.ok) {
        const data: VisitorStatsSummary = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Error fetching visitor stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (VALID_ADMIN_CODES.includes(adminCode.trim())) {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setError('رمز المرور غير صحيح. هذه البوابة مخصصة لمدير النظام فقط.');
    }
  };

  const handleExportCSV = () => {
    if (!stats?.recentVisitors || stats.recentVisitors.length === 0) return;

    const headers = ['التاريخ والوقت', 'النشاط / العملية', 'التفاصيل', 'الجهاز', 'المتصفح', 'الدولة', 'عنوان IP'];
    const rows = stats.recentVisitors.map(v => [
      new Date(v.timestamp).toLocaleString('ar-LY'),
      v.action,
      v.details || '-',
      v.device,
      v.browser,
      v.country,
      v.ip,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_زوار_المساعد_الطبي_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">إحصائيات حركة الموقع وسجل الزوار</h3>
              <p className="text-xs text-slate-300">متابعة حية للزيارات والفحوصات الطبية المنجزة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  إجمالي الزيارات
                </span>
                <p className="text-2xl font-black text-emerald-950 mt-1 font-mono">{stats.totalVisits}</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-xs font-bold text-blue-800 flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  زوار فريدون
                </span>
                <p className="text-2xl font-black text-blue-950 mt-1 font-mono">{stats.uniqueVisitors}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-center">
                <span className="text-xs font-bold text-amber-900 flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  إجمالي الفحوصات
                </span>
                <p className="text-2xl font-black text-amber-950 mt-1 font-mono">{stats.totalScans}</p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-center">
                <span className="text-xs font-bold text-teal-800 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  متواجدون الآن
                </span>
                <p className="text-2xl font-black text-teal-950 mt-1 font-mono">{stats.onlineNow}</p>
              </div>
            </div>
          )}

          {stats?.breakdown && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <h4 className="text-xs font-extrabold text-slate-700 mb-3">توزيع العمليات حسب الأقسام:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">فحص الأدوية</span>
                  <strong className="text-base font-mono text-emerald-700">{stats.breakdown.medicine}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">تحاليل المختبر</span>
                  <strong className="text-base font-mono text-teal-700">{stats.breakdown.lab}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">قراءة الروشتات</span>
                  <strong className="text-base font-mono text-indigo-700">{stats.breakdown.prescription}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">فحص التعارضات</span>
                  <strong className="text-base font-mono text-amber-700">{stats.breakdown.interaction}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">مسح الباركود</span>
                  <strong className="text-base font-mono text-purple-700">{stats.breakdown.barcode}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Secure Admin Form - No password shown */}
          {!isAuthenticated ? (
            <form
              onSubmit={handleLogin}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-md mx-auto text-center"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">سجل الزوار التفصيلي (خاص بمدير النظام)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل رمز المرور السري لعرض تفاصيل الزوار وعناوين IP وتصدير السجل إلى Excel.
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  placeholder="أدخل رمز المرور..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-center font-mono"
                />
                <button
                  type="submit"
                  disabled={!adminCode.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  دخول
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>سجل حركة الزوار التفصيلي ({stats?.recentVisitors?.length || 0} عملية مسجلة):</span>
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchStats}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>تحديث</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير Excel (CSV)</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">الوقت والتاريخ</th>
                        <th className="py-2.5 px-3">العملية</th>
                        <th className="py-2.5 px-3">التفاصيل</th>
                        <th className="py-2.5 px-3">الجهاز والمتصفح</th>
                        <th className="py-2.5 px-3">الدولة / IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats?.recentVisitors && stats.recentVisitors.length > 0 ? (
                        stats.recentVisitors.map(item => (
                          <tr key={item.id} className="hover:bg-emerald-50/40">
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(item.timestamp).toLocaleString('ar-LY')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{item.action}</td>
                            <td className="py-2.5 px-3 text-emerald-800 font-medium">{item.details || '-'}</td>
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-slate-400" />
                                {item.device} • {item.browser}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1">
                                <Globe className="w-3 h-3 text-emerald-600" />
                                {item.country} ({item.ip})
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            لا توجد سجلات بعد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};