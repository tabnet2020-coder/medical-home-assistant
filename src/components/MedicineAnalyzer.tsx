import React, { useState, useEffect } from 'react';
import {
  Pill,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Building,
  Layers,
  ArrowRightLeft,
  Search,
  Bookmark,
  Share2,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Volume2,
  VolumeX,
  Calendar,
  HeartPulse,
  MessageCircle
} from 'lucide-react';
import { MedicineAnalysisResult, Medicine } from '../types';
import { medicinesList, activeIngredientsList } from '../data/medicalDatabase';
import { MedicinePackagingVisual } from './MedicinePackagingVisual';

interface Props {
  result: MedicineAnalysisResult;
  onSelectAlternative: (med: Medicine) => void;
  onSaveResult: (result: MedicineAnalysisResult) => void;
  isSaved?: boolean;
  onOpenMedicineDetail?: (med: Medicine) => void;
}

export const MedicineAnalyzer: React.FC<Props> = ({
  result,
  onSelectAlternative,
  onSaveResult,
  isSaved = false,
  onOpenMedicineDetail,
}) => {
  // Manual 3-letter fallback search state (Enforcing Document Section 5 Requirement)
  const [manualQuery, setManualQuery] = useState('');
  const [showManualCorrection, setShowManualCorrection] = useState(
    result.confidenceScore < 80 || result.requiresConfirmation
  );

  // Audio speech synthesis state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Cleanup speech when unmounting or changing result
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

    const textToRead = [
      `دواء ${result.detectedTradeName}.`,
      result.elderlyFriendlySummary ? `معلومات هامة: ${result.elderlyFriendlySummary}` : '',
      result.howToTake ? `طريقة الاستخدام: ${result.howToTake}` : '',
      result.handwrittenNotes ? `ملاحظات الصيدلي المكتوبة بخط اليد على العلبة: ${result.handwrittenNotes}` : '',
      result.safetyWarnings && result.safetyWarnings.length > 0 ? `تنبيه: ${result.safetyWarnings[0]}` : '',
    ].filter(Boolean).join('. ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9; // Calm and clear for elderly listeners

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShareWhatsApp = () => {
    const altsText = result.commercialAlternatives.length > 0
      ? `\n🔄 *البدائل المتطابقة (متوفرة بالصيدليات):*\n${result.commercialAlternatives.slice(0, 3).map(a => `• ${a.tradeNameAr} (${a.manufacturer})`).join('\n')}`
      : '';

    const text = `💊 *معلومات دواء من المساعد الطبي المنزلي*
*اسم الدواء:* ${result.detectedTradeName} (${result.detectedStrength || ''})
*المادة الفعالة:* ${result.detectedActiveIngredient}
*الشركة المصنعة:* ${result.detectedManufacturer || 'غير محدد'}
${result.elderlyFriendlySummary ? `\n📌 *ملخص مبسط:* ${result.elderlyFriendlySummary}` : ''}
${result.howToTake ? `\n⏰ *طريقة وتوقيت الاستخدام:* ${result.howToTake}` : ''}
${result.handwrittenNotes ? `\n✍️ *إرشادات الصيدلي المكتوبة بخط اليد على العلبة:* ${result.handwrittenNotes}` : ''}
${result.expiryDate && result.expiryDate !== 'غير محدد على الجزء الظاهر من العلبة' ? `\n📅 *تاريخ الصلاحية:* ${result.expiryDate}` : ''}
${altsText}

— تم التحقق عبر تطبيق المساعد الطبي المنزلي`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filter medicines based on 3-letter input or more
  const matchingSuggestions = manualQuery.trim().length >= 2
    ? medicinesList.filter(
        m =>
          m.tradeNameAr.toLowerCase().includes(manualQuery.toLowerCase()) ||
          m.tradeNameEn.toLowerCase().includes(manualQuery.toLowerCase()) ||
          m.manufacturer.toLowerCase().includes(manualQuery.toLowerCase())
      )
    : [];

  const confidenceColor =
    result.confidenceScore >= 85
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : result.confidenceScore >= 75
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-red-700 bg-red-50 border-red-200';

  const isLowConfidence = result.confidenceScore < 80;

  return (
    <div className="space-y-6">
      {/* LOW CONFIDENCE ALERT & 3-LETTER MANUAL SEARCH FALLBACK (CRITICAL SAFETY SECTION 5) */}
      {isLowConfidence && (
        <div className="p-4 sm:p-5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-sm text-amber-950">
                تنبيه أمان: دقة القراءة البصرية أقل من 80% ({result.confidenceScore}%)
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-5">
                وفقاً لبروتوكول السلامة الطبية وإدارة المخاطر، لتجنب تخمين اسم دواء خاطئ نظراً لعدم وضوح الإضاءة أو الخط، يرجى إعادة التصوير أو تأكيد اسم الدواء بإدخال أول 3 أحرف أدناه.
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>البحث السريع والتأكيد بالأحرف الأولى (مثال: بان، أوجم، برو، سيت):</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={manualQuery}
                onChange={e => setManualQuery(e.target.value)}
                placeholder="اكتب 3 أحرف على الأقل..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              {manualQuery && (
                <button
                  onClick={() => setManualQuery('')}
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  مسح
                </button>
              )}
            </div>

            {matchingSuggestions.length > 0 && (
              <div className="mt-2 divide-y divide-slate-100 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                {matchingSuggestions.map(med => (
                  <div
                    key={med.id}
                    onClick={() => {
                      onSelectAlternative(med);
                      setManualQuery('');
                    }}
                    className="p-2.5 hover:bg-emerald-50 text-right cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{med.tradeNameAr} ({med.tradeNameEn})</p>
                      <p className="text-[11px] text-slate-500">{med.strength} • {med.manufacturer}</p>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded">
                      اختيار هذا الدواء
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Medicine Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header of Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Pill className="w-8 h-8 text-white rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {result.detectedDosageForm || 'مستحضر صيدلاني'}
                </span>
                <span className="text-xs text-emerald-100">
                  {result.detectedStrength || ''}
                </span>
              </div>
              <h2
                onClick={() => {
                  if (result.matchedMedicine && onOpenMedicineDetail) {
                    onOpenMedicineDetail(result.matchedMedicine);
                  }
                }}
                className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-1 transition-colors ${
                  result.matchedMedicine ? 'cursor-pointer hover:text-emerald-100 hover:underline' : ''
                }`}
                title={result.matchedMedicine ? 'اضغط لفتح الصفحة الكاملة لتفاصيل هذا الدواء' : undefined}
              >
                {result.detectedTradeName}
              </h2>
            </div>
          </div>

          {/* Confidence Badge & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Speech Synthesis Button */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                isPlayingAudio
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-white text-emerald-900 hover:bg-emerald-50'
              }`}
              title={isPlayingAudio ? 'إيقاف القراءة الصوتية' : 'استمع للشرح الصوتي الهادئ للدواء'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>إيقاف الصوت</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>🔊 استمع للشرح الصوتي</span>
                </>
              )}
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="مشاركة معلومات الدواء والبدائل عبر واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>مشاركة عبر واتساب</span>
            </button>

            {result.matchedMedicine && onOpenMedicineDetail && (
              <button
                onClick={() => onOpenMedicineDetail(result.matchedMedicine!)}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="عرض صفحة الدواء الكاملة ومجسم العبوة"
              >
                <span>صفحة الدواء الكاملة</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            )}

            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold backdrop-blur-xs flex items-center gap-1.5 ${
                result.confidenceScore >= 80 ? 'bg-white/20 text-white border-white/30' : 'bg-amber-400 text-amber-950 border-amber-500'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>يقين القراءة: {result.confidenceScore}%</span>
            </div>

            <button
              onClick={() => onSaveResult(result)}
              title={isSaved ? 'تم الحفظ في السجل' : 'حفظ في السجل'}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isSaved ? 'bg-white text-emerald-800' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ELDERLY-FRIENDLY PROMINENT CARD (بطاقة مخصصة لكبار السن والعائلة) */}
        {(result.elderlyFriendlySummary || result.howToTake || result.expiryDate || result.handwrittenNotes) && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 via-emerald-50/50 to-teal-50/60 border-b border-amber-200/60 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  🧓
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    دليل كبار السن والعائلة (معلومات مبسطة ومطمئنة)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    شرح واضح للغرض من الدواء وتوقيت تناوله وتاريخ الصلاحية
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleAudio}
                className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>قراءة صوتية</span>
              </button>
            </div>

            {/* Handwritten pharmacist notes alert (إرشادات الصيدلي المكتوبة بخط اليد على العلبة) */}
            {result.handwrittenNotes && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border-2 border-amber-400 text-amber-950 shadow-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-amber-950">
                  <span className="text-lg">✍️</span>
                  <span>إرشادات الصيدلي المكتوبة بخط اليد على علبتك:</span>
                </div>
                <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-amber-300 shadow-2xs">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                    «{result.handwrittenNotes}»
                  </p>
                </div>
                <p className="text-[11px] text-amber-900 font-medium">
                  * تم رصد هذه التعليمات المكتوبة بالقلم على علبة الدواء بالذكاء الاصطناعي لضمان التزامك بالجرعة المحددة بدقة من الصيدلي أو الطبيب.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Summary for elderly */}
              {result.elderlyFriendlySummary && (
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-amber-600" />
                    ما هو هذا الدواء ولماذا يستخدم؟
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">
                    {result.elderlyFriendlySummary}
                  </p>
                </div>
              )}

              {/* How to take */}
              {result.howToTake && (
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-1">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    طريقة وتوقيت الاستخدام:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed pt-0.5">
                    {result.howToTake}
                  </p>
                </div>
              )}
            </div>

            {/* Expiry date card */}
            {result.expiryDate && (
              <div className="p-2.5 px-3.5 rounded-xl bg-white/90 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>تاريخ انتهاء الصلاحية المطبوع على العلبة:</span>
                </span>
                <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {result.expiryDate}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Essential Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          {/* Active Ingredient */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              المادة الفعالة (Active Substance):
            </span>
            <p className="text-sm font-bold text-emerald-900">
              {result.detectedActiveIngredient || 'غير محددة بدقة'}
            </p>
            {result.activeIngredientData && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                {result.activeIngredientData.drugClass}
              </p>
            )}
          </div>

          {/* Manufacturer */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              الشركة المصنعة (Manufacturer):
            </span>
            <p className="text-sm font-bold text-slate-800">
              {result.detectedManufacturer || 'غير متوفر'}
            </p>
          </div>

          {/* Prescription Status */}
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              الحالة القانونية للصرف:
            </span>
            <p className="text-sm font-bold text-slate-800">
              {result.matchedMedicine?.prescriptionRequired
                ? 'يتطلب وصفة طبية (Rx)'
                : 'دواء بدون وصفة (OTC)'}
            </p>
          </div>
        </div>

        {/* Detailed Medical Information Panels */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Mechanism of Action */}
          {result.mechanismOfAction && (
            <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl text-xs space-y-1.5">
              <h4 className="font-bold text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>آلية العمل الدوائية والسريرية (Mechanism of Action):</span>
              </h4>
              <p className="text-teal-900 leading-relaxed font-medium">
                {result.mechanismOfAction}
              </p>
            </div>
          )}

          {/* Indications (دواعي الاستعمال) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>دواعي الاستعمال السريرية (Indications):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.indicationsSummary.map((ind, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-2"
                >
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drug & Food Interactions */}
          {result.drugInteractions && result.drugInteractions.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>التداخلات الدوائية والغذائية الهامة (Drug Interactions):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.drugInteractions.map((inter, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2"
                  >
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{inter}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side Effects (الآثار الجانبية) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>الآثار الجانبية المحتملة (Side Effects):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.sideEffectsSummary.map((se, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700 flex items-start gap-2"
                >
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{se}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Populations & Storage advice */}
          {(result.specialPopulations || result.storageAdvice) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {result.specialPopulations && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">الحمل، الرضاعة، والفئات الخاصة:</span>
                  <p className="text-slate-600 leading-relaxed">{result.specialPopulations}</p>
                </div>
              )}
              {result.storageAdvice && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800">ظروف الحفظ والتخزين:</span>
                  <p className="text-slate-600 leading-relaxed">{result.storageAdvice}</p>
                </div>
              )}
            </div>
          )}

          {/* Warnings & Safety Tips (تحذيرات وموانع الاستعمال) */}
          <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-red-900 flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>تحذيرات هامة وموانع الاستعمال:</span>
            </h4>
            <ul className="space-y-1.5 text-red-800 pr-5 list-disc">
              {result.safetyWarnings.map((warn, idx) => (
                <li key={idx} className="leading-relaxed">
                  {warn}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* COMMERCIAL ALTERNATIVES CARD (Document Section 1 & Section 3 Key Requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
              <span>البدائل التجارية المتاحة بنفس المادة الفعالة</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              أدوية تحتوي على نفس المادة الفعالة ({result.detectedActiveIngredient}) وتؤدي نفس الوظيفة العلاجية، وتصلح كبديل في حال عدم توفر الدواء بالصيدليات.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            {result.commercialAlternatives.length} بدائل مطابقة
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {result.commercialAlternatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.commercialAlternatives.map(alt => (
                <div
                  key={alt.id}
                  onClick={() => onOpenMedicineDetail ? onOpenMedicineDetail(alt) : onSelectAlternative(alt)}
                  className="border border-slate-200 hover:border-emerald-500 hover:shadow-lg rounded-2xl p-4 bg-white transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Visual Packaging thumbnail */}
                    <div className="overflow-hidden rounded-xl">
                      <MedicinePackagingVisual medicine={alt} size="sm" className="w-full" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          بديل مكافئ 100%
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono font-bold">
                          {alt.strength}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {alt.tradeNameAr}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {alt.tradeNameEn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{alt.manufacturer}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>الشكل: {alt.dosageForm}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg">
                      {alt.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenMedicineDetail) {
                          onOpenMedicineDetail(alt);
                        } else {
                          onSelectAlternative(alt);
                        }
                      }}
                      className="w-full text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    >
                      عرض صفحة وتفاصيل هذا البديل ←
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>لم يتم العثور على بدائل مباشرة مسجلة في قاعدة البيانات المحلية لهذه المادة الفعالة حتى الآن.</p>
              <p className="mt-1 text-slate-400">يرجى استشارة الصيدلي لمعرفة البدائل التجارية المتوفرة محلياً.</p>
            </div>
          )}

          <div className="mt-6 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2 border border-slate-200/60">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>تنبيه صيدلاني:</strong> على الرغم من تطابق المادة الفعالة، يجب دائماً مراجعة الصيدلي للتأكد من تطابق التركيز وشكل الجرعة وملاءمتها لحالتك الصحية.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
