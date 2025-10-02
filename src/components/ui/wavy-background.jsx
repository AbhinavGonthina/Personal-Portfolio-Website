"use client";
import { cn } from "../../lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 3,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}) => {
  const noise = createNoise3D();
  let w, h, nt, i, x, ctx, canvas;
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    ctx = canvas.getContext("2d", { alpha: true });
    w = ctx.canvas.width = container.offsetWidth;
    h = ctx.canvas.height = container.offsetHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;

    let resizeTimeout;
    window.onresize = function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (container) {
          w = ctx.canvas.width = container.offsetWidth;
          h = ctx.canvas.height = container.offsetHeight;
          ctx.filter = `blur(${blur}px)`;
        }
      }, 100);
    };
    render();
  };

  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const drawWave = (n) => {
    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (x = 0; x < w; x += 10) {
        var y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.575);
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId;
  const render = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = waveOpacity || 0.5;
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full", containerClassName)}
    >
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
