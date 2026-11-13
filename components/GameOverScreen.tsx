"use client";

import React from "react";
import { RotateCcw, Trophy, DollarSign, TrendingDown, Download, Skull } from "lucide-react";

interface GameOverScreenProps {
  reason: string;
  finalStock: number;
  peakStock: number;
  distance: number;
  wafers: number;
  isNewATH: boolean;
  onRestart: () => void;
  onExportGLB: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  reason,
  finalStock,
  peakStock,
  distance,
  wafers,
  isNewATH,
  onRestart,
  onExportGLB,
}) => {
  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-20">
      <div className="max-w-md w-full bg-neutral-950/95 border-2 border-rose-500/60 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.35)] animate-in fade-in zoom-in-95 duration-200">
        {/* Skull / Crash Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-500 mb-3 shadow-lg">
          <Skull size={32} />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-tight">
          NVIDIA LIQUIDATED!
        </h2>
        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mt-1 mb-4">
          Margin Call Triggered
        </p>

        {/* Humorous Reason Box */}
        <div className="w-full bg-rose-950/30 border border-rose-900/60 rounded-xl p-3 mb-5 text-xs text-rose-200 italic leading-relaxed">
          &ldquo;{reason}&rdquo;
        </div>

        {/* New ATH Notification */}
        {isNewATH && (
          <div className="w-full mb-4 py-2 px-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 animate-bounce">
            <Trophy size={16} /> New All-Time High Stock Record!
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Peak Stock Price</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              ${peakStock.toFixed(2)}
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Final Stock</span>
            <span className="text-lg font-black font-mono text-rose-400">
              ${finalStock.toFixed(2)}
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Silicon Wafers</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {wafers}
            </span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3">
            <span className="text-[10px] text-neutral-400 font-bold uppercase block">Distance Escaped</span>
            <span className="text-lg font-black font-mono text-white">
              {Math.floor(distance)} m
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl bg-nvidia hover:bg-[#86d400] text-black font-black text-base uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_0_20px_rgba(118,185,0,0.5)] flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Play Again
          </button>

          <button
            onClick={onExportGLB}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Download 3D Jensen Model (.GLB)
          </button>
        </div>
      </div>
    </div>
  );
};

