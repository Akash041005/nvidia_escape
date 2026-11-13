"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr: false since Three.js requires browser window & WebGL context
const GameCanvas = dynamic(() => import("../components/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-4">
      <div className="w-12 h-12 border-4 border-neutral-800 border-t-[#76b900] rounded-full animate-spin" />
      <span className="text-sm font-mono tracking-widest text-[#76b900] uppercase font-bold">
        Initializing 3D Silicon Valley Engine...
      </span>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black select-none">
      <GameCanvas />
    </main>
  );
}
