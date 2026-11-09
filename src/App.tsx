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
import { DrugInteractionChecker } from './components/DrugInteractionChecker';
import { PrescriptionReader } from './components/PrescriptionReader';
import { DynamicHomeHub } from './components/DynamicHomeHub';
import { VisitorAnalyticsModal } from './components/VisitorAnalyticsModal';
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
  DrugInteractionResult,
  PrescriptionAnalysisResult,
  SavedHistoryItem,
  Medicine,
  PatientHealthCondition
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
  GitCommit,
  Users,
  Printer
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('medicine');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [selectedMedicineDetail, setSelectedMedicineDetail] = useState<Medicine | null>(null);
  const [savedHistory, setSavedHistory] = useState<SavedHistoryItem[]>([]);

  // Patient Warning Health Profile
  const [patientConditions, setPatientConditions] = useState<PatientHealthCondition[]>(() => {
    try {
      const stored = localStorage.getItem('user_patient_health_conditions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Visitor quick counter in footer
  const [visitorStats, setVisitorStats] = useState<{ totalVisits: number; uniqueVisitors: number } | null>(null);

  // Flow states
  const [isAnalyzingMedicine, setIsAnalyzingMedicine] = useState(false);
  const [medicineResult, setMedicineResult] = useState<MedicineAnalysisResult | null>(null);
  const [medicineError, setMedicineError] = useState<string | null>(null);

  const [isAnalyzingLab, setIsAnalyzingLab] = useState(false);
  const [labResult, setLabResult] = useState<LabAnalysisResult | null>(null);
  const [labError, setLabError] = useState<string | null>(null);

  // States for restoring history in interaction and prescription tabs
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);
  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionAnalysisResult | null>(null);

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

    // Log initial visitor load
    fetch('/api/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'page_load', details: 'تصفح التطبيق' })
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.totalVisits) {
          setVisitorStats({ totalVisits: data.totalVisits, uniqueVisitors: data.uniqueVisitors });
        }
      })
      .catch(e => console.warn('Visitor log ping:', e));
  }, []);

  const handleToggleCondition = (condition: PatientHealthCondition) => {
    const updated = patientConditions.includes(condition)
      ? patientConditions.filter(c => c !== condition)
      : [...patientConditions, condition];

    setPatientConditions(updated);
    try {
      localStorage.setItem('user_patient_health_conditions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed saving health profile:', e);
    }
  };

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

  const handleSaveInteractionResult = (res: DrugInteractionResult) => {
    const newItem: SavedHistoryItem = {
      id: `interaction-${Date.now()}`,
      type: 'interaction',
      title: `فحص تعارض: ${res.medicinesChecked.join(' + ')}`,
      timestamp: new Date().toISOString(),
      summary: res.summaryAr.slice(0, 100) + '...',
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

  const handleSavePrescriptionResult = (res: PrescriptionAnalysisResult) => {
    const list = res.medicines || res.items || res.medications || [];
    const doc = res.doctorName || res.doctorOrClinicName || (list.length > 0 ? 'طبيب استشاري' : 'روشتة طبية');
    const newItem: SavedHistoryItem = {
      id: `rx-${Date.now()}`,
      type: 'prescription',
      title: `روشتة: ${doc} (${list.length} أدوية)`,
      timestamp: new Date().toISOString(),
      summary: list.length > 0
        ? `الأدوية: ${list.map(m => m.arabicName || m.nameAr || m.tradeName || m.name || m.extractedName || m.nameEn).join('، ')}`
        : 'لم تسجل أدوية مؤكدة في هذا الفحص',
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
          enhancementDetails,
          patientConditions
        })
      });

      if (!response.ok) {
        throw new Error('فشلت قراءة صورة الدواء من الخادم.');
      }

      const data: MedicineAnalysisResult = await response.json();
      setMedicineResult(data);

      // Log scan activity
      fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan_medicine',
          actionLabel: 'فحص دواء بالكاميرا',
          details: data.detectedTradeName
        })
      }).catch(() => {});
    } catch (err: any) {
      console.error('Error analyzing medicine:', err);
      setMedicineError(err.message || 'حدث خطأ أثناء فحص صورة الدواء.');
    } finally {
      setIsAnalyzingMedicine(false);
    }
  };

  // Barcode search trigger
  const handleBarcodeSearch = async (barcode: string) => {
    setIsAnalyzingMedicine(true);
    setMedicineError(null);
    try {
      const response = await fetch('/api/search-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          patientConditions
        })
      });

      if (!response.ok) {
        throw new Error(`لم يتم العثور على دواء مسجل بالباركود: ${barcode}`);
      }

      const data: MedicineAnalysisResult = await response.json();
      setMedicineResult(data);

      fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan_barcode',
          actionLabel: 'بحث باركود دواء',
          details: `${data.detectedTradeName} (${barcode})`
        })
      }).catch(() => {});
    } catch (err: any) {
      setMedicineError(err.message || 'تعذر مطابقة الباركود.');
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
          manualQuery: sample.mockData.tradeName,
          patientConditions
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

      fetch('/api/log-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan_lab',
          actionLabel: 'فحص ورقة تحاليل',
          details: `${data.tests.length} فحص مستخرج`
        })
      }).catch(() => {});
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
          value: newValue,
          numericValue: newValue,
          status,
          simplifiedExplanationAr: explanation,
          confidence: 100
        };
      }
      return t;
    });

    const normalCount = updatedTests.filter(t => t.status === 'NORMAL').length;
    const highCount = updatedTests.filter(t => t.status === 'HIGH' || t.status === 'CRITICAL_HIGH').length;
    const lowCount = updatedTests.filter(t => t.status === 'LOW' || t.status === 'CRITICAL_LOW').length;

    setLabResult({
      ...labResult,
      tests: updatedTests,
      normalCount,
      highCount,
      lowCount,
      overallSummaryAr: `تم تحديث النتائج يدوياً وتدقيقها: (${normalCount}) سليم، (${highCount}) مرتفع، (${lowCount}) منخفض.`
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

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Full Medicine Detail Page View */}
        {selectedMedicineDetail ? (
          <MedicineDetailPage
            medicine={selectedMedicineDetail}
            onBack={() => setSelectedMedicineDetail(null)}
            onSelectMedicine={(med) => setSelectedMedicineDetail(med)}
            onSaveToHistory={handleSaveMedicineFromDetail}
          />
        ) : (
          <>
            {/* Dynamic Smart Home Rotation & Personal Warning Health Profile */}
            <DynamicHomeHub
              onNavigateTab={(tab) => {
                setSelectedMedicineDetail(null);
                setActiveTab(tab);
              }}
              activeConditions={patientConditions}
              onToggleCondition={handleToggleCondition}
            />

            {/* Health Tip of the Day */}
            <HealthTipBanner />

            {/* TAB 1: MEDICINE UNIT */}
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
                        وجّه كاميرا هاتفك نحو علبة الدواء أو ابحث بالباركود؛ سيتعرف النظام تلقائياً على الاسم التجاري، المادة الفعالة، والبدائل المتطابقة مع مراعاة ملفك الصحي التحذيري.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                    onBarcodeSearch={handleBarcodeSearch}
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

            {/* TAB 2: LAB TEST UNIT */}
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
                        التقط صورة لورقة تقرير المختبر أو ارفع ملف التحاليل؛ سيستخلص النظام أسماء الفحوصات والنتائج الرقمية، ويقارنها بالنسب المرجعية مع إمكانية تعديل الأرقام يدوياً.
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

            {/* TAB: DRUG INTERACTIONS CHECKER */}
            {activeTab === 'drug_interactions' && (
              <DrugInteractionChecker
                onSaveResult={handleSaveInteractionResult}
                initialResult={interactionResult}
              />
            )}

            {/* TAB: PRESCRIPTION READER */}
            {activeTab === 'prescription' && (
              <PrescriptionReader
                onSaveResult={handleSavePrescriptionResult}
                initialResult={prescriptionResult}
              />
            )}

            {/* TAB 3: MEDICINE DIRECTORY */}
            {activeTab === 'medicine_directory' && (
              <MedicineDirectory onOpenMedicineDetail={(med) => setSelectedMedicineDetail(med)} />
            )}

            {/* TAB 4: LAB REFERENCE GUIDE */}
            {activeTab === 'lab_guide' && (
              <LabReferenceGuide />
            )}
          </>
        )}
      </main>

      {/* 3. Footer with Visitor Counter, Print Button, and Admin Analytics */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              تطبيق المساعد الطبي المنزلي • مبادرة إنسانية غير ربحية لخدمة المجتمع
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تأسيس وإشراف: <span className="font-bold text-emerald-800">عمر الطابوني</span> • <span className="text-slate-700 font-semibold">سبها</span> (tabnet2020@gmail.com) • وفق معايير السلامة الدوائية وإدارة المخاطر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Visitor Counter Button */}
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer font-medium shadow-2xs"
              title="عرض لوحة إحصائيات وسجل الزوار"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                الزوار: <strong className="font-bold text-slate-900">{visitorStats ? visitorStats.totalVisits.toLocaleString('ar-EG') : '1,420+'}</strong>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] text-emerald-700 font-bold">لوحة الإحصائيات 📊</span>
            </button>

            {/* A4 Print Button */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer font-medium shadow-2xs"
              title="طباعة التقرير الطبي A4"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>طباعة A4</span>
            </button>

            <button
              onClick={() => setIsChangelogOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 hover:underline font-bold cursor-pointer font-mono flex items-center gap-1"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{APP_CURRENT_VERSION}</span>
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

      {/* 4. Modals */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onAccept={handleAcceptDisclaimer}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      <VisitorAnalyticsModal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
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
          } else if (item.type === 'lab') {
            setLabResult(item.data as LabAnalysisResult);
            setActiveTab('lab');
            setSelectedMedicineDetail(null);
          } else if (item.type === 'interaction') {
            setInteractionResult(item.data as DrugInteractionResult);
            setActiveTab('drug_interactions');
            setSelectedMedicineDetail(null);
          } else if (item.type === 'prescription') {
            setPrescriptionResult(item.data as PrescriptionAnalysisResult);
            setActiveTab('prescription');
            setSelectedMedicineDetail(null);
          }
        }}
        onDelete={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}
