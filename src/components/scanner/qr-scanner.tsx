'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  CheckCircle2,
  ScanLine,
  X,
  Volume2,
  VolumeX,
  Upload,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/loader';
import { CHECK_IN_MESSAGES } from '../../constants/messages';

interface QrScannerProps {
  onScan: (data: string) => void;
  isProcessing?: boolean;
  onClose?: () => void;
  className?: string;
}

export function QrScanner({ onScan, isProcessing = false, onClose, className = '' }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio chime on scan using Web Audio API
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore if autoplay restricted
    }
  }, [soundEnabled]);

  // Check available camera devices
  useEffect(() => {
    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {});
    }
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start video stream with fallback constraints
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);
    setPermissionState('prompt');

    if (!navigator?.mediaDevices?.getUserMedia) {
      setPermissionState('unsupported');
      setErrorMessage(CHECK_IN_MESSAGES.CAMERA_NOT_SUPPORTED);
      return;
    }

    let stream: MediaStream | null = null;

    // 1. First attempt with ideal facingMode and resolution
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (idealErr: any) {
      console.warn('Ideal camera constraints failed, attempting fallback to generic video:', idealErr);

      if (idealErr.name === 'NotAllowedError' || idealErr.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage(CHECK_IN_MESSAGES.CAMERA_PERMISSION_DENIED);
        return;
      }

      // 2. Fallback attempt with generic constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (fallbackErr: any) {
        console.warn('Generic camera access failed:', fallbackErr);
        if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          setErrorMessage(CHECK_IN_MESSAGES.CAMERA_PERMISSION_DENIED);
        } else if (fallbackErr.name === 'NotFoundError' || fallbackErr.name === 'DevicesNotFoundError') {
          setPermissionState('unsupported');
          setErrorMessage(CHECK_IN_MESSAGES.CAMERA_NOT_FOUND);
        } else {
          setPermissionState('denied');
          setErrorMessage(fallbackErr.message || CHECK_IN_MESSAGES.CAMERA_NOT_SUPPORTED);
        }
        return;
      }
    }

    if (!stream) {
      setPermissionState('denied');
      return;
    }

    streamRef.current = stream;

    // Attach stream to video element
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      try {
        await video.play();
      } catch (playErr) {
        console.warn('video.play() auto-resuming on user interaction:', playErr);
      }
    }

    setPermissionState('granted');
  }, [facingMode, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Main scanning loop
  useEffect(() => {
    if (permissionState !== 'granted' || isProcessing || scanSuccessAnim) {
      return;
    }

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
          const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);

          // Decode QR
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (qrCode && qrCode.data && qrCode.data.trim()) {
            const trimmed = qrCode.data.trim();

            // Trigger success flow
            playBeep();
            setScanSuccessAnim(true);
            setLastScannedCode(trimmed);
            onScan(trimmed);

            // Cooldown animation
            setTimeout(() => {
              setScanSuccessAnim(false);
            }, 1800);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [permissionState, isProcessing, scanSuccessAnim, onScan, playBeep]);

  // Image upload scanning fallback
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (qrCode && qrCode.data && qrCode.data.trim()) {
            playBeep();
            setScanSuccessAnim(true);
            onScan(qrCode.data.trim());
            setTimeout(() => setScanSuccessAnim(false), 1800);
          } else {
            setErrorMessage('No QR code detected in this image. Please ensure the QR is clear and well-lit.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className={`relative overflow-hidden rounded-none border border-zinc-800 bg-black text-white shadow-2xl font-mono ${className}`}>
      {/* Hidden offscreen canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for QR image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Scanner Header Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 bg-black/90 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
            <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
            SCANNER.OPTICAL_HUD
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-none border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors"
            title={soundEnabled ? 'Mute beep' : 'Enable beep'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
          </button>

          {/* Upload QR Image file shortcut */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-none border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors"
            title="Upload QR image file"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          {/* Camera Switcher (Flip Front/Back) */}
          {hasMultipleCameras && (
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-1.5 rounded-none border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors"
              title="Switch camera"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Scanner */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-none border border-white/10 bg-white/5 hover:bg-white/15 text-white transition-colors"
              title="Close camera"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport - Video is ALWAYS present in DOM and attached */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && streamRef.current && el.srcObject !== streamRef.current) {
              el.srcObject = streamRef.current;
              el.muted = true;
              el.playsInline = true;
              el.play().catch(() => {});
            }
          }}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            permissionState === 'granted'
              ? scanSuccessAnim
                ? 'opacity-70 blur-[1px]'
                : 'opacity-100'
              : 'opacity-0 absolute pointer-events-none'
          }`}
        />

        {/* Viewfinder Overlay with Darkened Vignette & Corner Reticles */}
        {permissionState === 'granted' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Darkened surroundings */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Clear central target square */}
            <div
              className={`relative w-52 h-52 sm:w-56 sm:h-56 rounded-none transition-all duration-200 ${
                scanSuccessAnim
                  ? 'border-2 border-emerald-400 bg-emerald-500/10'
                  : isProcessing
                  ? 'border-2 border-white'
                  : 'border border-white/20'
              }`}
            >
              {/* Corner Reticles */}
              <div
                className={`absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 rounded-none transition-colors ${
                  scanSuccessAnim ? 'border-emerald-400' : 'border-white'
                }`}
              />
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 rounded-none transition-colors ${
                  scanSuccessAnim ? 'border-emerald-400' : 'border-white'
                }`}
              />
              <div
                className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 rounded-none transition-colors ${
                  scanSuccessAnim ? 'border-emerald-400' : 'border-white'
                }`}
              />
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 rounded-none transition-colors ${
                  scanSuccessAnim ? 'border-emerald-400' : 'border-white'
                }`}
              />

              {/* Sweeping Laser Scan Line */}
              {!scanSuccessAnim && !isProcessing && (
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[scannerSweep_2.2s_ease-in-out_infinite]" />
              )}

              {/* Success Badge Inside Reticle */}
              {scanSuccessAnim && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 animate-in zoom-in-90 duration-200">
                  <div className="w-10 h-10 rounded-none bg-emerald-500 text-black flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold text-black bg-emerald-400 px-2 py-0.5 rounded-none">
                    [PASS_VERIFIED]
                  </span>
                </div>
              )}

              {/* Processing Spinner Inside Reticle */}
              {isProcessing && !scanSuccessAnim && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 rounded-none">
                  <Spinner size="lg" variant="emerald" />
                  <span className="text-xs font-mono uppercase text-white tracking-wider">DECODING...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt / Loading Permission State */}
        {permissionState === 'prompt' && (
          <div className="flex flex-col items-center gap-3 p-6 text-center z-10 animate-in fade-in duration-200">
            <div className="w-10 h-10 rounded-none bg-white/10 border border-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white">INITIALIZING_OPTICAL_FEED</p>
              <p className="text-xs text-zinc-400 mt-1 font-sans">Connecting to local video capture device...</p>
            </div>
            <Spinner size="sm" variant="emerald" className="mt-2" />
          </div>
        )}

        {/* Denied / Error State */}
        {permissionState === 'denied' && (
          <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm z-10 animate-in fade-in duration-200">
            <div className="w-10 h-10 rounded-none bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <CameraOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white">FEED_ACCESS_DENIED</p>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-sans">
                {errorMessage || CHECK_IN_MESSAGES.CAMERA_PERMISSION_DENIED}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={startCamera}
                className="rounded-none bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Retry</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-none bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                <span>Upload File</span>
              </Button>
            </div>
          </div>
        )}

        {/* Unsupported State */}
        {permissionState === 'unsupported' && (
          <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm z-10 animate-in fade-in duration-200">
            <div className="w-10 h-10 rounded-none bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-white">HARDWARE_NOT_SUPPORTED</p>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed font-sans">
                {errorMessage || CHECK_IN_MESSAGES.CAMERA_NOT_SUPPORTED}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 rounded-none bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              <span>Upload Pass</span>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Instructions / Status Footer */}
      <div className="p-3 bg-zinc-950 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <span className="truncate font-sans">
          {permissionState === 'granted'
            ? 'Align visitor QR pass within the optical frame'
            : 'Standby mode'}
        </span>
        {permissionState === 'granted' && (
          <span className="text-[10px] font-mono text-emerald-400 font-medium shrink-0 ml-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
            [AUTO_SCAN]
          </span>
        )}
      </div>
    </div>
  );
}
