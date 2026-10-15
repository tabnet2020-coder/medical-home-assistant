/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Header,
  ActiveTab
} from './components/Header';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ImageCaptureAndEnhancer } from './components/ImageCaptureAndEnhancer';
import { MedicineAnalyzer } from './components/MedicineAnalyzer';
import { LabAnalyzer } from './components/LabAnalyzer';
import { MedicineDirectory } from './components/MedicineDirectory';
import { LabReferenceGuide } from './components/LabReferenceGuide';
import { ScanHistoryModal } from './components/ScanHistoryModal';
import { HealthTipBanner } from './components/HealthTipBanner';
import { MedicineDetailPage } from './components/MedicineDetailPage';
import { ChangelogModal } from './components/ChangelogModal';
import { APP_CURRENT_VERSION } from './data/changelog';
import {
  sampleMedicineDemos,
  sampleLabDemos,
  medicinesList,
  activeIngredientsList
} from './data/medicalDatabase';
import {
  MedicineAnalysisResult,
  LabAnalysisResult,
  SavedHistoryItem,
  Medicine
} from './types';
import {
  Pill,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  GitCommit
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('medicine');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState<Medicine | null>(null);
  const [savedHistory, setSavedHistory] = useState<SavedHistoryItem[]>([]);

  // Medicine flow states
  const [isAnalyzingMedicine, setIsAnalyzingMedicine] = useState(false);
  const [medicineResult, setMedicineResult] = useState<MedicineAnalysisResult | null>(null);
  const [medicineError, setMedicineError] = useState<string | null>(null);

  // Lab flow states
  const [isAnalyzingLab, setIsAnalyzingLab] = useState(false);
  const [labResult, setLabResult] = useState<LabAnalysisResult | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  // Initialize disclaimer acceptance & history from localStorage safely
  useEffect(() => {
    try {
      const accepted = localStorage.getItem('medical_disclaimer_accepted');
      if (!accepted) {
        setIsDisclaimerOpen(true);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for disclaimer check:', e);
      setIsDisclaimerOpen(true);
    }

    try {
      const storedHistory = localStorage.getItem('medical_scan_history');
      if (storedHistory) {
        setSavedHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Failed to parse saved history:', e);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    try {
      localStorage.setItem('medical_disclaimer_accepted', 'true');
    } catch (e) {
      console.warn('Failed to save disclaimer acceptance to localStorage:', e);
    }
    setIsDisclaimerOpen(false);
  };

  // Save scan result to history safely
  const handleSaveMedicineResult = (res: MedicineAnalysisResult) => {
    const newItem: SavedHistoryItem = {
      id: `med-${Date.now()}`,
      type: 'medicine',
      title: res.detectedTradeName,
      timestamp: new Date().toISOString(),
      summary: `المادة: ${res.detectedActiveIngredient} • ${res.commercialAlternatives.length} بدائل مطابقة`,
      data: res
    };
    const updated = [newItem, ...savedHistory];
    setSavedHistory(updated);
    try {
      localStorage.setItem('medical_scan_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist scan history:', e);
    }
  };

  const handleSaveLabResult = (res: LabAnalysisResult) => {
    const newItem: SavedHistoryItem = {
      id: `lab-${Date.now()}`,
      type: 'lab',
      title: `تقرير تحاليل (${res.tests.length} فحص)`,
      timestamp: new Date().toISOString(),
      summary: `${res.normalCount} سليم، ${res.highCount} مرتفع، ${res.lowCount} منخفض`,
      data: res
    };
    const updated = [newItem, ...savedHistory];
    setSavedHistory(updated);
    try {
      localStorage.setItem('medical_scan_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist scan history:', e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = savedHistory.filter(i => i.id !== id);
    setSavedHistory(updated);
    try {
      localStorage.setItem('medical_scan_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update scan history:', e);
    }
  };

  const handleClearHistory = () => {
    setSavedHistory([]);
    try {
      localStorage.removeItem('medical_scan_history');
    } catch (e) {
      console.warn('Failed to clear scan history:', e);
    }
  };

  // Trigger analysis for Medicine
  const handleAnalyzeMedicine = async (base64Image: string, enhancementDetails: string) => {
    setIsAnalyzingMedicine(true);
    setMedicineError(null);
    try {
      const response = await fetch('/api/analyze-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
          enhancementDetails
        })
      });

      if (!response.ok) {
        throw new Error('فشلت قراءة صورة الدواء من الخادم.');
      }

      const data: MedicineAnalysisResult = await response.json();
      setMedicineResult(data);
    } catch (err: any) {
      console.error('Error analyzing medicine:', err);
      setMedicineError(err.message || 'حدث خطأ أثناء فحص صورة الدواء.');
    } finally {
      setIsAnalyzingMedicine(false);
    }
  };

  // Select Sample Medicine
  const handleSelectMedicineSample = async (sampleId: string) => {
    const sample = sampleMedicineDemos.find(s => s.id === sampleId);
    if (!sample) return;

    setIsAnalyzingMedicine(true);
    setMedicineError(null);
    try {
      const response = await fetch('/api/analyze-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualQuery: sample.mockData.tradeName
        })
      });
      const data: MedicineAnalysisResult = await response.json();
      setMedicineResult(data);
    } catch (err: any) {
      setMedicineError('تعذر فحص العينة التجريبية.');
    } finally {
      setIsAnalyzingMedicine(false);
    }
  };

  // Trigger analysis for Lab
  const handleAnalyzeLab = async (base64Image: string, enhancementDetails: string) => {
    setIsAnalyzingLab(true);
    setLabError(null);
    try {
      const response = await fetch('/api/analyze-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
          enhancementDetails
        })
      });

      if (!response.ok) {
        throw new Error('فشلت قراءة ورقة التحاليل من الخادم.');
      }

      const data: LabAnalysisResult = await response.json();
      setLabResult(data);
    } catch (err: any) {
      console.error('Error analyzing lab sheet:', err);
      setLabError(err.message || 'حدث خطأ أثناء قراءة ورقة التحاليل.');
    } finally {
      setIsAnalyzingLab(false);
    }
  };

  // Select Sample Lab
  const handleSelectLabSample = async (sampleId: string) => {
    const sample = sampleLabDemos.find(s => s.id === sampleId);
    if (!sample) return;

    setIsAnalyzingLab(true);
    setLabError(null);
    try {
      const response = await fetch('/api/analyze-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preselectedTests: sample.tests.map(t => ({
            testName: t.code,
            code: t.code,
            value: t.value,
            unit: t.unit,
            confidence: 96
          }))
        })
      });
      const data: LabAnalysisResult = await response.json();
      setLabResult(data);
    } catch (err: any) {
      setLabError('تعذر قراءة العينة المخبرية التجريبية.');
    } finally {
      setIsAnalyzingLab(false);
    }
  };

  // Manual inline update of lab value if user corrects a digit (e.g. 7 vs 1)
  const handleUpdateLabItemValue = (testId: string, newValue: number) => {
    if (!labResult) return;
    const updatedTests = labResult.tests.map(t => {
      if (t.id === testId) {
        let status = t.status;
        let explanation = t.simplifiedExplanationAr;
        if (t.refData) {
          if (newValue < t.refData.minValue) {
            status = 'LOW';
            explanation = `القيمة (${newValue} ${t.extractedUnit}) أقل من المعدل الطبيعي (${t.refData.minValue} - ${t.refData.maxValue}). ${t.refData.lowMeaningAr}`;
          } else if (newValue > t.refData.maxValue) {
            status = 'HIGH';
            explanation = `القيمة (${newValue} ${t.extractedUnit}) أعلى من المعدل الطبيعي (${t.refData.minValue} - ${t.refData.maxValue}). ${t.refData.highMeaningAr}`;
          } else {
            status = 'NORMAL';
            explanation = `القيمة (${newValue} ${t.extractedUnit}) ضمن النطاق الطبيعي (${t.refData.minValue} - ${t.refData.maxValue}). ${t.refData.normalDescriptionAr}`;
          }
        }
        return {
          ...t,
          extractedValue: newValue,
          status,
          simplifiedExplanationAr: explanation,
          confidence: 100 // user verified
        };
      }
      return t;
    });

    const normalCount = updatedTests.filter(t => t.status === 'NORMAL').length;
    const highCount = updatedTests.filter(t => t.status === 'HIGH').length;
    const lowCount = updatedTests.filter(t => t.status === 'LOW').length;

    setLabResult({
      ...labResult,
      tests: updatedTests,
      normalCount,
      highCount,
      lowCount,
      overallSummaryAr: `تم تحديث النتائج يدوياً: (${normalCount}) طبيعي، (${highCount}) مرتفع، (${lowCount}) منخفض.`
    });
  };

  const handleSaveMedicineFromDetail = (med: Medicine) => {
    const active = activeIngredientsList.find(a => a.id === med.activeIngredientId);
    const alts = medicinesList.filter(
      m => m.activeIngredientId === med.activeIngredientId && m.id !== med.id
    );
    const resultToSave: MedicineAnalysisResult = {
      detectedTradeName: med.tradeNameAr,
      detectedActiveIngredient: active?.nameAr || '',
      detectedManufacturer: med.manufacturer,
      detectedStrength: med.strength,
      detectedDosageForm: med.dosageForm,
      confidenceScore: 100,
      textClarity: 'high',
      matchedMedicine: med,
      activeIngredientData: active || undefined,
      commercialAlternatives: alts,
      indicationsSummary: active ? active.indications : [],
      sideEffectsSummary: active ? active.sideEffects : [],
      safetyWarnings: active ? active.warnings : [],
      requiresConfirmation: false,
      timestamp: new Date().toISOString()
    };
    handleSaveMedicineResult(resultToSave);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Cairo',sans-serif] text-right overflow-x-hidden w-full" dir="rtl">
      {/* 1. Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedMedicineDetail(null);
          setActiveTab(tab);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedHistory.length}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      />

      {/* 3. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Full Medicine Detail Page View (عند الضغط على أي دواء) */}
        {selectedMedicineDetail ? (
          <MedicineDetailPage
            medicine={selectedMedicineDetail}
            onBack={() => setSelectedMedicineDetail(null)}
            onSelectMedicine={(med) => setSelectedMedicineDetail(med)}
            onSaveToHistory={handleSaveMedicineFromDetail}
          />
        ) : (
          <>
            {/* Dynamic Health Tip of the Day (نصيحة اليوم الصحية التوعوية المركزة) */}
            <HealthTipBanner />

            {/* TAB 1: MEDICINE UNIT (وحدة الأدوية والبدائل) */}
        {activeTab === 'medicine' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Pill className="w-6 h-6 text-emerald-600 rotate-45" />
                    <span>وحدة فحص الأدوية واستخراج البدائل التجارية</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    وجّه كاميرا هاتفك نحو علبة الدواء أو ارفع صورتها؛ سيتعرف النظام تلقائياً على الاسم التجاري، المادة الفعالة، الشركة المصنعة، ويعرض لك فوراً جميع البدائل المتاحة المتطابقة تماماً.
                  </p>
                </div>

                {medicineResult && (
                  <button
                    onClick={() => setMedicineResult(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    فحص دواء آخر +
                  </button>
                )}
              </div>
            </div>

            {medicineError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{medicineError}</span>
              </div>
            )}

            {/* Input Capture or Result Display */}
            {!medicineResult ? (
              <ImageCaptureAndEnhancer
                mode="medicine"
                onImageReady={handleAnalyzeMedicine}
                samples={sampleMedicineDemos}
                onSelectSample={handleSelectMedicineSample}
                isAnalyzing={isAnalyzingMedicine}
              />
            ) : (
              <MedicineAnalyzer
                result={medicineResult}
                onOpenMedicineDetail={(med) => setSelectedMedicineDetail(med)}
                onSelectAlternative={med => {
                  const active = activeIngredientsList.find(a => a.id === med.activeIngredientId);
                  const alts = medicinesList.filter(
                    m => m.activeIngredientId === med.activeIngredientId && m.id !== med.id
                  );
                  setMedicineResult({
                    detectedTradeName: med.tradeNameAr,
                    detectedActiveIngredient: active?.nameAr || '',
                    detectedManufacturer: med.manufacturer,
                    detectedStrength: med.strength,
                    detectedDosageForm: med.dosageForm,
                    confidenceScore: 98,
                    textClarity: 'high',
                    matchedMedicine: med,
                    activeIngredientData: active || undefined,
                    commercialAlternatives: alts,
                    indicationsSummary: active ? active.indications : [],
                    sideEffectsSummary: active ? active.sideEffects : [],
                    safetyWarnings: active ? active.warnings : [],
                    requiresConfirmation: false,
                    timestamp: new Date().toISOString()
                  });
                }}
                onSaveResult={handleSaveMedicineResult}
              />
            )}
          </div>
        )}

        {/* TAB 2: LAB TEST UNIT (وحدة قراءة أوراق التحاليل) */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-teal-600" />
                    <span>وحدة قراءة وتفسير التحاليل الطبية المخبرية</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    التقط صورة لورقة تقرير المختبر أو ارفع ملف التحاليل؛ سيستخلص النظام أسماء الفحوصات والنتائج الرقمية، ويقارنها بالنسب المرجعية الطبيعية مع توضيح مبسط لكل نتيجة (طبيعي / مرتفع / منخفض).
                  </p>
                </div>

                {labResult && (
                  <button
                    onClick={() => setLabResult(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    فحص تقرير آخر +
                  </button>
                )}
              </div>
            </div>

            {labError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{labError}</span>
              </div>
            )}

            {!labResult ? (
              <ImageCaptureAndEnhancer
                mode="lab"
                onImageReady={handleAnalyzeLab}
                samples={sampleLabDemos}
                onSelectSample={handleSelectLabSample}
                isAnalyzing={isAnalyzingLab}
              />
            ) : (
              <LabAnalyzer
                result={labResult}
                onSaveResult={handleSaveLabResult}
                onUpdateItemValue={handleUpdateLabItemValue}
              />
            )}
          </div>
        )}

        {/* TAB 3: MEDICINE DIRECTORY (دليل الأدوية والبدائل) */}
        {activeTab === 'medicine_directory' && (
          <MedicineDirectory onOpenMedicineDetail={(med) => setSelectedMedicineDetail(med)} />
        )}

        {/* TAB 4: LAB REFERENCE GUIDE (موسوعة التحاليل المرجعية) */}
        {activeTab === 'lab_guide' && (
          <LabReferenceGuide />
        )}
          </>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              تطبيق المساعد الطبي المنزلي • مبادرة إنسانية غير ربحية لخدمة المجتمع
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تأسيس وإشراف: <span className="font-bold text-emerald-800">عمر الطابوني</span> • <span className="text-slate-700 font-semibold">سبها</span> (tabnet2020@gmail.com) • وفق معايير السلامة الدوائية وإدارة المخاطر.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 hover:underline font-bold cursor-pointer font-mono flex items-center gap-1"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{APP_CURRENT_VERSION} (سجل التعديلات)</span>
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="text-amber-800 hover:underline font-bold cursor-pointer"
            >
              إخلاء المسؤولية القانونية
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onAccept={handleAcceptDisclaimer}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      <ScanHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={savedHistory}
        onSelect={item => {
          if (item.type === 'medicine') {
            setMedicineResult(item.data as MedicineAnalysisResult);
            setActiveTab('medicine');
            setSelectedMedicineDetail(null);
          } else {
            setLabResult(item.data as LabAnalysisResult);
            setActiveTab('lab');
            setSelectedMedicineDetail(null);
          }
        }}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}
