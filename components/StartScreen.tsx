"use client";

import React from "react";
import { Play, Trophy, Rocket, Shield, Download, Sparkles } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
  highStock: number;
  highDistance: number;
  onExportGLB: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  highStock,
  highDistance,
  onExportGLB,
}) => {
  return (
    <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-20">
      <div className="max-w-xl w-full bg-neutral-950/90 border-2 border-nvidia/50 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(118,185,0,0.3)]">
        {/* Title Badges */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nvidia/20 border border-nvidia/40 text-nvidia text-xs font-black tracking-widest uppercase mb-3">
          <Sparkles size={14} /> 3D Subway Surfers Parody
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase italic leading-none drop-shadow-lg">
          NVIDIA ESCAPE
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-nvidia tracking-wider uppercase mt-1 mb-4">
          Silicon Valley Run
        </h2>

        <p className="text-sm text-neutral-300 max-w-md leading-relaxed mb-6">
          Jensen Huang is on the run! Dodge CNBC & Bloomberg news vans, duck under Lori&apos;s $75B divorce banner, leap over angry Board Members, and don&apos;t let the Chinese PM catch you!
        </p>

        {/* High Score Records */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase flex items-center gap-1">
              <Trophy size={12} className="text-amber-400" /> Peak Stock ATH
            </span>
            <span className="text-lg md:text-xl font-black font-mono text-emerald-400">
              ${highStock.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-neutral-800">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase">
              Longest Escape
            </span>
            <span className="text-lg md:text-xl font-black font-mono text-white">
              {Math.floor(highDistance)} m
            </span>
          </div>
        </div>

        {/* Controls Tutorial */}
        <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 mb-6 text-xs text-neutral-300">
          <div className="font-bold text-neutral-200 mb-2 uppercase tracking-wider text-[11px]">
            Controls
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/60 p-2 rounded-lg border border-neutral-800">
              <div className="font-mono text-nvidia font-bold">← / → (A / D)</div>
              <div className="text-[11px] text-neutral-400">Switch Lanes</div>
            </div>
            <div className="bg-black/60 p-2 rounded-lg border border-neutral-800">
              <div className="font-mono text-nvidia font-bold">↑ / Space (W)</div>
              <div className="text-[11px] text-neutral-400">Jump Barrier</div>
            </div>
            <div className="bg-black/60 p-2 rounded-lg border border-neutral-800">
              <div className="font-mono text-nvidia font-bold">↓ (S)</div>
              <div className="text-[11px] text-neutral-400">Slide Under</div>
            </div>
          </div>
        </div>

        {/* Powerups Preview */}
        <div className="w-full flex justify-center gap-4 mb-6 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1.5 rounded-xl">
            <Rocket size={14} className="text-cyan-400" />
            <span>Elon SpaceX Booster</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-xl">
            <Shield size={14} className="text-amber-400" />
            <span>Trump Tariff Shield</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-nvidia hover:bg-[#86d400] text-black font-black text-lg md:text-xl uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_0_25px_rgba(118,185,0,0.6)] flex items-center justify-center gap-2"
          >
            <Play size={22} fill="currentColor" />
            Start Running
          </button>

          {/* 3D Model GLB Exporter button requested by user */}
          <button
            onClick={onExportGLB}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download size={15} />
            Download 3D Jensen Huang Model (.GLB)
          </button>
        </div>
      </div>
    </div>
  );
};

