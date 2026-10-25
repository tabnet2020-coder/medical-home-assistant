import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Share2,
  Clock,
  Sparkles,
  Camera,
  Search,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  DrugInteractionResult,
  DuplicateIngredientAlert,
  DrugInteractionDetail,
  DailyScheduleSlot
} from '../types';
import { medicinesList } from '../data/medicalDatabase';
import { ImageCaptureAndEnhancer } from './ImageCaptureAndEnhancer';

interface Props {
  onSaveResult?: (result: DrugInteractionResult) => void;
}

export const DrugInteractionChecker: React.FC<Props> = ({ onSaveResult }) => {
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugInteractionResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showCameraUpload, setShowCameraUpload] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Quick preset test pairs
  const demoPairs = [
    {
      title: 'بانادول + كونجستال (تكرار الباراسيتامول)',
      meds: ['بانادول (Panadol Extra)', 'كونجستال (Congestal)'],
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      title: 'سياليس + نترات القلب (تعارض خطير)',
      meds: ['سياليس (Cialis 20mg)', 'نيتروديرم / نتروجلسرين'],
      color: 'bg-red-50 text-red-800 border-red-200'
    },
    {
      title: 'أوجمنتين + بروفين (تنسيق مواعيد الأكل)',
      meds: ['أوجمنتين (Augmentin 1g)', 'بروفين (Brufen 400mg)'],
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      title: 'أوميبريزول + جلوكوفاج (آمن مع تنظيم)',
      meds: ['لوسك (Losec Omeprazole)', 'جلوكوفاج (Glucophage 500mg)'],
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const suggestions = searchQuery.trim().length > 1
    ? medicinesList
        .filter(m =>
          m.tradeNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tradeNameEn.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleAddMedicine = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selectedMedicines.includes(trimmed)) return;
    setSelectedMedicines([...selectedMedicines, trimmed]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handleRunCheck = async (medList = selectedMedicines, imageBase64?: string) => {
    if (!imageBase64 && medList.length < 2) {
      setError('يرجى إضافة دواءين على الأقل للتحقق من التعارض بينهما.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/check-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicines: medList,
          imageBase64: imageBase64 || undefined
        })
      });

      if (!response.ok) {
        throw new Error('فشل فحص التعارض الدوائي من الخادم.');
      }

      const data: DrugInteractionResult = await response.json();
      setResult(data);
      if (data.medicinesChecked && data.medicinesChecked.length > 0) {
        setSelectedMedicines(data.medicinesChecked);
      }
    } catch (err: any) {
      console.error('Interaction check failed:', err);
      setError(err.message || 'حدث خطأ أثناء فحص تعارض الأدوية.');
    } finally {
      setIsLoading(false);
      setShowCameraUpload(false);
    }
  };

  const handleVoiceSpeak = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = result.elderlySummaryAr || result.summaryAr;
    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9; // Calm, clear tempo for elderly
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const lines = [
      `*تقرير فحص تعارض وسلامة الأدوية* 🏥`,
      `الأدوية المفحوصة: ${result.medicinesChecked.join(' + ')}`,
      `حالة الأمان: ${result.safetyStatus === 'DANGER' ? '⚠️ خطر تعارض دوائي' : result.safetyStatus === 'CAUTION' ? '⚡ يتطلب حذر وتنظيم مواعيد' : '✅ آمن للاستخدام معاً'}`,
      `\n*الملخص السريري:*`,
      result.summaryAr,
      result.duplicateIngredients.length > 0 ? `\n*تحذير المواد المكررة:* ${result.duplicateIngredients.map(d => d.warningAr).join(' - ')}` : '',
      `\n_تم الفحص عبر تطبيق المساعد الطبي المنزلي_`
    ].filter(Boolean);

    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(shareUrl, '_blank');
  };

  const handleSave = () => {
    if (!result || isSaved) return;
    if (onSaveResult) {
      onSaveResult(result);
    }
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <span>وحدة فحص تعارض الأدوية وسلامة الجرعات</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              افحص سلامة تناول عدة أدوية معاً؛ يكشف النظام تلقائياً عن التعارضات الدوائية الخطيرة وتكرار المادة الفعالة (خطر الجرعة الزائدة)، ويقترح جدولاً يومياً آمناً للمريض.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCameraUpload(!showCameraUpload)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{showCameraUpload ? 'إغلاق الكاميرا' : 'تصوير عدة علب معاً'}</span>
            </button>
            {result && (
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedMedicines([]);
                  setError(null);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                فحص جديد +
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera / Multi-box Image Upload Mode */}
      {showCameraUpload && (
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200">
          <p className="text-xs text-emerald-800 font-semibold mb-3">
            ضع علب الأدوية بجوار بعضها والتقط صورة واضحة تشمل أسماء العلب وسيتعرف عليها النظام معاً:
          </p>
          <ImageCaptureAndEnhancer
            mode="medicine"
            onImageReady={(base64) => handleRunCheck([], base64)}
            isAnalyzing={isLoading}
          />
        </div>
      )}

      {/* Medicine Selector Input Area */}
      {!result && !showCameraUpload && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
              أدخل أسماء الأدوية المراد فحصها معاً (دواءين على الأقل):
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMedicine(searchQuery);
                      }
                    }}
                    placeholder="اكتب اسم الدواء هنا (مثل: Panadol, Brufen, Cialis, Concor...) واضغط إضافة"
                    className="w-full px-4 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 sm:top-3.5" />
                </div>
                <button
                  onClick={() => handleAddMedicine(searchQuery)}
                  disabled={!searchQuery.trim()}
                  className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAddMedicine(`${s.tradeNameAr} (${s.tradeNameEn})`)}
                      className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs border-b border-slate-50 last:border-0"
                    >
                      <span className="font-bold text-slate-900">{s.tradeNameAr} • {s.tradeNameEn}</span>
                      <span className="text-[11px] text-slate-500">{s.strength}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Medicines Badges */}
          {selectedMedicines.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">الأدوية المحددة للفحص ({selectedMedicines.length}):</span>
              <div className="flex flex-wrap gap-2">
                {selectedMedicines.map((med, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200"
                  >
                    <span>{med}</span>
                    <button
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-emerald-700 hover:text-red-600 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>أضف دواءين على الأقل أو اختر من الأمثلة التجريبية السريعة بالأسفل.</span>
            </div>
          )}

          {/* Quick Demo Pairs */}
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-2">أمثلة شائعة جاهزة للاختبار الفوري:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoPairs.map((demo, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedMedicines(demo.meds);
                    handleRunCheck(demo.meds);
                  }}
                  className={`text-right p-2.5 rounded-xl border text-xs font-bold transition-all hover:shadow-xs flex items-center justify-between ${demo.color} cursor-pointer`}
                >
                  <span>{demo.title}</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Check Button */}
          <button
            onClick={() => handleRunCheck()}
            disabled={selectedMedicines.length < 2 || isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري فحص التداخلات والمواد الفعالة...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>فحص الأمان والتعارض الدوائي الآن</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* 1. Main Safety Status Banner */}
          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              result.safetyStatus === 'DANGER'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : result.safetyStatus === 'CAUTION'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                {result.safetyStatus === 'DANGER' && (
                  <span className="p-2 bg-rose-200 text-rose-900 rounded-xl">
                    <ShieldAlert className="w-6 h-6 text-rose-700" />
                  </span>
                )}
                {result.safetyStatus === 'CAUTION' && (
                  <span className="p-2 bg-amber-200 text-amber-900 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-amber-700" />
                  </span>
                )}
                {result.safetyStatus === 'SAFE' && (
                  <span className="p-2 bg-emerald-200 text-emerald-900 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  </span>
                )}
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {result.safetyStatus === 'DANGER'
                      ? 'تحذير حرج: تعارض دوائي مهدد أو تكرار مادة فعالة!'
                      : result.safetyStatus === 'CAUTION'
                      ? 'تنبيه: يتطلب فصلاً زمنياً وتنظيم أوقات الاستخدام'
                      : 'نتائج آمنة: لا توجد تعارضات دوائية سلبية مسجلة'}
                  </h3>
                  <span className="text-xs opacity-80">
                    الأدوية المفحوصة: {result.medicinesChecked.join(' • ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Audio, WhatsApp, Save */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-300 shadow-xs'
                  }`}
                  title="استماع صوتي للملخص"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                  <span>{isSpeaking ? 'إيقاف الصوت' : 'استمع للإرشادات'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="مشاركة التقرير عبر واتساب"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">واتساب</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-300'
                  }`}
                  title="حفظ في السجل"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed mt-2 pt-2 border-t border-black/10">
              {result.summaryAr}
            </p>
          </div>

          {/* 2. Duplicate Active Ingredient Alert (Critical Overdose Check) */}
          {result.duplicateIngredients.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-900 font-black text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>تنبيه خطير: تكرار نفس المادة الفعالة (خطر الجرعة المفرطة Overdose)</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                وجد النظام أنك تأخذ نفس المادة الكيميائية الفعالة في أكثر من مستحضر تجاري، وهذا قد يؤدي لتسمم كبدي أو كلوي حاد:
              </p>
              <div className="space-y-2">
                {result.duplicateIngredients.map((dup, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between text-xs font-bold text-red-950 mb-1">
                      <span>المادة المكررة: {dup.ingredient}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md">
                        موجودة في: {dup.medicines.join(' و ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed mt-1">{dup.warningAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Detailed Drug-Drug Interactions */}
          {result.interactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>تفاصيل التفاعلات الدوائية المتبادلة ({result.interactions.length}):</span>
              </h4>
              <div className="space-y-3">
                {result.interactions.map((inter, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-xs sm:text-sm ${
                      inter.severity === 'severe'
                        ? 'bg-rose-50/70 border-rose-200'
                        : inter.severity === 'moderate'
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-black">
                      <span className="text-slate-900">
                        {inter.medicineA} ⟷ {inter.medicineB}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          inter.severity === 'severe'
                            ? 'bg-rose-200 text-rose-900'
                            : inter.severity === 'moderate'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {inter.severity === 'severe'
                          ? 'تعارض شديد'
                          : inter.severity === 'moderate'
                          ? 'تعارض متوسط'
                          : 'تعارض طفيف'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-2">
                      <strong className="text-slate-900">التأثير المتوقع:</strong> {inter.effectAr}
                    </p>
                    <div className="p-2.5 bg-white/90 rounded-lg border border-slate-200 text-emerald-900 font-medium">
                      <strong className="text-emerald-950">نصيحة الصيدلي:</strong> {inter.recommendationAr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Proposed Daily Timing Schedule */}
          {result.dailySchedule && result.dailySchedule.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>الجدول الزمني اليومي المقترح لتنظيم تناول الأدوية بأمان:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.dailySchedule.map((slot, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-emerald-800 block pb-1 border-b border-slate-200">
                      {slot.timeLabelAr}
                    </span>
                    {slot.medicines && slot.medicines.length > 0 ? (
                      <div className="space-y-1.5">
                        {slot.medicines.map((m, mIdx) => (
                          <div key={mIdx} className="bg-white p-2 rounded-lg border border-slate-200/80 text-xs">
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                            <span className="text-[11px] text-slate-600">{m.instructionAr}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic block py-2">لا توجد أدوية في هذه الفترة</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Elderly-Friendly Audio Summary Box */}
          {result.elderlySummaryAr && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-teal-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>إرشادات ميسرة لكبار السن (مناسبة للاستماع الصوتي):</span>
                </h4>
                <button
                  onClick={handleVoiceSpeak}
                  className="px-2.5 py-1 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  {isSpeaking ? 'إيقاف' : 'تشغيل الصوت'}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-teal-950 font-medium leading-relaxed">
                {result.elderlySummaryAr}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
