import * as THREE from "three";

// Helper to create dynamic HTML5 Canvas textures
export function createCanvasTexture(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width = 512,
  height = 512
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ---------------------------------------------------------------------
// 1. CHIBI JENSEN HUANG
// ---------------------------------------------------------------------
export interface JensenCharacter {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  rocket: THREE.Group;
  shield: THREE.Group;
  updateAnimation: (time: number, speed: number, isJumping: boolean, isSliding: boolean, hasRocket: boolean, hasShield: boolean) => void;
}

export function createJensenMesh(): JensenCharacter {
  const group = new THREE.Group();

  // Root pivot
  const root = new THREE.Group();
  group.add(root);

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffdfc4,
    roughness: 0.5,
  });

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.3,
    metalness: 0.2,
  });

  const zipperMat = new THREE.MeshStandardMaterial({
    color: 0xd0d0d0,
    metalness: 0.8,
    roughness: 0.2,
  });

  const denimMat = new THREE.MeshStandardMaterial({
    color: 0x181820,
    roughness: 0.7,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  });

  const whiteHairMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.4,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.4,
    transmission: 0.8,
    roughness: 0.1,
  });

  // --- Torso (Iconic Biker Leather Jacket) ---
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.7, 16);
  const torso = new THREE.Mesh(torsoGeo, leatherMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  root.add(torso);

  // Jacket Zipper line & silver snap buttons
  const zipperGeo = new THREE.BoxGeometry(0.04, 0.68, 0.08);
  const zipper = new THREE.Mesh(zipperGeo, zipperMat);
  zipper.position.set(0, 0, 0.36);
  torso.add(zipper);

  // Leather collar lapels
  const lapelGeo = new THREE.ConeGeometry(0.2, 0.25, 4);
  const lapelLeft = new THREE.Mesh(lapelGeo, leatherMat);
  lapelLeft.rotation.set(0.3, 0, -0.6);
  lapelLeft.position.set(-0.2, 0.3, 0.25);
  torso.add(lapelLeft);

  const lapelRight = new THREE.Mesh(lapelGeo, leatherMat);
  lapelRight.rotation.set(0.3, 0, 0.6);
  lapelRight.position.set(0.2, 0.3, 0.25);
  torso.add(lapelRight);

  // --- Chibi Head ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.6, 0);
  root.add(headGroup);

  // Head base sphere
  const headGeo = new THREE.SphereGeometry(0.48, 24, 24);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Jensen's Face Texture on front of head
  const faceTexture = createCanvasTexture((ctx, w, h) => {
    // Transparent base
    ctx.clearRect(0, 0, w, h);

    // Chibi stylized eyes
    ctx.fillStyle = "#111111";
    // Left eye
    ctx.beginPath();
    ctx.arc(w * 0.35, h * 0.48, 22, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w * 0.37, h * 0.44, 8, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(w * 0.65, h * 0.48, 22, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w * 0.67, h * 0.44, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    // Left brow (confident tilt)
    ctx.beginPath();
    ctx.moveTo(w * 0.26, h * 0.38);
    ctx.quadraticCurveTo(w * 0.36, h * 0.34, w * 0.44, h * 0.38);
    ctx.stroke();

    // Right brow
    ctx.beginPath();
    ctx.moveTo(w * 0.56, h * 0.38);
    ctx.quadraticCurveTo(w * 0.64, h * 0.34, w * 0.74, h * 0.38);
    ctx.stroke();

    // Jensen signature charismatic smirk
    ctx.strokeStyle = "#994433";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(w * 0.42, h * 0.68);
    ctx.quadraticCurveTo(w * 0.5, h * 0.76, w * 0.62, h * 0.66);
    ctx.stroke();
  });

  const facePlaneGeo = new THREE.PlaneGeometry(0.68, 0.68);
  const facePlaneMat = new THREE.MeshBasicMaterial({
    map: faceTexture,
    transparent: true,
    depthWrite: false,
  });
  const facePlane = new THREE.Mesh(facePlaneGeo, facePlaneMat);
  facePlane.position.set(0, 0, 0.46);
  headGroup.add(facePlane);

  // Iconic Glasses (Black rim rectangular frames + bridge + temples)
  const glassesGroup = new THREE.Group();
  glassesGroup.position.set(0, 0.04, 0.47);

  const rimGeo = new THREE.BoxGeometry(0.24, 0.16, 0.04);
  const leftRim = new THREE.Mesh(rimGeo, glassMat);
  leftRim.position.set(-0.16, 0, 0);
  glassesGroup.add(leftRim);

  const rightRim = new THREE.Mesh(rimGeo, glassMat);
  rightRim.position.set(0.16, 0, 0);
  glassesGroup.add(rightRim);

  const bridgeGeo = new THREE.BoxGeometry(0.1, 0.04, 0.04);
  const bridge = new THREE.Mesh(bridgeGeo, glassMat);
  bridge.position.set(0, 0.03, 0);
  glassesGroup.add(bridge);

  // Lenses with faint blue reflection
  const lensGeo = new THREE.PlaneGeometry(0.2, 0.12);
  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(-0.16, 0, 0.025);
  glassesGroup.add(leftLens);
  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(0.16, 0, 0.025);
  glassesGroup.add(rightLens);

  headGroup.add(glassesGroup);

  // Stylized White/Silver Hair (Quiff and spikes)
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 0.25, -0.05);

  const mainHair = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), whiteHairMat);
  mainHair.scale.set(1.05, 0.7, 1.1);
  hairGroup.add(mainHair);

  // Stylish side swept bangs & quiff spikes
  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.35, 5), whiteHairMat);
    const angle = (i - 3) * 0.35;
    spike.position.set(Math.sin(angle) * 0.36, 0.25, Math.cos(angle) * 0.3 + 0.1);
    spike.rotation.set(-0.4, 0, -angle * 0.7);
    hairGroup.add(spike);
  }
  headGroup.add(hairGroup);

  // --- Arms (Left & Right) ---
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.48, 1.25, 0);
  const armGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.5, 12);
  const leftArmMesh = new THREE.Mesh(armGeo, leatherMat);
  leftArmMesh.position.y = -0.22;
  leftArm.add(leftArmMesh);
  // Hand
  const handGeo = new THREE.SphereGeometry(0.1, 10, 10);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.48;
  leftArm.add(leftHand);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.48, 1.25, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, leatherMat);
  rightArmMesh.position.y = -0.22;
  rightArm.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.48;
  rightArm.add(rightHand);
  root.add(rightArm);

  // --- Legs (Left & Right) ---
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 0.65, 0);
  const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 12);
  const leftLegMesh = new THREE.Mesh(legGeo, denimMat);
  leftLegMesh.position.y = -0.25;
  leftLeg.add(leftLegMesh);
  // Shoe (Sneaker)
  const shoeGeo = new THREE.BoxGeometry(0.16, 0.12, 0.28);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.52, 0.06);
  leftLeg.add(leftShoe);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 0.65, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, denimMat);
  rightLegMesh.position.y = -0.25;
  rightLeg.add(rightLegMesh);
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.52, 0.06);
  rightLeg.add(rightShoe);
  root.add(rightLeg);

  // --- Elon's SpaceX Rocket Booster Attachment (Attached to Jensen's back) ---
  const rocket = new THREE.Group();
  rocket.position.set(0, 0.95, -0.45);
  rocket.visible = false;

  const rocketBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.2 })
  );
  rocket.add(rocketBody);

  const rocketNose = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5, roughness: 0.3 })
  );
  rocketNose.position.y = 0.55;
  rocket.add(rocketNose);

  // SpaceX Logo strip on booster
  const spaceXTex = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#005288";
    ctx.font = "bold 70px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SpaceX", w / 2, h / 2);
  });
  const spaceXDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.6),
    new THREE.MeshBasicMaterial({ map: spaceXTex })
  );
  spaceXDecal.position.set(0, 0, -0.19);
  spaceXDecal.rotation.y = Math.PI;
  rocket.add(spaceXDecal);

  // Flame exhaust mesh
  const flameGeo = new THREE.ConeGeometry(0.16, 0.6, 8);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600, wireframe: false });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.y = -0.65;
  flameMesh.rotation.x = Math.PI;
  rocket.add(flameMesh);

  root.add(rocket);

  // --- Trump Tariff Shield Aura ---
  const shield = new THREE.Group();
  shield.position.set(0, 1.1, 0);
  shield.visible = false;

  const shieldSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.35,
      metalness: 0.8,
      roughness: 0.1,
      wireframe: false,
    })
  );
  shield.add(shieldSphere);

  const shieldWire = new THREE.Mesh(
    new THREE.SphereGeometry(1.42, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffea00,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    })
  );
  shield.add(shieldWire);

  // Floating "FAKE NEWS! PROTECTED!" 3D ribbon banner
  const shieldBannerTex = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "rgba(220, 20, 60, 0.85)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★ FAKE NEWS! PROTECTED! ★", w / 2, h / 2);
  }, 512, 128);

  const bannerGeo = new THREE.PlaneGeometry(2.4, 0.6);
  const bannerMat = new THREE.MeshBasicMaterial({
    map: shieldBannerTex,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 1.4, 0);
  shield.add(banner);

  root.add(shield);

  // --- Animation Loop Updater ---
  const updateAnimation = (
    time: number,
    speed: number,
    isJumping: boolean,
    isSliding: boolean,
    hasRocket: boolean,
    hasShield: boolean
  ) => {
    rocket.visible = hasRocket;
    shield.visible = hasShield;

    if (hasShield) {
      shield.rotation.y = time * 2;
      shieldWire.rotation.x = time * 1.5;
    }

    if (hasRocket) {
      // Rocket flight animation: limbs trailing behind smoothly
      flameMesh.scale.y = 1 + Math.sin(time * 30) * 0.4;
      leftArm.rotation.x = 2.8;
      rightArm.rotation.x = 2.8;
      leftLeg.rotation.x = 0.2;
      rightLeg.rotation.x = -0.2;
      root.rotation.x = -0.4; // Lean forward into flight
      headGroup.rotation.x = 0.3;
      return;
    }

    root.rotation.x = 0;

    if (isSliding) {
      // Crouched sliding pose
      root.scale.set(1, 0.45, 1);
      leftLeg.rotation.x = -1.2;
      rightLeg.rotation.x = -1.2;
      leftArm.rotation.x = -1.0;
      rightArm.rotation.x = -1.0;
      return;
    }

    root.scale.set(1, 1, 1);

    if (isJumping) {
      // Airborne dynamic leap pose
      leftLeg.rotation.x = -0.7;
      rightLeg.rotation.x = 0.6;
      leftArm.rotation.x = -1.4;
      rightArm.rotation.x = 1.2;
      headGroup.rotation.x = -0.15;
      return;
    }

    // Normal running sprint cycle
    const runFreq = speed * 0.75;
    const swingAngle = Math.sin(time * runFreq);

    leftLeg.rotation.x = swingAngle * 0.85;
    rightLeg.rotation.x = -swingAngle * 0.85;

    leftArm.rotation.x = -swingAngle * 0.95;
    rightArm.rotation.x = swingAngle * 0.95;

    // Subtle head & torso bob
    headGroup.position.y = 1.6 + Math.abs(Math.sin(time * runFreq * 2)) * 0.08;
    torso.rotation.y = swingAngle * 0.12;
  };

  return {
    group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    head: headGroup,
    torso,
    rocket,
    shield,
    updateAnimation,
  };
}

