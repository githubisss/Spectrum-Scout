import React, { useEffect, useRef } from 'react';

interface WaterfallHeatmapProps {
  currentBandId: number;
  bandsCount: number;
  activityLevels: number[]; // 12 numbers from 0 to 100
  isRunning: boolean;
  scanMode: 'SMART' | 'NORMAL';
}

export const WaterfallHeatmap: React.FC<WaterfallHeatmapProps> = ({
  currentBandId,
  bandsCount,
  activityLevels,
  isRunning,
  scanMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Shift previous image down by 2 pixels (falling waterfall)
    const width = canvas.width;
    const height = canvas.height;

    // Grab current content
    const imgData = ctx.getImageData(0, 0, width, height - 2);
    ctx.putImageData(imgData, 0, 2);

    // Draw the latest 2-pixel row at top
    const colWidth = width / bandsCount;

    for (let i = 0; i < bandsCount; i++) {
      const bandId = i + 1;
      const activity = activityLevels[i] || 10;
      const isScanned = bandId === currentBandId;

      // Color mapping: deep blue -> teal -> yellow -> red/magenta
      let r = 2;
      let g = 20;
      let b = 60;

      if (activity >= 70) {
        // Red / pink hot spot
        r = 255;
        g = Math.round(30 + (activity - 70) * 4);
        b = 80;
      } else if (activity >= 40) {
        // Yellow / orange
        r = 240;
        g = 180;
        b = 20;
      } else if (activity >= 20) {
        // Cyan / green
        r = 10;
        g = 180;
        b = 220;
      }

      // If scanned at this instant, flash with bright laser lime
      if (isScanned) {
        r = 110;
        g = 245;
        b = 44;
      }

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i * colWidth, 0, colWidth - 1, 2);
    }
  }, [currentBandId, activityLevels, bandsCount]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-[#0094ff]/60 bg-[#020b18] shadow-inner">
      <div className="absolute top-1 left-2 z-10 text-[9px] font-game font-bold tracking-wider text-cyan-300/80 uppercase pointer-events-none flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6ef52c] animate-ping" />
        <span>REAL-TIME SPECTROGRAM WATERFALL (TIME &darr;)</span>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={56}
        className="w-full h-14 block"
      />
    </div>
  );
};
