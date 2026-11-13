"use client";

import React, { useMemo } from "react";
import { Volume2, VolumeX, Shield, Rocket, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface HUDProps {
  stockPrice: number;
  stockHistory: number[];
  distance: number;
  wafers: number;
  activePowerup: {
    type: "ROCKET" | "SHIELD" | null;
    timeLeft: number;
    maxTime: number;
  };
  isMuted: boolean;
  onToggleMute: () => void;
  stumbleAlert: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stockPrice,
  stockHistory,
  distance,
  wafers,
  activePowerup,
  isMuted,
  onToggleMute,
  stumbleAlert,
}) => {
  const isRising = stockPrice >= (stockHistory[stockHistory.length - 2] || 100);

  // SVG path for mini stock chart
  const chartPath = useMemo(() => {
    if (stockHistory.length < 2) return "";
    const min = Math.min(...stockHistory, 50);
    const max = Math.max(...stockHistory, 150);
    const range = Math.max(max - min, 1);
    const width = 140;
    const height = 45;

    return stockHistory
      .slice(-20)
      .map((val, idx, arr) => {
        const x = (idx / (arr.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [stockHistory]);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4">
        {/* Left: Live Stock Ticker & Chart */}
        <div className="bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-3 flex flex-col gap-1 shadow-2xl pointer-events-auto min-w-[200px]">
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-400 font-semibold tracking-wider">
            <span className="flex items-center gap-1 text-nvidia">
              <span className="w-2 h-2 rounded-full bg-nvidia animate-ping inline-block" />
              NASDAQ: NVDA
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">LIVE TICKER</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono tracking-tight transition-colors duration-200 ${
                isRising ? "text-emerald-400 glow-green" : "text-rose-500"
              }`}
            >
              ${stockPrice.toFixed(2)}
            </span>
            <span
              className={`text-xs font-bold flex items-center ${
                isRising ? "text-emerald-400" : "text-rose-500"
              }`}
            >
              {isRising ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
              {((stockPrice - 100) / 100 * 100).toFixed(1)}%
            </span>
          </div>

          {/* Mini Real-Time SVG Chart */}
          <div className="w-[140px] h-[45px] overflow-hidden mt-1 border-t border-neutral-800/80 pt-1">
            <svg className="w-full h-full" viewBox="0 0 140 45">
              <path
                d={chartPath}
                fill="none"
                stroke={isRising ? "#76b900" : "#ef4444"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Center: Stumble / Hunter Warning Banner */}
        {stumbleAlert && (
          <div className="bg-rose-950/90 border-2 border-rose-500 text-rose-200 px-5 py-2 rounded-lg font-black text-sm uppercase tracking-widest animate-bounce shadow-2xl flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            CHINESE PM CLOSING IN! DODGE NOW!
          </div>
        )}

        {/* Right: Sound toggle & Wafers / Distance */}
        <div className="flex flex-col items-end gap-2">
          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="pointer-events-auto p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-800 text-neutral-300 hover:text-white hover:border-nvidia transition-all"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={20} className="text-rose-400" /> : <Volume2 size={20} className="text-nvidia" />}
          </button>

          {/* Stats pills */}
          <div className="bg-black/80 backdrop-blur-md border border-neutral-800 rounded-xl p-2.5 flex items-center gap-4 text-xs font-bold font-mono">
            <div className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-sm" />
              <span>{wafers} WAFERS</span>
            </div>
            <div className="w-[1px] h-4 bg-neutral-800" />
            <div className="text-neutral-300">
              <span className="text-nvidia font-black">{Math.floor(distance)}</span> M
            </div>
          </div>
        </div>
      </div>

      {/* Active Powerup Notification Bar (Bottom Center) */}
      {activePowerup.type && (
        <div className="self-center mb-6 pointer-events-auto max-w-sm w-full">
          <div
            className={`p-3 rounded-2xl backdrop-blur-lg border flex flex-col gap-1.5 shadow-2xl ${
              activePowerup.type === "ROCKET"
                ? "bg-cyan-950/80 border-cyan-400 box-glow-cyan text-cyan-200"
                : "bg-amber-950/80 border-amber-400 box-glow-gold text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-black tracking-wider uppercase">
              <div className="flex items-center gap-2">
                {activePowerup.type === "ROCKET" ? (
                  <>
                    <Rocket className="text-cyan-400 animate-spin" size={18} />
                    <span>ELON MUSK SPACEX FLIGHT</span>
                  </>
                ) : (
                  <>
                    <Shield className="text-amber-400 animate-pulse" size={18} />
                    <span>DONALD TRUMP TARIFF SHIELD</span>
                  </>
                )}
              </div>
              <span className="font-mono text-sm">{activePowerup.timeLeft.toFixed(1)}s</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  activePowerup.type === "ROCKET" ? "bg-cyan-400" : "bg-amber-400"
                }`}
                style={{
                  width: `${(activePowerup.timeLeft / activePowerup.maxTime) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls Hint (Bottom) */}
      <div className="md:hidden self-center pb-2 text-[11px] text-neutral-400 bg-black/60 px-3 py-1 rounded-full border border-neutral-800">
        Swipe Left / Right / Up / Down to control
      </div>
    </div>
  );
};