// ---------------------------------------------------------------------
// 2. CHIBI HUNTER (CHINESE PM CHASER)
// ---------------------------------------------------------------------
export interface HunterCharacter {
  group: THREE.Group;
  updateAnimation: (time: number, speed: number) => void;
}

export function createHunterMesh(): HunterCharacter {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  const suitMat = new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.5 });
  const tieMat = new THREE.MeshStandardMaterial({ color: 0xd61f26, roughness: 0.3 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf6d5b8, roughness: 0.5 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.75, 16), suitMat);
  torso.position.y = 0.95;
  root.add(torso);

  // Red Tie
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.04), tieMat);
  tie.position.set(0, 0.05, 0.36);
  torso.add(tie);

  // Collar shirt
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.05), shirtMat);
  collar.position.set(0, 0.28, 0.34);
  torso.add(collar);

  // Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.6, 0);
  root.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 24), skinMat);
  headGroup.add(headMesh);

  // Hunter Face Texture
  const faceTex = createCanvasTexture((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0a0a";
    // Determined chasing eyes
    ctx.beginPath();
    ctx.arc(w * 0.35, h * 0.48, 16, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h * 0.48, 16, 0, Math.PI * 2);
    ctx.fill();

    // Intense eyebrows
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.36);
    ctx.lineTo(w * 0.44, h * 0.42);
    ctx.moveTo(w * 0.76, h * 0.36);
    ctx.lineTo(w * 0.56, h * 0.42);
    ctx.stroke();

    // Chasing shout mouth
    ctx.fillStyle = "#881111";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.7, 24, 0, Math.PI);
    ctx.fill();
  });

  const facePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.65, 0.65),
    new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })
  );
  facePlane.position.set(0, 0, 0.45);
  headGroup.add(facePlane);

  // Sleek black hair
  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), hairMat);
  hairMesh.scale.set(1.05, 0.7, 1.05);
  hairMesh.position.set(0, 0.22, -0.05);
  headGroup.add(hairMesh);

  // Arms outstretched in grab / chase pose
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.45, 1.25, 0);
  const armMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 12), suitMat);
  armMesh.position.y = -0.22;
  leftArm.add(armMesh);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.45, 1.25, 0);
  const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 12), suitMat);
  rightArmMesh.position.y = -0.22;
  rightArm.add(rightArmMesh);
  root.add(rightArm);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.18, 0.65, 0);
  const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 12), suitMat);
  legMesh.position.y = -0.25;
  leftLeg.add(legMesh);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.18, 0.65, 0);
  const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 12), suitMat);
  rightLegMesh.position.y = -0.25;
  rightLeg.add(rightLegMesh);
  root.add(rightLeg);

  const updateAnimation = (time: number, speed: number) => {
    const runFreq = speed * 0.8;
    const swing = Math.sin(time * runFreq);

    leftLeg.rotation.x = swing * 0.8;
    rightLeg.rotation.x = -swing * 0.8;

    // Both arms reaching forward to grab Jensen!
    leftArm.rotation.x = 1.4 + swing * 0.4;
    rightArm.rotation.x = 1.4 - swing * 0.4;

    headGroup.position.y = 1.6 + Math.abs(Math.sin(time * runFreq * 2)) * 0.07;
  };

  return {
    group,
    updateAnimation,
  };
}

