"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { sound } from "../lib/audio";
import {
  createJensenMesh,
  createHunterMesh,
  createMediaVan,
  createBarrierObstacle,
  createSiliconWafer,
  createElonToken,
  createTrumpToken,
  createHighwaySegment,
  JensenCharacter,
  HunterCharacter,
} from "../lib/three-models";
import { HUD } from "./HUD";
import { StartScreen } from "./StartScreen";
import { GameOverScreen } from "./GameOverScreen";
import { exportJensenToGLB } from "../lib/glb-exporter";

const LANES = [2.5, 0, -2.5];
const BASE_SPEED = 20;
const MAX_SPEED = 38;
const JUMP_VELOCITY = 14;
const GRAVITY = -36;

interface ObstacleItem {
  group: THREE.Group;
  lane: number;
  z: number;
  type: "VAN" | "RAMP_VAN" | "LOW_BARRIER" | "HIGH_BARRIER";
  boundingBox: THREE.Box3;
  smashed?: boolean;
}

interface CollectibleItem {
  group: THREE.Group;
  lane: number;
  z: number;
  y: number;
  type: "WAFER" | "ELON" | "TRUMP";
  collected: boolean;
}

export default function GameCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  // React State for HUD & Overlays
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAMEOVER">("START");
  const [stockPrice, setStockPrice] = useState<number>(100);
  const [stockHistory, setStockHistory] = useState<number[]>([100]);
  const [distance, setDistance] = useState<number>(0);
  const [wafers, setWafers] = useState<number>(0);
  const [highStock, setHighStock] = useState<number>(100);
  const [highDistance, setHighDistance] = useState<number>(0);
  const [isNewATH, setIsNewATH] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [stumbleAlert, setStumbleAlert] = useState<boolean>(false);
  const [activePowerup, setActivePowerup] = useState<{
    type: "ROCKET" | "SHIELD" | null;
    timeLeft: number;
    maxTime: number;
  }>({ type: null, timeLeft: 0, maxTime: 0 });

  // Game Engine Mutable State Refs (for 60fps loop without React re-render lag)
  const engineRef = useRef({
    currentLane: 1, // 0 = -2.5, 1 = 0, 2 = 2.5
    targetX: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: BASE_SPEED,
    stock: 100,
    peakStock: 100,
    wafersCount: 0,
    distanceCount: 0,
    hunterOffsetZ: -8,
    hunterTargetOffsetZ: -8,
    isHunterClose: false,
    hunterCloseTimer: 0,
    rocketTimer: 0,
    shieldTimer: 0,
    runningSurfaceY: 0,
    nextSpawnZ: 40,
    isGameOver: false,
    isPlaying: false,
  });

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    jensen: JensenCharacter;
    hunter: HunterCharacter;
    highwaySegments: THREE.Group[];
    obstacles: ObstacleItem[];
    collectibles: CollectibleItem[];
    clock: THREE.Clock;
    particleSystem: THREE.Points;
  } | null>(null);

  // Load localStorage records
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStock = localStorage.getItem("NVDA_HIGH_STOCK");
      const savedDist = localStorage.getItem("NVDA_HIGH_DIST");
      if (savedStock) setHighStock(parseFloat(savedStock));
      if (savedDist) setHighDistance(parseFloat(savedDist));
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040806);
    scene.fog = new THREE.FogExp2(0x040806, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 300);
    camera.position.set(0, 4.5, -7.5);
    camera.lookAt(0, 1.8, 12);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xaaffaa, 1.4);
    dirLight.position.set(10, 25, -10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Neon Cyber accent lights
    const greenLight = new THREE.PointLight(0x76b900, 2.5, 40);
    greenLight.position.set(0, 6, 10);
    scene.add(greenLight);

    // 5. Create Characters
    const jensen = createJensenMesh();
    scene.add(jensen.group);

    const hunter = createHunterMesh();
    scene.add(hunter.group);

    // 6. Highway looping segments
    const highwaySegments: THREE.Group[] = [];
    for (let i = 0; i < 5; i++) {
      const seg = createHighwaySegment();
      seg.position.z = i * 40;
      scene.add(seg);
      highwaySegments.push(seg);
    }

    // 7. Ambient Cyber Dust Particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 40;
      posArray[i + 1] = Math.random() * 15;
      posArray[i + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x76b900,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const clock = new THREE.Clock();

    threeRef.current = {
      scene,
      camera,
      renderer,
      jensen,
      hunter,
      highwaySegments,
      obstacles: [],
      collectibles: [],
      clock,
      particleSystem,
    };

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !threeRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      const engine = engineRef.current;
      const t = threeRef.current;
      if (!t) return;

      if (engine.isPlaying && !engine.isGameOver) {
        // ----------------------------------------------------
        // Forward Movement & Speed Scaling
        // ----------------------------------------------------
        engine.speed = Math.min(MAX_SPEED, BASE_SPEED + (engine.distanceCount / 300) * 1.5);
        const forwardStep = engine.speed * delta;
        engine.posZ += forwardStep;
        engine.distanceCount += forwardStep;

        // Progressive stock bonus from running distance
        engine.stock += (forwardStep / 10) * 0.08;
        if (engine.stock > engine.peakStock) {
          engine.peakStock = engine.stock;
        }

        // ----------------------------------------------------
        // Horizontal Movement (Smooth Lane Lerp)
        // ----------------------------------------------------
        engine.targetX = LANES[engine.currentLane];
        engine.posX += (engine.targetX - engine.posX) * 0.22;

        // ----------------------------------------------------
        // Powerups Timers
        // ----------------------------------------------------
        if (engine.rocketTimer > 0) {
          engine.rocketTimer -= delta;
          if (engine.rocketTimer <= 0) engine.rocketTimer = 0;
        }
        if (engine.shieldTimer > 0) {
          engine.shieldTimer -= delta;
          if (engine.shieldTimer <= 0) engine.shieldTimer = 0;
        }

        const hasRocket = engine.rocketTimer > 0;
        const hasShield = engine.shieldTimer > 0;

        // ----------------------------------------------------
        // Jump & Slide Physics
        // ----------------------------------------------------
        if (hasRocket) {
          // Flight altitude
          engine.posY += (5.2 - engine.posY) * 0.15;
          engine.velocityY = 0;
          engine.isJumping = false;
          engine.isSliding = false;
        } else {
          // Jump gravity
          if (engine.isJumping) {
            engine.velocityY += GRAVITY * delta;
            engine.posY += engine.velocityY * delta;

            if (engine.posY <= engine.runningSurfaceY) {
              engine.posY = engine.runningSurfaceY;
              engine.velocityY = 0;
              engine.isJumping = false;
            }
          } else {
            // Check surface elevation
            if (engine.posY > engine.runningSurfaceY) {
              engine.velocityY += GRAVITY * delta;
              engine.posY += engine.velocityY * delta;
              if (engine.posY <= engine.runningSurfaceY) {
                engine.posY = engine.runningSurfaceY;
                engine.velocityY = 0;
              }
            } else {
              engine.posY = engine.runningSurfaceY;
            }
          }

          // Slide duration
          if (engine.isSliding) {
            engine.slideTimer -= delta;
            if (engine.slideTimer <= 0) {
              engine.isSliding = false;
            }
          }
        }

        // ----------------------------------------------------
        // Hunter Chase Mechanics
        // ----------------------------------------------------
        if (engine.isHunterClose) {
          engine.hunterCloseTimer -= delta;
          engine.hunterTargetOffsetZ = -3.2; // Right on Jensen's heels!
          if (engine.hunterCloseTimer <= 0) {
            engine.isHunterClose = false;
            setStumbleAlert(false);
          }
        } else {
          engine.hunterTargetOffsetZ = -8.5; // Normal chasing distance
        }
        engine.hunterOffsetZ += (engine.hunterTargetOffsetZ - engine.hunterOffsetZ) * 0.08;

        // ----------------------------------------------------
        // Update Character Positions & Animations
        // ----------------------------------------------------
        t.jensen.group.position.set(engine.posX, engine.posY, engine.posZ);
        // Bank into lane change turn
        const laneChangeRoll = (engine.targetX - engine.posX) * 0.12;
        t.jensen.group.rotation.z = laneChangeRoll;

        t.jensen.updateAnimation(time, engine.speed, engine.isJumping, engine.isSliding, hasRocket, hasShield);

        // Hunter chasing behind
        t.hunter.group.position.set(
          engine.posX * 0.85, // follows player's lane smoothly
          0,
          engine.posZ + engine.hunterOffsetZ
        );
        t.hunter.updateAnimation(time, engine.speed * 1.05);

        // ----------------------------------------------------
        // Camera Follow (Subway Surfers Chase Perspective)
        // ----------------------------------------------------
        const targetCamX = engine.posX * 0.4;
        const targetCamY = 4.2 + (hasRocket ? 2.5 : engine.posY * 0.4);
        const targetCamZ = engine.posZ - 7.5;

        t.camera.position.x += (targetCamX - t.camera.position.x) * 0.15;
        t.camera.position.y += (targetCamY - t.camera.position.y) * 0.15;
        t.camera.position.z = targetCamZ;
        t.camera.lookAt(engine.posX * 0.3, 1.8 + (hasRocket ? 1.5 : 0), engine.posZ + 14);

        // Move light & dust along with player
        greenLight.position.set(engine.posX, 6, engine.posZ + 10);
        t.particleSystem.position.z = engine.posZ;

        // ----------------------------------------------------
        // Highway Segments Looping
        // ----------------------------------------------------
        t.highwaySegments.forEach((seg) => {
          if (seg.position.z < engine.posZ - 40) {
            seg.position.z += 5 * 40;
          }
        });

        // ----------------------------------------------------
        // Procedural Wave Spawning Ahead
        // ----------------------------------------------------
        if (engine.posZ + 120 > engine.nextSpawnZ) {
          spawnWave(engine.nextSpawnZ);
          engine.nextSpawnZ += 28 + Math.random() * 12;
        }

        // ----------------------------------------------------
        // Collisions & Obstacles Check
        // ----------------------------------------------------
        let onRoof = false;
        const playerBox = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(engine.posX, engine.posY + (engine.isSliding ? 0.35 : 0.9), engine.posZ),
          new THREE.Vector3(0.7, engine.isSliding ? 0.6 : 1.7, 0.7)
        );

        for (let i = t.obstacles.length - 1; i >= 0; i--) {
          const obs = t.obstacles[i];

          // Recycle passed obstacles
          if (obs.z < engine.posZ - 20) {
            t.scene.remove(obs.group);
            t.obstacles.splice(i, 1);
            continue;
          }

          if (obs.smashed) continue;

          // Check if obstacle is close in Z
          const dz = Math.abs(obs.z - engine.posZ);
          const dx = Math.abs(LANES[obs.lane] - engine.posX);

          if (dz < 3.2 && dx < 1.2) {
            // Trump Shield destroys obstacles!
            if (hasShield) {
              obs.smashed = true;
              t.scene.remove(obs.group);
              sound.playShieldBlast();
              engine.stock += 5.0;
              continue;
            }

            // Rocket flies safely above everything
            if (hasRocket) {
              continue;
            }

            // Ramp Van Roof-Running Check
            if (obs.type === "RAMP_VAN" || obs.type === "VAN") {
              // If player is falling from above or jumped onto ramp
              if (engine.posY >= 1.9 && dz < 2.8) {
                onRoof = true;
                engine.runningSurfaceY = 2.4;
              } else {
                // Direct head-on van impact!
                triggerGameOver("Head-on collision with Broadcast News Van! Live reporters mobbed Jensen!");
                return;
              }
            } else if (obs.type === "LOW_BARRIER") {
              // Must jump over (player.posY > 0.8)
              if (engine.posY < 0.8) {
                handleObstacleHit("Tripped over Board Members' 'YOU'RE FIRED!' placard!");
              }
            } else if (obs.type === "HIGH_BARRIER") {
              // Must slide under (isSliding is true)
              if (!engine.isSliding) {
                handleObstacleHit("Slammed directly into Lori's $75 Billion divorce subpoena banner!");
              }
            }
          }
        }

        if (!onRoof && engine.runningSurfaceY > 0) {
          engine.runningSurfaceY = 0;
        }

        // ----------------------------------------------------
        // Collectibles (Silicon Wafers & Powerups)
        // ----------------------------------------------------
        for (let i = t.collectibles.length - 1; i >= 0; i--) {
          const col = t.collectibles[i];

          // Rotate wafers & tokens
          col.group.rotation.y = time * 3;

          // Recycle
          if (col.z < engine.posZ - 10) {
            t.scene.remove(col.group);
            t.collectibles.splice(i, 1);
            continue;
          }

          if (!col.collected) {
            const dz = Math.abs(col.z - engine.posZ);
            const dx = Math.abs(LANES[col.lane] - engine.posX);
            const dy = Math.abs(col.y - engine.posY);

            // Pickup radius
            if (dz < 1.4 && dx < 1.1 && dy < 1.5) {
              col.collected = true;
              t.scene.remove(col.group);

              if (col.type === "WAFER") {
                sound.playWafer();
                engine.wafersCount++;
                engine.stock += 2.5;
                if (engine.stock > engine.peakStock) {
                  engine.peakStock = engine.stock;
                }
              } else if (col.type === "ELON") {
                sound.playPowerup();
                engine.rocketTimer = 8;
                setActivePowerup({ type: "ROCKET", timeLeft: 8, maxTime: 8 });
                // Spawn bonus wafer shower across all 3 lanes!
                spawnWaferFlightShower(engine.posZ + 8);
              } else if (col.type === "TRUMP") {
                sound.playPowerup();
                engine.shieldTimer = 10;
                setActivePowerup({ type: "SHIELD", timeLeft: 10, maxTime: 10 });
              }
            }
          }
        }

        // ----------------------------------------------------
        // Stock Delisting Check
        // ----------------------------------------------------
        if (engine.stock <= 0) {
          triggerGameOver("NVIDIA Stock crashed to $0.00! Delisted from NASDAQ under Chapter 11!");
          return;
        }

        // ----------------------------------------------------
        // Throttle React State Updates (~10Hz)
        // ----------------------------------------------------
        if (Math.floor(time * 10) % 2 === 0) {
          setStockPrice(engine.stock);
          setDistance(engine.distanceCount);
          setWafers(engine.wafersCount);
          setStockHistory((prev) => {
            const last = prev[prev.length - 1];
            if (Math.abs(last - engine.stock) > 0.4 || prev.length < 5) {
              return [...prev.slice(-30), engine.stock];
            }
            return prev;
          });

          // Update active powerup timer
          if (hasRocket) {
            setActivePowerup({ type: "ROCKET", timeLeft: engine.rocketTimer, maxTime: 8 });
          } else if (hasShield) {
            setActivePowerup({ type: "SHIELD", timeLeft: engine.shieldTimer, maxTime: 10 });
          } else {
            setActivePowerup({ type: null, timeLeft: 0, maxTime: 0 });
          }
        }
      } else if (!engine.isPlaying && !engine.isGameOver) {
        // Start screen idle preview: Jensen smoothly bobs & rotates in spotlight
        t.jensen.group.position.set(0, 0, 0);
        t.jensen.group.rotation.y = time * 0.8;
        t.jensen.updateAnimation(time, 10, false, false, false, false);
        t.camera.position.set(0, 1.8, -4.0);
        t.camera.lookAt(0, 1.2, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ----------------------------------------------------
  // Spawning Wave Generator (Subway Surfers algorithm)
  // ----------------------------------------------------
  const spawnWave = (z: number) => {
    const t = threeRef.current;
    if (!t) return;

    // Pick 1 or 2 lanes for obstacles, guarantee 1 free lane!
    const availableLanes = [0, 1, 2];
    const openLane = availableLanes.splice(Math.floor(Math.random() * 3), 1)[0];

    // Roll for powerup spawn in open lane
    const powerRoll = Math.random();
    if (powerRoll < 0.12) {
      // Elon Musk Token
      const elon = createElonToken();
      elon.position.set(LANES[openLane], 1.2, z);
      t.scene.add(elon);
      t.collectibles.push({
        group: elon,
        lane: openLane,
        z,
        y: 1.2,
        type: "ELON",
        collected: false,
      });
    } else if (powerRoll < 0.24) {
      // Trump Token
      const trump = createTrumpToken();
      trump.position.set(LANES[openLane], 1.2, z);
      t.scene.add(trump);
      t.collectibles.push({
        group: trump,
        lane: openLane,
        z,
        y: 1.2,
        type: "TRUMP",
        collected: false,
      });
    } else {
      // Silicon Wafer line in open lane
      for (let w = 0; w < 5; w++) {
        const wafer = createSiliconWafer();
        const wz = z - 6 + w * 3;
        wafer.position.set(LANES[openLane], 0.8, wz);
        t.scene.add(wafer);
        t.collectibles.push({
          group: wafer,
          lane: openLane,
          z: wz,
          y: 0.8,
          type: "WAFER",
          collected: false,
        });
      }
    }

    // Spawn obstacles in the remaining lanes
    availableLanes.forEach((lane) => {
      const obstacleRoll = Math.random();

      if (obstacleRoll < 0.45) {
        // Media Channel Van
        const channels: ("CNBC" | "BLOOMBERG" | "WSJ")[] = ["CNBC", "BLOOMBERG", "WSJ"];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const hasRamp = Math.random() < 0.4;
        const van = createMediaVan(channel, hasRamp);
        van.position.set(LANES[lane], 0, z);
        t.scene.add(van);

        t.obstacles.push({
          group: van,
          lane,
          z,
          type: hasRamp ? "RAMP_VAN" : "VAN",
          boundingBox: new THREE.Box3().setFromObject(van),
        });

        // If ramp van, place wafer line on roof!
        if (hasRamp) {
          for (let rw = 0; rw < 3; rw++) {
            const rWafer = createSiliconWafer();
            rWafer.position.set(LANES[lane], 2.8, z - 1 + rw * 1.5);
            t.scene.add(rWafer);
            t.collectibles.push({
              group: rWafer,
              lane,
              z: z - 1 + rw * 1.5,
              y: 2.8,
              type: "WAFER",
              collected: false,
            });
          }
        }
      } else if (obstacleRoll < 0.75) {
        // Low Barrier (Board members "YOU'RE FIRED!" or Girlfriends "WE WANT JUSTICE!")
        const isDivorce = Math.random() < 0.3;
        const barrier = createBarrierObstacle(isDivorce ? "GIRLFRIENDS_JUSTICE" : "BOARD_FIRED", false);
        barrier.position.set(LANES[lane], 0, z);
        t.scene.add(barrier);

        t.obstacles.push({
          group: barrier,
          lane,
          z,
          type: "LOW_BARRIER",
          boundingBox: new THREE.Box3().setFromObject(barrier),
        });

        // Wafer jump arc over low barrier
        for (let j = 0; j < 3; j++) {
          const arcWafer = createSiliconWafer();
          const ay = j === 1 ? 2.2 : 1.4;
          arcWafer.position.set(LANES[lane], ay, z - 2 + j * 2);
          t.scene.add(arcWafer);
          t.collectibles.push({
            group: arcWafer,
            lane,
            z: z - 2 + j * 2,
            y: ay,
            type: "WAFER",
            collected: false,
          });
        }
      } else {
        // High Barrier (Lori "I WANT DIVORCE - $75 BILLION" banner) -> Slide under!
        const banner = createBarrierObstacle("WIFE_DIVORCE", true);
        banner.position.set(LANES[lane], 0, z);
        t.scene.add(banner);

        t.obstacles.push({
          group: banner,
          lane,
          z,
          type: "HIGH_BARRIER",
          boundingBox: new THREE.Box3().setFromObject(banner),
        });
      }
    });
  };

  // Dense Wafer shower during Elon SpaceX Flight
  const spawnWaferFlightShower = (startZ: number) => {
    const t = threeRef.current;
    if (!t) return;
    for (let i = 0; i < 20; i++) {
      const lane = i % 3;
      const wz = startZ + i * 4;
      const wafer = createSiliconWafer();
      wafer.position.set(LANES[lane], 5.2, wz);
      t.scene.add(wafer);
      t.collectibles.push({
        group: wafer,
        lane,
        z: wz,
        y: 5.2,
        type: "WAFER",
        collected: false,
      });
    }
  };

  // Minor stumble vs Hunter catch
  const handleObstacleHit = (hitMessage: string) => {
    const engine = engineRef.current;
    sound.playStumble();
    engine.stock = Math.max(0, engine.stock - 15.0);

    if (engine.isHunterClose) {
      // Second stumble caught by Hunter!
      triggerGameOver(`Tackled by Chinese PM after: ${hitMessage}`);
    } else {
      // First stumble: Hunter closes in!
      engine.isHunterClose = true;
      engine.hunterCloseTimer = 5.0; // 5 seconds to escape cleanly
      setStumbleAlert(true);
    }
  };

  const triggerGameOver = (reason: string) => {
    const engine = engineRef.current;
    engine.isGameOver = true;
    engine.isPlaying = false;
    sound.stopBGM();
    sound.playCrash();

    const isAth = engine.peakStock > highStock;
    if (isAth) {
      setHighStock(engine.peakStock);
      localStorage.setItem("NVDA_HIGH_STOCK", engine.peakStock.toString());
      setIsNewATH(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else {
      setIsNewATH(false);
    }

    if (engine.distanceCount > highDistance) {
      setHighDistance(engine.distanceCount);
      localStorage.setItem("NVDA_HIGH_DIST", engine.distanceCount.toString());
    }

    setGameOverReason(reason);
    setGameState("GAMEOVER");
  };

  // ----------------------------------------------------
  // Player Controls (Keyboard & Swipes)
  // ----------------------------------------------------
  const moveLeft = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.isPlaying || engine.isGameOver) return;
    if (engine.currentLane > 0) {
      engine.currentLane--;
    }
  }, []);

  const moveRight = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.isPlaying || engine.isGameOver) return;
    if (engine.currentLane < 2) {
      engine.currentLane++;
    }
  }, []);

  const jump = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.isPlaying || engine.isGameOver) return;
    if (!engine.isJumping && engine.posY <= engine.runningSurfaceY + 0.1) {
      engine.isJumping = true;
      engine.velocityY = JUMP_VELOCITY;
      sound.playJump();
    }
  }, []);

  const slide = useCallback(() => {
    const engine = engineRef.current;
    if (!engine.isPlaying || engine.isGameOver) return;
    if (!engine.isSliding) {
      engine.isSliding = true;
      engine.slideTimer = 0.68;
      // If sliding mid-air, slam down to ground quickly
      if (engine.isJumping) {
        engine.velocityY = -24;
      }
      sound.playSlide();
    }
  }, []);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        moveLeft();
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        moveRight();
      } else if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") {
        e.preventDefault();
        jump();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, moveLeft, moveRight, jump, slide]);

  // Touch Swipe Listener
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 35) moveRight();
      else if (dx < -35) moveLeft();
    } else {
      if (dy < -35) jump();
      else if (dy > 35) slide();
    }
  };

  // Start / Restart Actions
  const startGame = () => {
    const engine = engineRef.current;
    const t = threeRef.current;
    if (!t) return;

    // Reset clean state
    engine.currentLane = 1;
    engine.targetX = 0;
    engine.posX = 0;
    engine.posY = 0;
    engine.posZ = 0;
    engine.velocityY = 0;
    engine.isJumping = false;
    engine.isSliding = false;
    engine.speed = BASE_SPEED;
    engine.stock = 100;
    engine.peakStock = 100;
    engine.wafersCount = 0;
    engine.distanceCount = 0;
    engine.hunterOffsetZ = -8;
    engine.hunterTargetOffsetZ = -8;
    engine.isHunterClose = false;
    engine.rocketTimer = 0;
    engine.shieldTimer = 0;
    engine.nextSpawnZ = 35;
    engine.isGameOver = false;
    engine.isPlaying = true;

    // Clear old obstacles & collectibles
    t.obstacles.forEach((o) => t.scene.remove(o.group));
    t.obstacles = [];
    t.collectibles.forEach((c) => t.scene.remove(c.group));
    t.collectibles = [];

    // Reset character positions
    t.jensen.group.position.set(0, 0, 0);
    t.hunter.group.position.set(0, 0, -8);

    setStockPrice(100);
    setStockHistory([100]);
    setDistance(0);
    setWafers(0);
    setStumbleAlert(false);
    setActivePowerup({ type: null, timeLeft: 0, maxTime: 0 });
    setGameState("PLAYING");

    sound.startBGM();
  };

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Retro Scanline Overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Screen States */}
      {gameState === "START" && (
        <StartScreen
          onStart={startGame}
          highStock={highStock}
          highDistance={highDistance}
          onExportGLB={() => exportJensenToGLB()}
        />
      )}

      {gameState === "PLAYING" && (
        <>
          <HUD
            stockPrice={stockPrice}
            stockHistory={stockHistory}
            distance={distance}
            wafers={wafers}
            activePowerup={activePowerup}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            stumbleAlert={stumbleAlert}
          />

          {/* On-Screen Mobile Action Buttons */}
          <div className="md:hidden absolute bottom-6 inset-x-6 flex justify-between pointer-events-none z-10">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={moveLeft}
                className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-white font-black text-xl flex items-center justify-center active:bg-neutral-800"
              >
                ◀
              </button>
              <button
                onClick={moveRight}
                className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-white font-black text-xl flex items-center justify-center active:bg-neutral-800"
              >
                ▶
              </button>
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={slide}
                className="w-14 h-14 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-nvidia font-black text-xs flex items-center justify-center active:bg-neutral-800 uppercase"
              >
                Slide
              </button>
              <button
                onClick={jump}
                className="w-14 h-14 rounded-2xl bg-nvidia/90 text-black font-black text-xs flex items-center justify-center active:bg-nvidia uppercase shadow-lg"
              >
                Jump
              </button>
            </div>
          </div>
        </>
      )}

      {gameState === "GAMEOVER" && (
        <GameOverScreen
          reason={gameOverReason}
          finalStock={stockPrice}
          peakStock={engineRef.current.peakStock}
          distance={distance}
          wafers={wafers}
          isNewATH={isNewATH}
          onRestart={startGame}
          onExportGLB={() => exportJensenToGLB()}
        />
      )}
    </div>
  );
}
