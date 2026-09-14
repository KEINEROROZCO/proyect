import * as THREE from 'three';
import confetti from 'canvas-confetti';

export class GalaxyScene {
  constructor(containerElement) {
    this.container = containerElement;

    // Default Scene Parameters
    this.params = {
      glowIntensity: 1.2,
      blackHoleSpeed: 1.0,
      sunflowerCount: window.innerWidth < 768 ? 40 : 65,
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

    // Camera Orbit Control State (Desktop Mouse & Mobile Touch)
    this.isDragging = false;
    this.previousTouchPosition = { x: 0, y: 0 };
    this.touchStartDistance = 0;
    this.cameraTargetAngle = { x: 0.3, y: 0 };
    this.currentCameraAngle = { x: 0.3, y: 0 };
    this.cameraRadius = window.innerWidth < 768 ? 42 : 35;

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

    // 3. Setup Renderer (Optimized for Mobile GPUs)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Add Lights
    const ambientLight = new THREE.AmbientLight(0xfff5cc, 0.85);
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

    // 6. Setup Mouse & Touch Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.setupInteractions();

    // 7. Start Animation Loop
    this.animate();
  }

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
  }

  // 1. Spinning Black Hole Component
  createBlackHole() {
    this.blackHoleGroup = new THREE.Group();

    // Event Horizon Sphere
    const horizonGeo = new THREE.SphereGeometry(3.2, 36, 36);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(eventHorizon);

    // Photon Ring Glow
    const ringGeo = new THREE.RingGeometry(3.25, 4.2, 48);
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
    const count = window.innerWidth < 768 ? 3000 : 4500;
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

  // 2. Yellow Flower Galaxy Spiral Arms
  createYellowFlowerGalaxy() {
    const particleCount = window.innerWidth < 768 ? 7000 : 12000;
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

  // 3. Floating Sunflowers System
  createFloatingSunflowers() {
    if (this.sunflowersGroup) {
      this.scene.remove(this.sunflowersGroup);
    }

    this.sunflowersGroup = new THREE.Group();
    this.sunflowerObjects = [];

    const centerGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 20);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0x3d1c00, roughness: 0.8 });

    const petalGeo = new THREE.ConeGeometry(0.22, 1.1, 4);
    petalGeo.rotateX(Math.PI / 2);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, emissive: 0xffaa00, emissiveIntensity: 0.3 });

    const count = this.params.sunflowerCount;
    for (let i = 0; i < count; i++) {
      const flowerMesh = new THREE.Group();

      const center = new THREE.Mesh(centerGeo, centerMat);
      flowerMesh.add(center);

      const numPetals = 14;
      for (let p = 0; p < numPetals; p++) {
        const angle = (p / numPetals) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.x = Math.cos(angle) * 0.7;
        petal.position.z = Math.sin(angle) * 0.7;
        petal.rotation.y = -angle;
        petal.rotation.z = 0.15;
        flowerMesh.add(petal);
      }

      const orbitRadius = 10 + Math.random() * 22;
      const orbitAngle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 16;

      flowerMesh.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        height,
        Math.sin(orbitAngle) * orbitRadius
      );

      const scale = 0.5 + Math.random() * 0.7;
      flowerMesh.scale.set(scale, scale, scale);

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

  // 4. Glowing Hearts Particles Cloud
  createGlowingHeartsCloud() {
    const count = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;
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

  // 5. Cosmic Dust Stars
  createCosmicDust() {
    const count = 1500;
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

  // Full Desktop & Mobile Touch Gestures Handling
  setupInteractions() {
    const dom = this.renderer.domElement;

    // MOUSE DRAG
    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousTouchPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousTouchPosition.x;
        const deltaY = e.clientY - this.previousTouchPosition.y;

        this.cameraTargetAngle.y -= deltaX * 0.005;
        this.cameraTargetAngle.x += deltaY * 0.005;

        this.cameraTargetAngle.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraTargetAngle.x));
        this.previousTouchPosition = { x: e.clientX, y: e.clientY };
      }
    });

    // MOUSE WHEEL ZOOM
    dom.addEventListener('wheel', (e) => {
      this.cameraRadius += e.deltaY * 0.02;
      this.cameraRadius = Math.max(15, Math.min(70, this.cameraRadius));
    });

    // MOUSE CLICK BURST
    dom.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - this.previousTouchPosition.x) < 5) {
        this.triggerClickCelebration(e.clientX, e.clientY);
      }
    });

    // MOBILE TOUCH GESTURES (Single finger orbit drag & Two finger pinch zoom)
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        this.touchStartDistance = Math.hypot(dx, dy);
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.previousTouchPosition.x;
        const deltaY = e.touches[0].clientY - this.previousTouchPosition.y;

        this.cameraTargetAngle.y -= deltaX * 0.006;
        this.cameraTargetAngle.x += deltaY * 0.006;

        this.cameraTargetAngle.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.cameraTargetAngle.x));
        this.previousTouchPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.hypot(dx, dy);

        if (this.touchStartDistance > 0) {
          const deltaDistance = this.touchStartDistance - distance;
          this.cameraRadius += deltaDistance * 0.08;
          this.cameraRadius = Math.max(15, Math.min(70, this.cameraRadius));
        }
        this.touchStartDistance = distance;
      }
    }, { passive: true });

    dom.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        this.isDragging = false;
        this.touchStartDistance = 0;
      }
    });
  }

  triggerClickCelebration(screenX, screenY) {
    const normX = screenX / window.innerWidth;
    const normY = screenY / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 60,
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

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.currentCameraAngle.x += (this.cameraTargetAngle.x - this.currentCameraAngle.x) * 0.05;
    this.currentCameraAngle.y += (this.cameraTargetAngle.y - this.currentCameraAngle.y) * 0.05;
    this.updateCameraPosition();

    const speedMult = this.params.blackHoleSpeed;

    if (this.blackHoleGroup) {
      this.blackHoleGroup.rotation.y += 0.2 * delta * speedMult;
    }

    if (this.accretionParticles && this.accretionAngles) {
      const positions = this.accretionParticles.geometry.attributes.position.array;
      for (let i = 0; i < this.accretionRadii.length; i++) {
        const radius = this.accretionRadii[i];
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

    this.sunflowerObjects.forEach((item) => {
      item.orbitAngle += item.orbitSpeed * 0.2 * speedMult * delta;
      item.mesh.position.x = Math.cos(item.orbitAngle) * item.orbitRadius;
      item.mesh.position.z = Math.sin(item.orbitAngle) * item.orbitRadius;
      item.mesh.position.y += Math.sin(elapsedTime * item.floatSpeed + item.floatOffset) * 0.015;

      item.mesh.rotation.x += item.rotSpeedX * delta;
      item.mesh.rotation.y += item.rotSpeedY * delta;
    });

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

    this.renderer.render(this.scene, this.camera);
  }

  setPresetMode(mode) {
    this.params.presetMode = mode;
    const isMobile = window.innerWidth < 768;

    switch (mode) {
      case 'blackhole':
        this.cameraTargetAngle = { x: 0.7, y: 0.2 };
        this.cameraRadius = isMobile ? 28 : 22;
        break;
      case 'shower':
        this.cameraTargetAngle = { x: 0.1, y: 0 };
        this.cameraRadius = isMobile ? 48 : 40;
        break;
      case 'hearts':
        this.cameraTargetAngle = { x: 0.4, y: 0.5 };
        this.cameraRadius = isMobile ? 36 : 30;
        break;
      case 'galaxy':
      default:
        this.cameraTargetAngle = { x: 0.3, y: 0 };
        this.cameraRadius = isMobile ? 42 : 35;
        break;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