// ---------------------------------------------------------------------
// 3. MEDIA BROADCAST NEWS VANS (TRAIN EQUIVALENTS)
// ---------------------------------------------------------------------
export type VanChannel = "CNBC" | "BLOOMBERG" | "WSJ";

export function createMediaVan(channel: VanChannel, hasRamp: boolean = false): THREE.Group {
  const van = new THREE.Group();

  let primaryColor = 0x0088cc;
  let tickerBg = "#002b49";
  let tickerHeadline = "CNBC BREAKING: NVIDIA DOWN? JENSEN SELLS?";
  if (channel === "BLOOMBERG") {
    primaryColor = 0xe65100;
    tickerBg = "#3e1700";
    tickerHeadline = "BLOOMBERG LIVE: SILICON VALLEY MELTDOWN!";
  } else if (channel === "WSJ") {
    primaryColor = 0x222222;
    tickerBg = "#111111";
    tickerHeadline = "WSJ EXCLUSIVE: THE CRASH OF THE CENTURY";
  }

  const vanMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    metalness: 0.3,
    roughness: 0.4,
  });

  const bodyGeo = new THREE.BoxGeometry(2.0, 2.2, 5.8);
  const bodyMesh = new THREE.Mesh(bodyGeo, vanMat);
  bodyMesh.position.y = 1.4;
  bodyMesh.castShadow = true;
  van.add(bodyMesh);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const wheelPositions = [
    [-1.02, 0.45, 1.8],
    [1.02, 0.45, 1.8],
    [-1.02, 0.45, -1.8],
    [1.02, 0.45, -1.8],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    van.add(wheel);
  });

  // Front Windshield
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.2, metalness: 0.8 });
  const windshield = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), glassMat);
  windshield.position.set(0, 1.8, 2.91);
  van.add(windshield);

  // Side News Ticker Screens
  const tickerTexture = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = tickerBg;
    ctx.fillRect(0, 0, w, h);

    // Red LIVE badge
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(10, 15, 120, h - 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("LIVE", 28, h / 2 + 15);

    // Yellow scrolling headline
    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 42px monospace";
    ctx.fillText(tickerHeadline, 150, h / 2 + 15);
  }, 1024, 128);

  const screenGeo = new THREE.PlaneGeometry(5.2, 0.8);
  const screenMat = new THREE.MeshBasicMaterial({ map: tickerTexture });

  // Left side screen
  const leftScreen = new THREE.Mesh(screenGeo, screenMat);
  leftScreen.position.set(-1.01, 1.5, 0);
  leftScreen.rotation.y = -Math.PI / 2;
  van.add(leftScreen);

  // Right side screen
  const rightScreen = new THREE.Mesh(screenGeo, screenMat);
  rightScreen.position.set(1.01, 1.5, 0);
  rightScreen.rotation.y = Math.PI / 2;
  van.add(rightScreen);

  // Satellite dish on roof
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.7 });
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), dishMat);
  dish.rotation.x = -Math.PI * 0.7;
  dish.position.set(0, 2.7, -1.2);
  van.add(dish);

  // Optional Ramp for roof-running
  if (hasRamp) {
    const rampMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5 });
    const rampGeo = new THREE.BoxGeometry(1.8, 0.2, 3.2);
    const ramp = new THREE.Mesh(rampGeo, rampMat);
    ramp.position.set(0, 1.3, 3.8);
    ramp.rotation.x = 0.38;
    van.add(ramp);
  }

  return van;
}

