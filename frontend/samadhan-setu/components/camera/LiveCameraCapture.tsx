"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useGeolocation } from "@/lib/hooks/useGeolocation";

export function LiveCameraCapture({
  onCapture
}: {
  onCapture: (photoDataUrl: string, geo: { lat: number; long: number; accuracy: number }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const geo = useGeolocation();

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch (err: any) {
      setCameraError(
        "Camera stream unavailable (or desktop mode). You can capture a simulated test photo or upload a test file below for desktop testing."
      );
    }
  }, []);

  useEffect(() => {
    startCamera();
    geo.request();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureLive = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // Simulated desktop test photo (e.g. for testing when camera is unavailable)
  const generateSimulatedPhoto = () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw simulated civic issue scene (road / asphalt background with crack)
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 0, 640, 480);
      
      // Road markings
      ctx.strokeStyle = "#FACC15";
      ctx.lineWidth = 8;
      ctx.setLineDash([30, 20]);
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 480);
      ctx.stroke();

      // Pothole / Issue mark
      ctx.setLineDash([]);
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.ellipse(320, 240, 110, 65, Math.PI / 8, 0, 2 * Math.PI);
      ctx.fill();

      // Timestamp watermark
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px monospace";
      ctx.fillText(`SAMADHAN SETU TEST EVIDENCE - ${new Date().toISOString()}`, 20, 450);
      ctx.fillText(`GPS: ±${Math.round(activeLocation.accuracy)}m`, 20, 468);
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  // Fallback location for development if browser geolocation times out or is blocked
  const activeLocation = geo.position || {
    lat: 12.9716,
    long: 77.5946,
    accuracy: 12
  };

  const weakGps = activeLocation.accuracy > 50;

  const confirm = () => {
    if (!photo) return;
    onCapture(photo, activeLocation);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Viewfinder Viewport */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner">
        {!photo && (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        )}
        {photo && (
          <img src={photo} alt="Captured evidence" className="h-full w-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Reticle Overlay */}
        {!photo && !cameraError && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex justify-between items-center text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md self-start">
              <span>● LIVE VIEW</span>
              <span className="ml-2">30 FPS</span>
            </div>
            <div className="self-center w-24 h-24 border border-white/40 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-civic animate-ping" />
            </div>
            <div className="text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md self-end">
              GEO-LOCK: {activeLocation.lat.toFixed(4)}, {activeLocation.long.toFixed(4)}
            </div>
          </div>
        )}

        {cameraError && !photo && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl mb-3">
              📷
            </div>
            <p className="text-sm font-semibold mb-1">Desktop / No-Webcam Mode</p>
            <p className="text-xs text-slate-300 max-w-sm mb-4">
              {cameraError}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" onClick={generateSimulatedPhoto}>
                Generate Test Photo
              </Button>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Upload File Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </div>

      {/* GPS & Status Bar */}
      <div className="flex items-center justify-between text-xs px-1 text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${geo.position ? "bg-verified" : "bg-signal"}`} />
          {geo.loading && "Acquiring GPS lock…"}
          {!geo.loading && geo.position && `GPS Locked · ±${Math.round(geo.position.accuracy)}m`}
          {!geo.loading && !geo.position && `Using Local Dev GPS (±${activeLocation.accuracy}m)`}
        </span>
        {weakGps && (
          <span className="font-semibold text-signal">Low GPS accuracy</span>
        )}
      </div>

      {/* Actions */}
      {!photo ? (
        <div className="flex gap-2">
          <Button
            onClick={captureLive}
            disabled={!ready || !!cameraError}
            fullWidth
            className="flex-1"
          >
            Capture Live Photo
          </Button>
          {cameraError && (
            <Button
              variant="secondary"
              onClick={generateSimulatedPhoto}
              className="flex-1"
            >
              Simulate Photo
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={retake} className="flex-1">
            Retake
          </Button>
          <Button onClick={confirm} className="flex-1">
            Use This Evidence
          </Button>
        </div>
      )}
    </div>
  );
}
