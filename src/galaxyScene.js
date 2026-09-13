import * as THREE from 'three';
import confetti from 'canvas-confetti';

export class GalaxyScene {
  constructor(containerElement) {
    this.container = containerElement;

    // Parameters adjustable live by CSS code editor & UI controls
    this.params = {
      glowIntensity: 1.2,
      blackHoleSpeed: 1.0,
      sunflowerCount: 60,
      heartFrequency: 1.5,
      presetMode: 'galaxy'
    };

    // Three.js Core Objects
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Object References
    this.blackHoleGroup = null;
    this.accretionParticles = null;
    this.galaxyParticles = null;
    this.sunflowersGroup = null;
    this.heartParticles = null;
    this.cosmicDust = null;

    // Animation & State
    this.clock = new THREE.Clock();
    this.sunflowerObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Camera Orbit Mouse Control State
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraTargetAngle = { x: 0.3, y: 0 };
    this.currentCameraAngle = { x: 0.3, y: 0 };
    this.cameraRadius = 35;

    this.init();
  }

  init() {
    // 1. Create Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05030a, 0.015);

    // 2. Setup Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.updateCameraPosition();

    // 3. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Add Lights
    const ambientLight = new THREE.AmbientLight(0xfff5cc, 0.8);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 3, 60);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    const heartLight = new THREE.PointLight(0xff2a75, 2, 40);
    heartLight.position.set(0, 10, 0);
    this.scene.add(heartLight);

    // 5. Build Scene Elements
    this.createTextures();
    this.createBlackHole();
    this.createYellowFlowerGalaxy();
    this.createFloatingSunflowers();
    this.createGlowingHeartsCloud();
    this.createCosmicDust();

    // 6. Setup Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.setupMouseInteraction();

