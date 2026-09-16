"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type SignalParticlesBackgroundProps = {
  spacing?: number;
  speed?: number;
  opacity?: number;
  className?: string;
};

const DEFAULTS = {
  spacing: 16,
  speed: 1,
  opacity: 0.8,
} as const;

function rgba([red, green, blue]: [number, number, number], alpha: number) {
  return `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`;
}

export default function SignalParticlesBackground({
  className,
  spacing = DEFAULTS.spacing,
  speed = DEFAULTS.speed,
  opacity = DEFAULTS.opacity,
}: SignalParticlesBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let width = 0;
    let height = 0;
    let time = 0;
    let frame = 0;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const bounds = host.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      const currentSpacing = Math.max(spacing, 8);
      const cols = Math.ceil(width / currentSpacing);
      const rows = Math.ceil(height / currentSpacing);
      const offsetX = (width - cols * currentSpacing) / 2;
      const offsetY = (height - rows * currentSpacing) / 2;
      const animationTime = time * speed;
      const baseAlpha = opacity;

      for (let column = 0; column <= cols; column += 1) {
        for (let row = 0; row <= rows; row += 1) {
          const x = offsetX + column * currentSpacing;
          const y = offsetY + row * currentSpacing;
          const nx = column * 0.1;
          const ny = row * 0.1;
          const waveOne = Math.sin(nx + animationTime * 0.5) * Math.cos(ny - animationTime * 0.3);
          const waveTwo = Math.sin(nx * 0.5 - ny * 0.5 + animationTime * 0.8);
          const signal = waveOne + waveTwo;

          if (signal <= 0.1) continue;

          const highlightCheck = Math.sin(column * 12.34) * Math.cos(row * 56.78);
          const color: [number, number, number] = highlightCheck > 0.98
            ? [1, 0.24, 0.28]
            : highlightCheck < -0.98
              ? [0.95, 0.42, 0.48]
              : [0.82, 0.58, 0.62];
          const alpha = Math.min(0.7, (signal - 0.1) * 0.85) * baseAlpha;
          const radius = highlightCheck > 0.98 || highlightCheck < -0.98 ? 1.9 : 1.35;

          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = rgba(color, alpha);
          context.fill();
        }
      }

      if (!reducedMotion && visible && !document.hidden) {
        time += 0.02;
        frame = requestAnimationFrame(draw);
      }
    };

    const requestDraw = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const resizeObserver = new ResizeObserver(() => {
      resize();
      requestDraw();
    });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    });

    resize();
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    document.addEventListener("visibilitychange", requestDraw);
    requestDraw();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", requestDraw);
    };
  }, [opacity, spacing, speed]);

  return (
    <div ref={hostRef} className={cn("pointer-events-none", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
