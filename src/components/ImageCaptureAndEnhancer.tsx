import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  Contrast,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Zap,
  ZapOff,
  Aperture
} from 'lucide-react';
import { ImageEnhancementOptions } from '../types';

interface SampleItem {
  id: string;
  name: string;
  subtitle: string;
  previewUrl: string;
}

interface Props {
  mode: 'medicine' | 'lab' | 'prescription';
  onImageReady: (base64Image: string, enhancementDetails: string) => void;
  samples?: SampleItem[];
  onSelectSample?: (sampleId: string) => void;
  isAnalyzing: boolean;
}

// Helper: compress image file/dataURL to max 1280px maintaining aspect ratio at 0.80 JPEG quality
export const compressImageFile = (file: File | string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      const origWidth = img.naturalWidth || img.width;
      const origHeight = img.naturalHeight || img.height;
      if (!origWidth || !origHeight) {
        if (typeof file === 'string') {
          resolve(file);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed reading file'));
          reader.readAsDataURL(file);
        }
        return;
      }

      const MAX_DIMENSION = 1280;
      let targetWidth = origWidth;
      let targetHeight = origHeight;

      if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
          targetWidth = MAX_DIMENSION;
        } else {
          targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
          targetHeight = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        if (typeof file === 'string') resolve(file);
        else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
      resolve(compressedDataUrl);
    };

    img.onload = processImage;
    img.onerror = (err) => {
      console.warn('Failed to load image in Image element, using raw FileReader fallback', err);
      if (typeof file === 'string') {
        resolve(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(file);
      }
    };

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    }
  });
};