    // 7. Start Animation Loop
    this.animate();
  }

  // Create procedural textures for glowing particles, petals, and hearts
  createTextures() {
    // Glow Texture
    const canvasGlow = document.createElement('canvas');
    canvasGlow.width = 64;
    canvasGlow.height = 64;
    const ctxGlow = canvasGlow.getContext('2d');
    const gradGlow = ctxGlow.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradGlow.addColorStop(0, 'rgba(255, 235, 150, 1)');
    gradGlow.addColorStop(0.3, 'rgba(255, 183, 0, 0.8)');
    gradGlow.addColorStop(0.7, 'rgba(255, 42, 117, 0.3)');
    gradGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctxGlow.fillStyle = gradGlow;
    ctxGlow.fillRect(0, 0, 64, 64);
    this.glowTexture = new THREE.CanvasTexture(canvasGlow);

    // Heart Particle Texture
    const canvasHeart = document.createElement('canvas');
    canvasHeart.width = 64;
    canvasHeart.height = 64;
    const ctxHeart = canvasHeart.getContext('2d');
    ctxHeart.fillStyle = '#ff2a75';
    ctxHeart.beginPath();
    ctxHeart.moveTo(32, 52);
    ctxHeart.bezierCurveTo(12, 34, 4, 20, 18, 10);
    ctxHeart.bezierCurveTo(28, 2, 32, 16, 32, 16);
    ctxHeart.bezierCurveTo(32, 16, 36, 2, 46, 10);
    ctxHeart.bezierCurveTo(60, 20, 52, 34, 32, 52);
    ctxHeart.fill();
    this.heartTexture = new THREE.CanvasTexture(canvasHeart);

    // Petal Texture
    const canvasPetal = document.createElement('canvas');
    canvasPetal.width = 64;
    canvasPetal.height = 64;
    const ctxPetal = canvasPetal.getContext('2d');
    ctxPetal.fillStyle = '#ffd700';
    ctxPetal.beginPath();
    ctxPetal.ellipse(32, 32, 12, 28, Math.PI / 4, 0, Math.PI * 2);
    ctxPetal.fill();
    this.petalTexture = new THREE.CanvasTexture(canvasPetal);
  }

  // 1. Spinning Black Hole Component
  createBlackHole() {
    this.blackHoleGroup = new THREE.Group();

    // Event Horizon Sphere (Dark central void)
    const horizonGeo = new THREE.SphereGeometry(3.2, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(eventHorizon);

    // Gravitational Photon Glow Ring
    const ringGeo = new THREE.RingGeometry(3.25, 4.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const photonRing = new THREE.Mesh(ringGeo, ringMat);
    photonRing.rotation.x = Math.PI / 2.2;
    this.blackHoleGroup.add(photonRing);

    // Accretion Disk Swirling Particles
    const count = 4500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const angles = new Float32Array(count);
    const radii = new Float32Array(count);

    const colorGold = new THREE.Color(0xffd700);
    const colorOrange = new THREE.Color(0xff5500);
    const colorPink = new THREE.Color(0xff2a75);

    for (let i = 0; i < count; i++) {
      const radius = 3.8 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;

      radii[i] = radius;
      angles[i] = angle;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.6 * (1 - (radius - 3.8) / 8.5);
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Color interpolation: gold close to center, pink/orange further out
      const mixRatio = (radius - 3.8) / 8.5;
      const particleColor = colorGold.clone().lerp(mixRatio > 0.6 ? colorPink : colorOrange, mixRatio);
      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;

      sizes[i] = Math.random() * 0.45 + 0.15;
    }

    const accretionGeo = new THREE.BufferGeometry();
    accretionGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    accretionGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    accretionGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.accretionAngles = angles;
    this.accretionRadii = radii;

    const accretionMat = new THREE.PointsMaterial({
      size: 0.5,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.accretionParticles = new THREE.Points(accretionGeo, accretionMat);
    this.blackHoleGroup.add(this.accretionParticles);

    this.scene.add(this.blackHoleGroup);
  }

  // 2. Glowing Yellow Flower Galaxy Spiral Arms
  createYellowFlowerGalaxy() {
    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const arms = 4;
    const colorInside = new THREE.Color(0xfff275);
    const colorOutside = new THREE.Color(0xff8c00);
    const colorOuterEdge = new THREE.Color(0xff2a75);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 26 + 4;
      const spinAngle = radius * 0.45;
      const branchAngle = ((i % arms) / arms) * Math.PI * 2;

      const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2.5);
      const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2.5);
      const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 2.5);

      const x = Math.cos(branchAngle + spinAngle) * radius + randomX;
      const y = randomY * (1 - radius / 30);
      const z = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color blend
      const mixedColor = colorInside.clone();
      if (radius < 15) {
        mixedColor.lerp(colorOutside, radius / 15);
      } else {
        mixedColor.lerp(colorOuterEdge, (radius - 15) / 15);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.45 * this.params.glowIntensity,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.galaxyParticles = new THREE.Points(geometry, material);
    this.scene.add(this.galaxyParticles);
  }

  // 3. 3D Floating Sunflowers System
  createFloatingSunflowers() {
    if (this.sunflowersGroup) {
      this.scene.remove(this.sunflowersGroup);
    }

    this.sunflowersGroup = new THREE.Group();
    this.sunflowerObjects = [];

    // Base geometry for a sunflower model mesh
    const centerGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 24);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x3d1c00,
      roughness: 0.8,
      metalness: 0.1
    });

    const petalGeo = new THREE.ConeGeometry(0.22, 1.1, 4);
    petalGeo.rotateX(Math.PI / 2);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      emissive: 0xffaa00,
      emissiveIntensity: 0.3
    });

    const count = this.params.sunflowerCount;
    for (let i = 0; i < count; i++) {
      const flowerMesh = new THREE.Group();

      // Flower Center
      const center = new THREE.Mesh(centerGeo, centerMat);
      flowerMesh.add(center);

      // Petals ring
      const numPetals = 16;
      for (let p = 0; p < numPetals; p++) {
        const angle = (p / numPetals) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.x = Math.cos(angle) * 0.7;
        petal.position.z = Math.sin(angle) * 0.7;
        petal.rotation.y = -angle;
        petal.rotation.z = 0.15;
        flowerMesh.add(petal);
      }

      // Position in 3D Space floating around galaxy
      const orbitRadius = 10 + Math.random() * 22;
      const orbitAngle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 16;

      flowerMesh.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        height,
        Math.sin(orbitAngle) * orbitRadius
      );

      const scale = 0.6 + Math.random() * 0.8;
      flowerMesh.scale.set(scale, scale, scale);

      // Custom animation properties stored on object
      const flowerData = {
        mesh: flowerMesh,
        orbitRadius,
        orbitAngle,
        orbitSpeed: (0.1 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1),
        floatSpeed: 0.5 + Math.random() * 0.8,
        floatOffset: Math.random() * Math.PI * 2,
        rotSpeedX: (Math.random() - 0.5) * 0.8,
        rotSpeedY: (Math.random() - 0.5) * 0.8
      };

      this.sunflowerObjects.push(flowerData);
      this.sunflowersGroup.add(flowerMesh);
    }

    this.scene.add(this.sunflowersGroup);
  }

  // 4. Glowing Heart Particles Cloud
  createGlowingHeartsCloud() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
      scales[i] = Math.random() * 0.8 + 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 1.2,
      map: this.heartTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.heartParticles = new THREE.Points(geometry, material);
    this.scene.add(this.heartParticles);
  }

  // 5. Cosmic Dust Ambient Stars
  createCosmicDust() {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });

    this.cosmicDust = new THREE.Points(geometry, material);
    this.scene.add(this.cosmicDust);
  }

  // Setup Mouse Drag Orbit Controls & Click Bursts
  setupMouseInteraction() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.cameraTargetAngle.y -= deltaX * 0.005;
        this.cameraTargetAngle.x += deltaY * 0.005;

        // Clamp vertical angle
        this.cameraTargetAngle.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraTargetAngle.x));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Zoom on Wheel
    dom.addEventListener('wheel', (e) => {
      this.cameraRadius += e.deltaY * 0.02;
      this.cameraRadius = Math.max(15, Math.min(65, this.cameraRadius));
    });

    // Click interactive firework burst
    dom.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - this.previousMousePosition.x) < 5) {
        this.triggerClickCelebration(e.clientX, e.clientY);
      }
    });
  }

  // Trigger celebration particle burst at click position
  triggerClickCelebration(screenX, screenY) {
    const normX = screenX / window.innerWidth;
    const normY = screenY / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x: normX, y: normY },
      colors: ['#ffd700', '#ff2a75', '#ffb700', '#ffffff'],
      shapes: ['star', 'circle']
    });
  }

  updateCameraPosition() {
    this.camera.position.x = this.cameraRadius * Math.sin(this.currentCameraAngle.y) * Math.cos(this.currentCameraAngle.x);
    this.camera.position.y = this.cameraRadius * Math.sin(this.currentCameraAngle.x);
    this.camera.position.z = this.cameraRadius * Math.cos(this.currentCameraAngle.y) * Math.cos(this.currentCameraAngle.x);
    this.camera.lookAt(0, 0, 0);
  }

  // Main Render Animation Loop
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth camera inertia
    this.currentCameraAngle.x += (this.cameraTargetAngle.x - this.currentCameraAngle.x) * 0.05;
    this.currentCameraAngle.y += (this.cameraTargetAngle.y - this.currentCameraAngle.y) * 0.05;
    this.updateCameraPosition();

    // 1. Rotate Black Hole Accretion Disk & Galaxy
    const speedMult = this.params.blackHoleSpeed;

    if (this.blackHoleGroup) {
      this.blackHoleGroup.rotation.y += 0.2 * delta * speedMult;
    }

    if (this.accretionParticles && this.accretionAngles) {
      const positions = this.accretionParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.accretionRadii.length; i++) {
        const radius = this.accretionRadii[i];
        // Keplerian orbital speed: faster near event horizon
        const orbitSpeed = (4.0 / Math.sqrt(radius)) * speedMult * delta;
        this.accretionAngles[i] += orbitSpeed;

        positions[i * 3] = Math.cos(this.accretionAngles[i]) * radius;
        positions[i * 3 + 2] = Math.sin(this.accretionAngles[i]) * radius;
      }
      this.accretionParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.galaxyParticles) {
      this.galaxyParticles.rotation.y += 0.08 * delta * speedMult;
    }

    // 2. Animate Floating Sunflowers
    this.sunflowerObjects.forEach((item) => {
      item.orbitAngle += item.orbitSpeed * 0.2 * speedMult * delta;
      item.mesh.position.x = Math.cos(item.orbitAngle) * item.orbitRadius;
      item.mesh.position.z = Math.sin(item.orbitAngle) * item.orbitRadius;
      item.mesh.position.y += Math.sin(elapsedTime * item.floatSpeed + item.floatOffset) * 0.015;

      item.mesh.rotation.x += item.rotSpeedX * delta;
      item.mesh.rotation.y += item.rotSpeedY * delta;
    });

    // 3. Animate Glowing Heart Particles drifting upwards
    if (this.heartParticles) {
      const pos = this.heartParticles.geometry.attributes.position.array;
      const freq = this.params.heartFrequency;

      for (let i = 1; i < pos.length; i += 3) {
        pos[i] += 1.2 * delta * freq;
        if (pos[i] > 20) {
          pos[i] = -20;
        }
      }
      this.heartParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  // Update Parameters dynamically from CSS editor / Sliders
  updateParameters(newParams) {
    Object.assign(this.params, newParams);

    if (newParams.glowIntensity !== undefined && this.galaxyParticles) {
      this.galaxyParticles.material.size = 0.45 * newParams.glowIntensity;
    }

    if (newParams.sunflowerCount !== undefined) {
      this.createFloatingSunflowers();
    }
  }

  // Preset scene mode change
  setPresetMode(mode) {
    this.params.presetMode = mode;
    switch (mode) {
      case 'blackhole':
        this.cameraTargetAngle = { x: 0.7, y: 0.2 };
        this.cameraRadius = 22;
        this.updateParameters({ blackHoleSpeed: 2.2, glowIntensity: 1.8, sunflowerCount: 20 });
        break;
      case 'shower':
        this.cameraTargetAngle = { x: 0.1, y: 0 };
        this.cameraRadius = 40;
        this.updateParameters({ sunflowerCount: 120, blackHoleSpeed: 0.5, glowIntensity: 1.0 });
        break;
      case 'hearts':
        this.cameraTargetAngle = { x: 0.4, y: 0.5 };
        this.cameraRadius = 30;
        this.updateParameters({ heartFrequency: 2.8, glowIntensity: 1.5, sunflowerCount: 50 });
        break;
      case 'galaxy':
      default:
        this.cameraTargetAngle = { x: 0.3, y: 0 };
        this.cameraRadius = 35;
        this.updateParameters({ blackHoleSpeed: 1.0, glowIntensity: 1.2, sunflowerCount: 60, heartFrequency: 1.5 });
        break;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
