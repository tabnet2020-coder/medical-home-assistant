import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  SlidersHorizontal,
  Info,
  Edit2,
  Check,
  ShieldCheck,
  HeartPulse,
  Activity,
  Volume2,
  VolumeX,
  MessageCircle
} from 'lucide-react';
import { LabAnalysisResult, ParsedLabItem, LabStatus } from '../types';

interface Props {
  result: LabAnalysisResult;
  onSaveResult: (result: LabAnalysisResult) => void;
  isSaved?: boolean;
  onUpdateItemValue?: (testId: string, newValue: number) => void;
}

export const LabAnalyzer: React.FC<Props> = ({
  result,
  onSaveResult,
  isSaved = false,
  onUpdateItemValue,
}) => {
  const [filter, setFilter] = useState<'all' | 'abnormal' | 'cbc' | 'lipids' | 'sugar' | 'kidney' | 'liver'>('all');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editValueText, setEditValueText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [result]);

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('المتصفح لا يدعم القراءة الصوتية');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(result.overallSummaryAr);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShareWhatsApp = () => {
    const abnormal = result.tests.filter(t => t.status === 'HIGH' || t.status === 'LOW');
    const abnormalList = abnormal.length > 0
      ? `\n⚠️ *القيم غير الطبيعية الملاحظة:*\n${abnormal.map(t => `• ${t.testName}: ${t.extractedValue} ${t.extractedUnit} (${t.status === 'HIGH' ? 'مرتفع' : 'منخفض'})`).join('\n')}`
      : '\n✅ كافة الفحوصات المستخرجة ضمن النطاق الطبيعي.';

    const text = `📋 *ملخص نتائج التحاليل الطبية*
*إجمالي الفحوصات:* ${result.tests.length} (طبيعي: ${result.normalCount} | مرتفع: ${result.highCount} | منخفض: ${result.lowCount})
${abnormalList}

📌 *التلخيص العام:*
${result.overallSummaryAr}

— تم استخراج النتائج عبر تطبيق المساعد الطبي المنزلي`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtering tests
  const filteredTests = result.tests.filter(item => {
    if (filter === 'abnormal') return item.status === 'HIGH' || item.status === 'LOW';
    if (filter === 'cbc') return item.refData?.category === 'cbc';
    if (filter === 'lipids') return item.refData?.category === 'lipids';
    if (filter === 'sugar') return item.refData?.category === 'blood_sugar';
    if (filter === 'kidney') return item.refData?.category === 'kidney';
    if (filter === 'liver') return item.refData?.category === 'liver';
    return true;
  });

  const handleStartEdit = (item: ParsedLabItem) => {
    setEditingTestId(item.id);
    setEditValueText(String(item.extractedValue));
  };

  const handleSaveEdit = (testId: string) => {
    const num = parseFloat(editValueText);
    if (!isNaN(num) && onUpdateItemValue) {
      onUpdateItemValue(testId, num);
    }
    setEditingTestId(null);
  };

  const getStatusBadge = (status: LabStatus) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>طبيعي</span>
          </span>
        );
      case 'HIGH':
      case 'CRITICAL_HIGH':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>مرتفع</span>
          </span>
        );
      case 'LOW':
      case 'CRITICAL_LOW':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
            <span>منخفض</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700">
            غير محدد
          </span>
        );
    }
  };

  // Helper to render relative bar indicator
  const renderRangeBar = (item: ParsedLabItem) => {
    if (!item.refData) return null;
    const min = item.refData.minValue;
    const max = item.refData.maxValue;
    const val = item.extractedValue;

    // Normalize to 0 - 100 percentage
    const span = max - min;
    const leftMargin = min - span * 0.4;
    const rightMargin = max + span * 0.4;
    const totalSpan = rightMargin - leftMargin;

    let percentage = ((val - leftMargin) / totalSpan) * 100;
    percentage = Math.max(3, Math.min(97, percentage));

    const normalStart = ((min - leftMargin) / totalSpan) * 100;
    const normalWidth = (span / totalSpan) * 100;

    return (
      <div className="mt-2 space-y-1">
        <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          {/* Normal Zone (Green) */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-400/80 rounded-full"
            style={{ right: `${normalStart}%`, width: `${normalWidth}%` }}
          />
          {/* Pointer needle for user value */}
          <div
            className={`absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full shadow-md ${
              item.status === 'NORMAL' ? 'bg-emerald-700' : item.status === 'HIGH' ? 'bg-rose-600' : 'bg-amber-600'
            }`}
            style={{ right: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>الحد الأدنى: {min}</span>
          <span className="text-emerald-700 font-bold">النطاق السليم ({min} - {max})</span>
          <span>الحد الأقصى: {max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SUMMARY BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  تقرير تحاليل طبية معملية
                </span>
                <span className="text-xs text-teal-100">
                  {result.tests.length} فحص مستخرج
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                ملخص القراءة المخبرية الذكية
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Speech Button */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-white text-teal-900 hover:bg-teal-50'
              }`}
              title={isPlayingAudio ? 'إيقاف القراءة الصوتية' : 'استمع لملخص التحليل الصوتي'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>إيقاف الصوت</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  <span>🔊 استمع لملخص التحليل</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="إرسال النتيجة للطبيب / العائلة عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال النتيجة عبر واتساب</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl border text-xs font-bold bg-white/20 text-white border-white/30 backdrop-blur-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>دقة الاستخراج: {result.confidenceScore}%</span>
            </div>

            <button
              onClick={() => onSaveResult(result)}
              title={isSaved ? 'تم الحفظ في السجل' : 'حفظ في السجل'}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSaved ? 'bg-white text-teal-900' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATS COUNTER */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 font-medium">نتائج طبيعية (سليمة)</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{result.normalCount}</p>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 font-medium">نتائج مرتفعة (فوق الحد)</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{result.highCount}</p>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 font-medium">نتائج منخفضة (تحت الحد)</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{result.lowCount}</p>
          </div>
        </div>

        {/* AI Layman Overview Summary */}
        <div className="p-5 sm:p-6 bg-slate-50/30">
          <h3 className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-600" />
            التلخيص الطبي العام للتقرير:
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {result.overallSummaryAr}
          </p>
        </div>
      </div>

      {/* FILTER BAR & VERIFICATION NOTICE */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category & Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({result.tests.length})
          </button>
          <button
            onClick={() => setFilter('abnormal')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'abnormal' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            غير الطبيعي فقط ({result.highCount + result.lowCount})
          </button>
          <button
            onClick={() => setFilter('cbc')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'cbc' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            صورة الدم (CBC)
          </button>
          <button
            onClick={() => setFilter('sugar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'sugar' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            السكر
          </button>
          <button
            onClick={() => setFilter('lipids')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'lipids' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الدهون
          </button>
          <button
            onClick={() => setFilter('kidney')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filter === 'kidney' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكلى
          </button>
        </div>

        {/* Verification reminder (Section 5 requirement) */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>يمكنك الضغط على أي قيمة لتعديلها يدوياً إذا رغبت في تصحيح رقم مستخرج.</span>
        </div>
      </div>

      {/* EXTRACTED TESTS LIST & COMPARISON */}
      <div className="space-y-4">
        {filteredTests.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
              item.status === 'NORMAL'
                ? 'border-slate-200/80 hover:border-emerald-300'
                : item.status === 'HIGH'
                ? 'border-rose-200 bg-rose-50/10 hover:border-rose-400'
                : 'border-amber-200 bg-amber-50/10 hover:border-amber-400'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.code}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {item.refData ? item.refData.nameAr : item.testName}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.testName} • {item.refData ? item.refData.categoryAr : 'فحص معملي'}
                </p>
              </div>

              {/* Status Badge & Extracted Value */}
              <div className="flex items-center gap-3">
                {getStatusBadge(item.status)}

                <div className="text-left">
                  {editingTestId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="any"
                        value={editValueText}
                        onChange={e => setEditValueText(e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-emerald-500 rounded font-mono font-bold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                        title="حفظ القيمة"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(item)}
                      title="اضغط للتعديل اليدوي في حال الخطأ في القراءة"
                      className="group flex items-baseline gap-1 text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <span className="text-xl font-black font-mono tracking-tight">
                        {item.extractedValue}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        {item.extractedUnit}
                      </span>
                      <Edit2 className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400">
                    المرجع: {item.referenceRangeText || 'حسب المختبر'}
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Range Needle Bar */}
            {renderRangeBar(item)}

            {/* Simplified Explanation & Home Advice */}
            <div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs space-y-2.5">
              <p className="text-slate-700 leading-relaxed font-medium">
                {item.simplifiedExplanationAr}
              </p>

              {/* Causes of Elevation or Decrease */}
              {(item.causesOfElevation || item.causesOfDecrease) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {item.causesOfElevation && (
                    <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-rose-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                        أسباب الارتفاع المحتملة:
                      </span>
                      <p className="text-rose-800 leading-normal">{item.causesOfElevation}</p>
                    </div>
                  )}
                  {item.causesOfDecrease && (
                    <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-amber-900 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-amber-600" />
                        أسباب الانخفاض المحتملة:
                      </span>
                      <p className="text-amber-800 leading-normal">{item.causesOfDecrease}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lifestyle & Clinical Guidance */}
              {(item.lifestyleAdvice || (item.refData && item.refData.homeAdviceAr)) && (
                <div className="p-2.5 bg-emerald-50/50 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2 border border-emerald-100">
                  <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">توجيهات نمط الحياة والغذاء: </span>
                    <span className="text-emerald-900 leading-normal">{item.lifestyleAdvice || item.refData?.homeAdviceAr}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Notice Footer */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="space-y-0.5">
          <p className="font-bold">تنبيه طبي صارم:</p>
          <p className="text-[11px] leading-5 text-amber-800">
            تختلف المعدلات المرجعية الدقيقة من مختبر لآخر بحسب نوع الأجهزة والمحاليل المستخدمة. هذه القراءات للمساعدة والتثقيف، ويجب دائماً عرض التقرير الورقي الأصلي على الطبيب المعالج لتشخيص الحالة ووصف العلاج المناسب.
          </p>
        </div>
      </div>
    </div>
  );
};