export const ImageCaptureAndEnhancer: React.FC<Props> = ({
  mode,
  onImageReady,
  samples,
  onSelectSample,
  isAnalyzing
}) => {
  const [activeSource, setActiveSource] = useState<'upload' | 'camera' | 'samples'>(
    samples && samples.length > 0 ? 'samples' : 'upload'
  );
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [enhancedImageSrc, setEnhancedImageSrc] = useState<string | null>(null);
  
  // Enhancement filters: natural defaults without washing out light-colored boxes or supplements
  const [enhancements, setEnhancements] = useState<ImageEnhancementOptions>({
    contrast: 100,
    brightness: 100,
    grayscale: false,
    sharpen: false,
  });
  const [showEnhancerTools, setShowEnhancerTools] = useState(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Apply filters and auto-resize via Canvas (max 1600px, 0.85 quality)
  const applyImageFilters = (imageElement: HTMLImageElement) => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const origWidth = imageElement.naturalWidth || imageElement.width || 1280;
    const origHeight = imageElement.naturalHeight || imageElement.height || 720;

    // Constrain max dimension to 1280px while maintaining aspect ratio
    const MAX_DIMENSION = 1280;
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
        targetWidth = MAX_DIMENSION;
      } else {
        targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
        targetHeight = MAX_DIMENSION;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply canvas CSS filters for brightness and contrast
    ctx.filter = `contrast(${enhancements.contrast}%) brightness(${enhancements.brightness}%) ${
      enhancements.grayscale ? 'grayscale(100%)' : ''
    }`;

    ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);

    const enhancedDataUrl = canvas.toDataURL('image/jpeg', 0.80);
    setEnhancedImageSrc(enhancedDataUrl);
  };

  // Re-apply filters whenever image or enhancement settings change
  useEffect(() => {
    if (!rawImageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      applyImageFilters(img);
    };
    img.src = rawImageSrc;
  }, [rawImageSrc, enhancements]);

  // Handle Camera start/stop
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check if camera has flash/torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? (videoTrack.getCapabilities() as any) : null);
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('تعذر الوصول للكاميرا. يرجى التأكد من منح الإذن أو استخدام خيار التقاط الصورة أو رفعها.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const switchCameraFacing = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
    if (isCameraActive) {
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  // Capture frame from video with auto-resize (max 1280px, 0.80 quality)
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setActiveSource('upload');
    try {
      const compressed = await compressImageFile(rawDataUrl);
      setRawImageSrc(compressed);
    } catch {
      setRawImageSrc(rawDataUrl);
    }
  };

  // Handle file upload with auto compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setRawImageSrc(compressed);
    } catch (err) {
      console.error('Failed to compress image file:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setRawImageSrc(compressed);
    } catch (err) {
      console.error('Failed to compress dropped file:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to natural enhancement without washing out light colors
  const resetAutoEnhance = () => {
    setEnhancements({
      contrast: 100,
      brightness: 100,
      grayscale: false,
      sharpen: false
    });
  };

  // Trigger analysis with current enhanced image
  const handleConfirmAndAnalyze = () => {
    const finalImage = enhancedImageSrc || rawImageSrc;
    if (!finalImage) return;
    const details = `Contrast: ${enhancements.contrast}%, Brightness: ${enhancements.brightness}%, B&W: ${enhancements.grayscale ? 'Yes' : 'No'}`;
    onImageReady(finalImage, details);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Source Switcher */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => {
              stopCamera();
              setActiveSource('samples');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSource === 'samples'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            خيارات التصوير والعينات
          </button>

          <button
            onClick={() => nativeCameraInputRef.current?.click()}
            title="فتح كاميرا الهاتف بدقة كاملة والتركيز التلقائي"
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>كاميرا الهاتف (A+)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer bg-white text-slate-800 shadow-xs border border-slate-300 hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>رفع صورة</span>
          </button>

          <button
            onClick={() => {
              setActiveSource('camera');
              startCamera();
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSource === 'camera'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Aperture className="w-3.5 h-3.5" />
            <span>بث حي</span>
          </button>
        </div>

        <input
          type="file"
          ref={nativeCameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Image enhancement quick trigger */}
        {rawImageSrc && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEnhancerTools(!showEnhancerTools)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                showEnhancerTools
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>معالجة جودة الصورة والتباين</span>
            </button>

            <button
              onClick={resetAutoEnhance}
              title="تحسين تلقائي للتباين لمنع قراءة 7 كـ 1"
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تحسين ذكي</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="p-4 sm:p-6">
        {/* PROMINENT HERO CARDS FOR CAMERA & UPLOAD (FOR ELDERLY AND ALL USERS) */}
        {!rawImageSrc && activeSource !== 'camera' && (
          <div className="space-y-6">
            {/* Top Big Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Direct Camera */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white text-right shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-4 border border-emerald-500/40"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                      📸 الخيار الموصى به
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    التقط صورة بالكاميرا الآن
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                    {mode === 'medicine'
                      ? 'افتح كاميرا الهاتف وصوّر علبة الدواء بوضوح تام لقراءته فوراً.'
                      : 'افتح كاميرا الهاتف وصوّر ورقة التحاليل الطبية لقراءة النتائج ومقارنتها.'}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>

              {/* Option 2: Upload File / Gallery */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group p-5 sm:p-6 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 text-right border-2 border-slate-300 hover:border-emerald-500 text-slate-900 shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold">
                      من الهاتف أو الكمبيوتر
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    رفع صورة من الألبوم
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    اختر صورة مخزنة مسبقاً في مكتبة صور هاتفك أو ملفات جهازك.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 group-hover:border-emerald-400 group-hover:scale-110 transition-transform text-emerald-600">
                  <Upload className="w-8 h-8" />
                </div>
              </button>
            </div>

            {/* Quick Live Streaming Video Camera Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <span className="flex items-center gap-2 font-medium">
                <Aperture className="w-4 h-4 text-emerald-600" />
                <span>هل تفضل معاينة الدواء أو ورقة التحليل عبر بث الكاميرا الحي المستمر على الشاشة؟</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveSource('camera');
                  startCamera();
                }}
                className="font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 shadow-2xs hover:bg-emerald-50 cursor-pointer"
              >
                فتح البث الحي للكاميرا ←
              </button>
            </div>

            {/* SAMPLES SECTION (Ready Samples) */}
            {samples && samples.length > 0 && (
              <div className="pt-2">
                <div className="mb-3.5">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>أو اختر عينة تجريبية لاختبار دقة الفحص الفوري بنقرة واحدة:</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'medicine'
                      ? 'يمكنك تجربة التعرف على أدوية شائعة فوراً دون الحاجة لتصوير الآن.'
                      : 'يمكنك تجربة تقارير تحاليل حقيقية (CBC، دهون وسكر، وظائف كبد وكلى) فوراً.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {samples.map(sample => (
                    <div
                      key={sample.id}
                      onClick={() => {
                        if (onSelectSample) {
                          onSelectSample(sample.id);
                        } else {
                          setRawImageSrc(sample.previewUrl);
                        }
                      }}
                      className="group relative border border-slate-200 hover:border-emerald-500 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-emerald-50/20 p-3.5 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-200 mb-3 relative">
                        <img
                          src={sample.previewUrl}
                          alt={sample.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] rounded-md font-medium backdrop-blur-xs">
                          جاهز للفحص
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {sample.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {sample.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SOURCE 2: Camera Live View */}
        {activeSource === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">خطأ في الكاميرا</p>
                  <p className="mt-0.5">{cameraError}</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 sm:aspect-16/9 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Target Guides Overlay for Medicine Box or Lab Paper */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div className="border-2 border-dashed border-white/60 rounded-2xl w-full max-w-md h-4/5 flex flex-col justify-between p-4 relative">
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
                      <span className="w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
                    </div>
                    <div className="text-center bg-slate-900/60 text-white text-[11px] py-1 px-3 rounded-full mx-auto backdrop-blur-xs">
                      {mode === 'medicine'
                        ? 'ضع اسم الدواء والمادة الفعالة داخل الإطار'
                        : 'ضع جدول نتائج التحاليل داخل الإطار بوضوح'}
                    </div>
                    <div className="flex justify-between">
                      <span className="w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
                      <span className="w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Camera Control Buttons */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    onClick={switchCameraFacing}
                    title="تبديل الكاميرا الأمامية/الخلفية"
                    className="p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      title="تشغيل/إيقاف فلاش الكاميرا"
                      className={`p-3 rounded-full backdrop-blur-xs transition-all cursor-pointer ${
                        isTorchOn
                          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 ring-2 ring-white'
                          : 'bg-slate-900/70 hover:bg-slate-900 text-white'
                      }`}
                    >
                      {isTorchOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </button>
                  )}

                  <button
                    onClick={capturePhoto}
                    title="التقاط الصورة"
                    className="p-4 sm:p-5 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg shadow-emerald-500/30 transition-all border-4 border-white cursor-pointer"
                  >
                    <Camera className="w-6 h-6 sm:w-7 h-7" />
                  </button>

                  <button
                    onClick={stopCamera}
                    title="إلغاء الكاميرا"
                    className="p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-xs transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SOURCE 3: File Upload Area */}
        {activeSource === 'upload' && !rawImageSrc && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-400 shadow-xs flex items-center justify-center mx-auto text-emerald-600 group-hover:scale-105 transition-all">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mt-4">
              اسحب وأفلت صورة {mode === 'medicine' ? 'علبة الدواء' : 'ورقة التحليل'} هنا
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              أو اضغط لاختيار صورة من هاتفك أو جهازك بصيغ (JPG, PNG, WEBP). احرص على إضاءة جيدة لضمان دقة القراءة.
            </p>
          </div>
        )}

        {/* IMAGE PREVIEW & ENHANCEMENT CONTROLS (If an image is selected/captured) */}
        {rawImageSrc && (
          <div className="space-y-4">
            {/* Enhancement Control Drawer (Section 5 Risk Prevention) */}
            {showEnhancerTools && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    أدوات ضبط وضوح المستند (لمنع قراءة 7 كـ 1):
                  </span>
                  <button
                    onClick={resetAutoEnhance}
                    className="text-emerald-700 hover:underline font-bold cursor-pointer"
                  >
                    تطبيق الإعداد المثالي المقترح
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Contrast className="w-3.5 h-3.5" />
                        التباين (Contrast):
                      </span>
                      <span>{enhancements.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="220"
                      value={enhancements.contrast}
                      onChange={e =>
                        setEnhancements(prev => ({ ...prev, contrast: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" />
                        السطوع (Brightness):
                      </span>
                      <span>{enhancements.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="150"
                      value={enhancements.brightness}
                      onChange={e =>
                        setEnhancements(prev => ({ ...prev, brightness: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Grayscale Toggle */}
                  <div className="flex items-center gap-3 pt-4 sm:pt-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhancements.grayscale}
                        onChange={e =>
                          setEnhancements(prev => ({ ...prev, grayscale: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-700">
                        تحويل لأبيض وأسود (عالي الدقة للأرقام)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-96 flex items-center justify-center">
              <img
                src={enhancedImageSrc || rawImageSrc}
                alt="الصورة قيد الفحص"
                className="max-h-96 w-auto object-contain"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] backdrop-blur-xs flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  معاينة الصورة المعالجة
                </span>
              </div>

              <div className="absolute top-3 left-3">
                <button
                  onClick={() => {
                    setRawImageSrc(null);
                    setEnhancedImageSrc(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-900 backdrop-blur-xs cursor-pointer"
                  title="تغيير الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Confirmation & Analysis Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">نصيحة:</span> تأكد من أن النصوص والأرقام مقروءة وواضحة قبل بدء التحليل.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRawImageSrc(null);
                    setEnhancedImageSrc(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  إعادة اختيار صورة
                </button>

                <button
                  onClick={handleConfirmAndAnalyze}
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري القراءة والمعالجة البصرية...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>بدء الفحص واستخراج البيانات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