// ---------------------------------------------------------------------
// 4. PLACARD & BANNER OBSTACLES (BOARD MEMBERS, GIRLFRIENDS, WIFE)
// ---------------------------------------------------------------------
export type BarrierType = "BOARD_FIRED" | "GIRLFRIENDS_JUSTICE" | "WIFE_DIVORCE";

export function createBarrierObstacle(type: BarrierType, isElevatedSlide: boolean = false): THREE.Group {
  const barrier = new THREE.Group();

  let text = "YOU'RE FIRED!";
  let bannerBg = "#c62828";
  let charName = "Board Member";

  if (type === "GIRLFRIENDS_JUSTICE") {
    text = "WE WANT JUSTICE! 💔";
    bannerBg = "#ad1457";
    charName = "Affairs";
  } else if (type === "WIFE_DIVORCE") {
    text = "I WANT DIVORCE — $75 BILLION ⚖️";
    bannerBg = "#283593";
    charName = "Lori Huang";
  }

  // Chibi character holding the placard
  const chibiChar = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.5 });
  const clothesMat = new THREE.MeshStandardMaterial({
    color: type === "BOARD_FIRED" ? 0x263238 : type === "WIFE_DIVORCE" ? 0x4a148c : 0xd81b60,
    roughness: 0.5,
  });

  // Mini body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.65, 12), clothesMat);
  body.position.y = 0.65;
  chibiChar.add(body);

  // Mini head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
  head.position.y = 1.25;
  chibiChar.add(head);

  chibiChar.position.x = 0;
  barrier.add(chibiChar);

  // Placard Banner Texture
  const bannerTexture = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = bannerBg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);
  }, 768, 192);

  const bannerPlaneGeo = new THREE.PlaneGeometry(2.4, 0.85);
  const bannerMat = new THREE.MeshBasicMaterial({
    map: bannerTexture,
    side: THREE.DoubleSide,
  });
  const bannerMesh = new THREE.Mesh(bannerPlaneGeo, bannerMat);

  // Height determines whether player jumps over or slides under!
  // If isElevatedSlide is true: banner is at y=1.8 (head height, slide underneath!)
  // If false: banner is at y=0.55 (low barrier, jump over!)
  const bannerY = isElevatedSlide ? 1.75 : 0.65;
  bannerMesh.position.set(0, bannerY, 0.35);
  barrier.add(bannerMesh);

  // Placard wooden/metal holding poles
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.7 });
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, isElevatedSlide ? 2.4 : 1.2, 8);

  const leftPole = new THREE.Mesh(poleGeo, poleMat);
  leftPole.position.set(-1.05, (isElevatedSlide ? 2.4 : 1.2) / 2, 0.35);
  barrier.add(leftPole);

  const rightPole = new THREE.Mesh(poleGeo, poleMat);
  rightPole.position.set(1.05, (isElevatedSlide ? 2.4 : 1.2) / 2, 0.35);
  barrier.add(rightPole);

  return barrier;
}

