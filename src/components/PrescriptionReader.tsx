import React, { useState } from 'react';
import {
  FileText,
  AlertCircle,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  HelpCircle,
  Pill,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  PrescriptionAnalysisResult,
  PrescribedMedicineItem
} from '../types';
import { ImageCaptureAndEnhancer } from './ImageCaptureAndEnhancer';

interface Props {
  onSaveResult?: (result: PrescriptionAnalysisResult) => void;
}

export const PrescriptionReader: React.FC<Props> = ({ onSaveResult }) => {
  const [result, setResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Demo Prescriptions for instant demonstration
  const samplePrescriptions = [
    {
      id: 'demo-rx-1',
      title: 'روشتة باطنة والتهاب رئوي',
      doctor: 'د. طارق المنصوري - استشاري الأمراض الباطنية والجهاز الهضمي',
      hospital: 'عيادات النور التخصصية',
      data: {
        doctorName: 'د. طارق المنصوري (استشاري باطنة)',
        clinicOrHospital: 'عيادات النور التخصصية',
        prescriptionDate: '2025-05-12',
        diagnosisNotes: 'التهاب حاد في القصبات الهوائية مع حمى وإرهاق عام',
        medicines: [
          {
            id: 'rx-1',
            nameEn: 'Augmentin 1g tab',
            nameAr: 'أوجمنتين 1 جم أقراص',
            activeIngredient: 'Amoxicillin + Clavulanic Acid',
            dosageForm: 'أقراص مغلفة',
            strength: '1000 mg',
            dosageInstructionAr: 'قرص واحد كل 12 ساعة (صباحاً ومساءً) بعد الأكل مباشرة',
            frequencyAr: 'مرتين يومياً',
            timingAr: 'بعد الأكل مباشرة',
            purposeAr: 'مضاد حيوي واسع المجال للقضاء على البكتيريا المسببة لالتهاب الشعب الهوائية',
            duration: 'لمدة 7 أيام متواصلة حتى انتهاء العبوة بالكامل',
            pharmacistWarning: 'لا توقف المضاد الحيوي بمجرد زوال الحرارة، بل أكمل الأيام السبعة لتجنب مقاومة البكتيريا.'
          },
          {
            id: 'rx-2',
            nameEn: 'Panadol Extra tab',
            nameAr: 'بانادول إكسترا أقراص',
            activeIngredient: 'Paracetamol + Caffeine',
            dosageForm: 'أقراص',
            strength: '500 mg',
            dosageInstructionAr: 'قرصان عند اللزوم في حال الصداع أو ارتفاع درجة الحرارة',
            frequencyAr: 'عند اللزوم (بحد أقصى 3 مرات يومياً)',
            timingAr: 'بعد الأكل مع كوب ماء',
            purposeAr: 'تسكين الآلام وخفض حرارة الجسم',
            duration: 'عند اللزوم فقط',
            pharmacistWarning: 'لا تتناول أي دواء آخر يحتوي على الباراسيتامول في نفس الوقت تجنباً لجرعة زائدة.'
          },
          {
            id: 'rx-3',
            nameEn: 'Ventolin Inhaler',
            nameAr: 'فنتولين بخاخ',
            activeIngredient: 'Salbutamol',
            dosageForm: 'بخاخ استنشاقي',
            strength: '100 mcg',
            dosageInstructionAr: 'بختان في الفم عند الشعور بضيق في التنفس مع حبس النفس 10 ثوانٍ',
            frequencyAr: 'عند نوبات ضيق الصدر',
            timingAr: 'حسب الحاجة',
            purposeAr: 'موسع للشعب الهوائية وتسهيل عملية التنفس',
            duration: 'حسب إرشاد الطبيب',
            pharmacistWarning: 'مضمض الفم بالماء بعد كل استخدام لتجنب جفاف الحلق.'
          }
        ],
        overallAdviceAr: 'الإكثار من شرب السوائل الدافئة والراحة التامة لمدة 3 أيام وتجنب التعرض لتيارات الهواء الباردة.',
        elderlySummaryAr: 'يا والدي الطيب، الروشتة فيها ثلاثة أدوية: المضاد الحيوي حبة الصبح وحبة الليل بعد الأكل لمدة أسبوع كامل، والبنادول حبتين فقط لو شعرت بحرارة أو صداع، والبخاخ تاخذ منه بختين لو حسيت بضيق نفس، وألف لا بأس عليك.',
        pharmacistConfirmationAlert: 'تنبيه أمان: هذه القراءة ذكية ومساعدة استرشادية؛ يُرجى دائماً تسليم الروشتة للصيدلي للتأكد من صرف الدواء والتركيز الصحيح.',
        confidenceScore: 94,
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 'demo-rx-2',
      title: 'روشتة ضغط وسكر',
      doctor: 'د. سامية الكيلاني - استشارية الغدد الصماء والسكري',
      hospital: 'المركز التخصصي للسكري',
      data: {
        doctorName: 'د. سامية الكيلاني',
        clinicOrHospital: 'المركز التخصصي للسكري وضغط الدم',
        prescriptionDate: '2025-06-01',
        diagnosisNotes: 'متابعة دورية لارتفاع السكر التراكمي وضغط الدم الشرياني',
        medicines: [
          {
            id: 'rx-4',
            nameEn: 'Glucophage 1000mg XR',
            nameAr: 'جلوكوفاج 1000 مجم ممتد المفعول',
            activeIngredient: 'Metformin Hydrochloride',
            dosageForm: 'أقراص ممتدة المفعول',
            strength: '1000 mg',
            dosageInstructionAr: 'قرص واحد يومياً في منتصف وجبة العشاء أو بعدها مباشرة دون كسر القرص',
            frequencyAr: 'مرة واحدة يومياً',
            timingAr: 'مع وجبة العشاء',
            purposeAr: 'تنظيم مستوى سكر الدم وتحسين استجابة الجسم للإنسولين',
            duration: 'علاج مستمر',
            pharmacistWarning: 'ابتلع القرص كاملاً ولا تمضغه أو تكسره حتى لا يفقد خاصية الامتداد الزمني.'
          },
          {
            id: 'rx-5',
            nameEn: 'Concor 5mg',
            nameAr: 'كونكور 5 مجم',
            activeIngredient: 'Bisoprolol Fumarate',
            dosageForm: 'أقراص',
            strength: '5 mg',
            dosageInstructionAr: 'قرص واحد صباحاً كل يوم في نفس الموعد قبل أو بعد الإفطار',
            frequencyAr: 'مرة واحدة يومياً صباحاً',
            timingAr: 'في الصباح',
            purposeAr: 'ضبط ضغط الدم وتنظيم نبضات القلب',
            duration: 'علاج دائم',
            pharmacistWarning: 'لا توقف هذا الدواء فجأة دون الرجوع لطبيبك لتفادي ارتفاع مفاجئ في الضغط.'
          }
        ],
        overallAdviceAr: 'قياس السكر والضغط أسبوعياً وتسجيل القراءات في دفتر المتابعة، والتقليل من الملح والسكريات المكررة.',
        elderlySummaryAr: 'يا أمي الكريمة، كونكور يؤخذ حبة واحدة الصباح لضبط الضغط، وجلوكوفاج حبة واحدة وسط وجبة العشاء لضبط السكر بدون كسر الحبة، والحمد لله كلاهما منظمان ومنتظمان.',
        pharmacistConfirmationAlert: 'تنبيه أمان: تأكد دائماً مع الصيدلي عند صرف الروشتة لمطابقة التركيز (5 مجم وليس 10 مجم).',
        confidenceScore: 96,
        timestamp: new Date().toISOString()
      }
    }
  ];

  const handleAnalyzePrescription = async (base64Image: string) => {
    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg'
        })
      });

      if (!response.ok) {
        throw new Error('فشلت قراءة صورة الروشتة من الخادم.');
      }

      const data: PrescriptionAnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error analyzing prescription:', err);
      setError(err.message || 'حدث خطأ أثناء قراءة الروشتة الطبية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSpeak = () => {
    if (!result) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = result.elderlySummaryAr || result.overallAdviceAr;
    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const lines = [
      `*تقرير قراءة وتفسير روشتة الطبيب* 📝`,
      result.doctorName ? `الطبيب: ${result.doctorName}` : '',
      result.clinicOrHospital ? `العيادة: ${result.clinicOrHospital}` : '',
      `\n*الأدوية الموصوفة والجرعات:*`,
      ...result.medicines.map((m, idx) => `${idx + 1}. *${m.nameAr || m.nameEn}*:\n   - الجرعة: ${m.dosageInstructionAr}\n   - الغرض: ${m.purposeAr}`),
      `\n*نصيحة عامة:* ${result.overallAdviceAr}`,
      `\n⚠️ *تنبيه أمان:* ${result.pharmacistConfirmationAlert}`,
      `\n_تمت القراءة عبر تطبيق المساعد الطبي المنزلي_`
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
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>وحدة قراءة وتفسير روشتة الطبيب (Rx Reader)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              التقط صورة لروشتة الطبيب الورقية أو الوصفة الطبية؛ يتعرف الذكاء الاصطناعي البصري على خط الطبيب والأدوية الموصوفة، ويشرح الجرعات ومواعيد الاستخدام بالعربية المبسطة.
            </p>
          </div>

          {result && (
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              قراءة روشتة أخرى +
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Capture Area / Presets */}
      {!result ? (
        <div className="space-y-5">
          <ImageCaptureAndEnhancer
            mode="prescription"
            onImageReady={handleAnalyzePrescription}
            isAnalyzing={isLoading}
          />

          {/* Quick Demo Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-extrabold text-slate-700 block mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>أو جرّب إحدى الروشتات النموذجية الجاهزة للاختبار الفوري:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samplePrescriptions.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => setResult(sample.data as PrescriptionAnalysisResult)}
                  className="text-right p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-indigo-950 block">
                      {sample.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {sample.doctor} • {sample.hospital}
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* 1. Header Summary Card with Doctor Info & Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    تم استخراج {result.medicines.length} أدوية بنجاح
                  </span>
                  {result.prescriptionDate && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {result.prescriptionDate}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  <span>{result.doctorName || 'طبيب استشاري مرخص'}</span>
                </h3>
                {result.clinicOrHospital && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{result.clinicOrHospital}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                  title="استماع صوتي للإرشادات"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
                  <span>{isSpeaking ? 'إيقاف الصوت' : 'استمع للإرشادات'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="مشاركة على واتساب"
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
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                  title="حفظ في السجل"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'تم الحفظ' : 'حفظ'}</span>
                </button>
              </div>
            </div>

            {/* Diagnosis notes if found */}
            {result.diagnosisNotes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <strong className="text-slate-900 ml-1">التشخيص أو الملاحظات الطبية:</strong>
                <span>{result.diagnosisNotes}</span>
              </div>
            )}
          </div>

          {/* 2. Mandatory Pharmacist Confirmation Alert Banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="font-black block mb-0.5">تنبيه سلامة إجباري:</strong>
              {result.pharmacistConfirmationAlert ||
                'هذه القراءة الذكية هي أداة مساعدة لتسهيل فهم الخط؛ يجب دائماً عرض أصل الروشتة الورقية على الصيدلي للتأكد التام من الجرعات ومطابقة المستحضر.'}
            </div>
          </div>

          {/* 3. Medicines Cards List */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span>الأدوية الموصوفة والجرعات المفسّرة ({result.medicines.length}):</span>
            </h4>

            <div className="space-y-3">
              {result.medicines.map((med, index) => (
                <div
                  key={med.id || index}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3 hover:border-indigo-300 transition-colors"
                >
                  {/* Medicine Title & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h5 className="text-base font-black text-slate-900 tracking-tight">
                          {med.nameAr || med.nameEn}
                        </h5>
                        {med.strength && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold font-mono">
                            {med.strength}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block mr-8">
                        {med.nameEn} {med.activeIngredient ? `• المادة: ${med.activeIngredient}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {med.dosageForm && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                          {med.dosageForm}
                        </span>
                      )}
                      {med.timingAr && (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold">
                          {med.timingAr}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plain Arabic Dosage Instruction */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950">
                    <div className="flex items-center gap-1.5 font-black mb-1">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>طريقة الاستخدام والجرعة:</span>
                    </div>
                    <p className="font-semibold leading-relaxed mr-5">{med.dosageInstructionAr}</p>
                  </div>

                  {/* Purpose & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {med.purposeAr && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-800 block">دواعي الاستعمال:</span>
                        <span className="text-slate-600 mt-0.5 block">{med.purposeAr}</span>
                      </div>
                    )}
                    {med.duration && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-800 block">مدة العلاج:</span>
                        <span className="text-slate-600 mt-0.5 block">{med.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Pharmacist Warning if present */}
                  {med.pharmacistWarning && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>تنبيه الصيدلي:</strong> {med.pharmacistWarning}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Overall Advice Banner */}
          {result.overallAdviceAr && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong className="font-black text-slate-900 block mb-1">نصائح الطبيب العامة:</strong>
              {result.overallAdviceAr}
            </div>
          )}

          {/* 5. Elderly Voice Summary Box */}
          {result.elderlySummaryAr && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-teal-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>الملخص الميسّر لكبار السن (جاهز للاستماع):</span>
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