// ---------------------------------------------------------------------
// 5. COLLECTIBLES: SILICON WAFER & POWER-UP TOKENS
// ---------------------------------------------------------------------

// Silicon Wafer (Rainbow Metallic Circuit Disc)
export function createSiliconWafer(): THREE.Group {
  const waferGroup = new THREE.Group();

  const waferTex = createCanvasTexture((ctx, w, h) => {
    // Rainbow holographic gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#00ffcc");
    grad.addColorStop(0.25, "#76b900");
    grad.addColorStop(0.5, "#ffd700");
    grad.addColorStop(0.75, "#ff007f");
    grad.addColorStop(1, "#00e5ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Silicon circuit grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 4;
    const step = 32;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Microchip die core
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(w * 0.35, h * 0.35, w * 0.3, h * 0.3);
    ctx.fillStyle = "#76b900";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("NVDA", w / 2, h / 2);
  }, 256, 256);

  const discGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
  const waferMat = new THREE.MeshStandardMaterial({
    map: waferTex,
    metalness: 0.9,
    roughness: 0.1,
  });

  const disc = new THREE.Mesh(discGeo, waferMat);
  disc.rotation.x = Math.PI / 2;
  waferGroup.add(disc);

  return waferGroup;
}

// Elon Musk + Cybertruck Rocket Token
export function createElonToken(): THREE.Group {
  const token = new THREE.Group();

  // Low-poly Cybertruck miniature
  const cyberMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.2 });
  const truck = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 4), cyberMat);
  truck.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  truck.scale.set(0.8, 1.4, 0.5);
  token.add(truck);

  // Floating label ring
  const labelTex = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚀 ELON ROCKET BOOST", w / 2, h / 2);
  }, 512, 128);

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.4),
    new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
  );
  banner.position.y = 0.65;
  token.add(banner);

  return token;
}

// Donald Trump Golden Tariff Shield Token
export function createTrumpToken(): THREE.Group {
  const token = new THREE.Group();

  // Golden medallion
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 });
  const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24), goldMat);
  medal.rotation.x = Math.PI / 2;
  token.add(medal);

  // Golden hair toupee atop coin
  const hair = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.35, 6),
    new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.3 })
  );
  hair.rotation.set(0.6, 0, -0.4);
  hair.position.set(0.08, 0.4, 0);
  token.add(hair);

  const labelTex = createCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = "#d32f2f";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 40px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️ TARIFF BAILOUT SHIELD", w / 2, h / 2);
  }, 512, 128);

  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.45),
    new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
  );
  banner.position.y = 0.75;
  token.add(banner);

  return token;
}

// ---------------------------------------------------------------------
// 6. SCENERY: HIGHWAY TRACK & CYBER SILICON VALLEY SKYLINE
// ---------------------------------------------------------------------
export function createHighwaySegment(): THREE.Group {
  const segment = new THREE.Group();

  // Main asphalt road
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x070c09,
    roughness: 0.6,
  });
  const roadGeo = new THREE.PlaneGeometry(8.5, 40);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  segment.add(road);

  // Green glowing circuit track dividers (Lanes: -2.5, 0, +2.5)
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x76b900 });
  const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 40), lineMat);
  leftLine.rotation.x = -Math.PI / 2;
  leftLine.position.set(-1.25, 0.01, 0);
  segment.add(leftLine);

  const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 40), lineMat);
  rightLine.rotation.x = -Math.PI / 2;
  rightLine.position.set(1.25, 0.01, 0);
  segment.add(rightLine);

  // Outer glowing guardrails
  const railMat = new THREE.MeshStandardMaterial({ color: 0x1a3311, metalness: 0.8, roughness: 0.2 });
  const railGeo = new THREE.BoxGeometry(0.3, 0.5, 40);

  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(-4.25, 0.25, 0);
  segment.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, railMat);
  rightRail.position.set(4.25, 0.25, 0);
  segment.add(rightRail);

  // Silicon Valley GPU Skyline buildings along the sides
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x051008, roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const height = 12 + Math.random() * 20;
    const bGeo = new THREE.BoxGeometry(6, height, 8);
    const bLeft = new THREE.Mesh(bGeo, buildingMat);
    bLeft.position.set(-10 - Math.random() * 4, height / 2, (i - 1.5) * 10);
    segment.add(bLeft);

    const bRight = new THREE.Mesh(bGeo, buildingMat);
    bRight.position.set(10 + Math.random() * 4, height / 2, (i - 1.5) * 10);
    segment.add(bRight);
  }

  return segment;
}

