import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ==========================
   🌌 CONFIGURACIÓN DE EFECTOS ESPACIALES
========================== */
const SPACE_EFFECTS_CONFIG = {
  backgroundGalaxies: {
    enabled: true,
    count: 8,
    minDistance: 80,
    maxDistance: 150,
    minSize: 30,
    maxSize: 70,
    opacity: 0.4,
    rotationSpeed: 0.0001
  },
  shootingStars: {
    enabled: true,
    spawnInterval: 4000,
    spawnChance: 0.6,
    speed: 2,
    length: 8,
    trailPoints: 15
  },
  spaceships: {
    enabled: true,
    count: 3,
    patrolRadius: 120,
    speed: 0.3,
    scale: 8
  }
};

/* ==========================
   AUDIO
========================== */
/* ==========================
   SISTEMA DE AUDIO
========================== */
let startButton = null;
const playstationSound = new Audio('./sounds/01. Bootup.mp3');
const galaxyPlaylist = [
  './sounds/1-02. File Select.mp3',
  './sounds/02. The Star Dust Festival.mp3',
  './sounds/08. Rosetta of the Observatory 1.mp3',
  './sounds/10. Star Dust Road.mp3',
  './sounds/videoplayback.mp3',
  './sounds/05. Another Story.mp3',
  './sounds/11. Starship Mario, Launch!.mp3',
  './sounds/25. Unidentified Planet.mp3',
  './sounds/74. Green Star.mp3'
];

let currentGalaxyTrack = null;
let currentGalaxyIndex = -1;

playstationSound.volume = 0.7;

let audioUnlocked = false;
let musicStarted = false;

// Función para reproducir audio de forma segura
async function playAudio(audio, fadeIn = false) {
  if (!audioUnlocked) {
    console.warn('Audio bloqueado');
    return false;
  }
  
  try {
    audio.currentTime = 0;
    
    if (fadeIn) {
      audio.volume = 0;
      await audio.play();
      
      // Fade in gradual
      const targetVolume = 0.5;
      const interval = setInterval(() => {
        if (audio.volume < targetVolume - 0.05) {
          audio.volume += 0.05;
        } else {
          audio.volume = targetVolume;
          clearInterval(interval);
        }
      }, 50);
    } else {
      await audio.play();
    }
    
    return true;
  } catch (error) {
    console.error('Error al reproducir audio:', error);
    return false;
  }
}
function getRandomGalaxyTrack() {
  let index;
  do {
    index = Math.floor(Math.random() * galaxyPlaylist.length);
  } while (index === currentGalaxyIndex && galaxyPlaylist.length > 1);

  currentGalaxyIndex = index;
  return galaxyPlaylist[index];
}

async function startGalaxyMusic() {
  if (!audioUnlocked) return;

  if (currentGalaxyTrack) {
    currentGalaxyTrack.pause();
    currentGalaxyTrack = null;
  }

  const src = getRandomGalaxyTrack();
  const audio = new Audio(src);

  audio.volume = 0;
  audio.loop = false;

  try {
    await audio.play();

    // Fade in
    const fade = setInterval(() => {
      if (audio.volume < 0.5) {
        audio.volume += 0.05;
      } else {
        audio.volume = 0.5;
        clearInterval(fade);
      }
    }, 60);

    // Al terminar → siguiente canción
    audio.addEventListener('ended', () => {
      startGalaxyMusic();
    });

    currentGalaxyTrack = audio;
  } catch (e) {
    console.warn('No se pudo reproducir música:', e);
  }
}
/* ==========================
   UI SOUNDS (PS2 BIOS STYLE)
========================== */
const uiSounds = {
  hover: new Audio('./sounds/12.mp3'),
  click: new Audio('./sounds/12.mp3'),
  back: new Audio('./sounds/15.mp3'),
  start: new Audio('./sounds/14.mp3'),
  open: new Audio('./sounds/13.mp3')
};

Object.values(uiSounds).forEach(s => {
  s.volume = 1.0;
});

function horaToMinutes(hora) {
  if (!hora) return Infinity; // seguridad
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
function getRealMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/* ==========================
   NOTIFICACIONES
========================== */

const STORAGE_LAST_VISIT = "galaxy_last_visit";
const STORAGE_UNLOCKED = "galaxy_unlocked_count";

function getLastVisit() {
  return parseInt(localStorage.getItem(STORAGE_LAST_VISIT) || "0");
}

function setLastVisit(time) {
  localStorage.setItem(STORAGE_LAST_VISIT, time.toString());
}

function getSavedUnlocked() {
  return parseInt(localStorage.getItem(STORAGE_UNLOCKED) || "0");
}

function setSavedUnlocked(count) {
  localStorage.setItem(STORAGE_UNLOCKED, count.toString());
}
function getSeenPhotos() {
  return parseInt(localStorage.getItem("seenPhotos") || "0");
}

function setSeenPhotos(n) {
  localStorage.setItem("seenPhotos", n);
}

function showNotification(text) {
  const el = document.getElementById("notification");
  if (!el) return;

  el.textContent = text;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 5000);
}

function showBigHint(text, delay = 0) {
  setTimeout(() => {
    const hint = document.createElement("div");
    hint.className = "big-hint";
    hint.innerText = text;

    document.body.appendChild(hint);

    requestAnimationFrame(() => {
      hint.classList.add("visible");
    });

    setTimeout(() => {
      hint.classList.remove("visible");
      setTimeout(() => hint.remove(), 800);
    }, 5000);

  }, delay);
}

/* ==========================
   HINT HUD ESTÁTICO
========================== */
function showHudHint(text, duration = 5000) {
  const hint = document.createElement("div");
  hint.className = "hud-hint";
  hint.innerText = text;

  document.body.appendChild(hint);

  requestAnimationFrame(() => {
    hint.classList.add("visible");
  });

  setTimeout(() => {
    hint.classList.remove("visible");
    setTimeout(() => hint.remove(), 500);
  }, duration);
  
  console.log('💡 HUD Hint mostrado:', text);
}

/* ==========================
   DATOS DE REGALOS
========================== */
const regalos = [
  {
    foto: './img/1.png',
    miniTexto: 'Feliz cumple ✨',
    mensajeCompleto: 'Muchas felicidades amiga!! 🥳🥳🎂 Feliz cumpleaños ✨🎂✨deseo que pases un día muy bonito junto a las personas que más quieres, que sigas cumpliendo tus metas y te vaya muy bien, te mando un fuerte abrazo 🤗🥳🥳✨ pd: queremos pastel!! 🎂✨🎂',
    autor: 'Mari',
    hora: "03:00"
  },
  {
    foto: './img/2.png',
    miniTexto: '🎁',
    mensajeCompleto: 'Feliz cumpleaños Irene. Espero que disfrutes mucho de este día y te deseo mucha suerte en cualquier proyecto que tengas. TQM.',
    autor: 'liss',
    hora: "03:05"
  },
  {
    foto: './img/3.jpg',
    miniTexto: '💙',
    mensajeCompleto: 'Gracias por tu amistad, sabes que cuentas conmigo para lo que sea, se que estas loca pero las mejores personas lo estan, yo te apoyare como gen a senku',
    autor: 'Jesus',
    hora: "03:00"
  },
  {
    foto: './img/4.jpg',
    miniTexto: '🌟',
    mensajeCompleto: '¡Feliz cumpleaños, Irene! No quería dejar pasar el día sin decirte que, aunque llevamos poco tiempo de conocernos, me da mucho gusto haber coincidido contigo. Es curioso cómo en tan poco tiempo se puede empezar a construir una amistad tan auténtica, y valoro mucho la confianza que hemos ido ganando. Me parece genial que, más allá de los estudios, seamos personas con las que se puede platicar y compartir momentos de calidad como el de hoy.Me la estoy pasando muy bien hoy tomando algo con todos y conociéndonos más a fondo fuera del entorno de siempre. Creo que son estos momentos de convivencia los que realmente cuentan y los que hacen que una amistad crezca de verdad, dejando de lado por un rato las responsabilidades para simplemente disfrutar. Me agrada mucho tu forma de ser y la vibra que transmites, y me da gusto que estemos compartiendo este festejo entre amigos y con la maestra.Te deseo un año increíble, lleno de éxitos en todo lo que te propongas y de muchos más momentos compartidos como este. Espero que este sea solo el primero de muchos cumpleaños que me toque festejar contigo ahora que somos amigos. Disfruta muchísimo tu día, sigue siendo esa gran persona que eres y cuenta conmigo para lo que necesites en este camino que estamos recorriendo. ¡Muchas felicidades, Irene, te mando un fuerte abrazo!',
    autor: 'JuanMa',
    hora: "03:00"
  },
  {
    foto: './img/5.jpg',
    miniTexto: '⭐',
    mensajeCompleto: 'Gracias por cada risa compartida y cada momento inolvidable. Que sigas brillando siempre.',
    autor: 'Urios',
    hora: "03:00"
  },
  {
    foto: './img/6.jpg',
    miniTexto: '💫',
    mensajeCompleto: 'La primera vez que te vi nunca me imagine lo importante que ibas a ser para mi, estos ultimos años me he divertido haciendo y deshaciendo contigo, no me imagino como habria sido todo sin ti, muchas gracias por aparecer en mi vida, se que te lo digo a cada rato pero... "Si sabes que te quiero mucho, verdad? 🥺", jajaja. Feliz cumpleaños!!',
    autor: 'Servin',
    hora: "03:00"
  },
  {
    foto: './img/7.jpg',
    miniTexto: '💫',
    mensajeCompleto: 'Holis Irene💕, no tenemos fotitos juntas pero si tendré siempre un huequito en mi corazón para ti, feliz cumpleaños amiga, te quiero muchote!!!',
    autor: 'Carol',
    hora: "03:00"
  }
];

/* ==========================
   SIMULATED CLOCK (CORRECTO)
========================== */

let simulatedMinutes = 11 * 60 + 50; // 11:50
let lastSimTime = performance.now();

function updateSimulatedClock() {
  const now = performance.now();
  const deltaMs = now - lastSimTime;
  lastSimTime = now;

  // 1 segundo real = 1 minuto simulado
  simulatedMinutes += deltaMs / 1000;
}

/* ==========================
   ESTADOS
========================== */
const STATES = {
  INTRO: "intro",
  ENTRADA: "entrada",
  EXPLORACION: "exploracion",
};

let currentState = "WAITING";
let modalOpen = false;

/* ==========================
   CONFIG
========================== */
const CONFIG = {
  galaxy: {
    count: 280000,
    radius: 7,
    branches: 10,
    spin: 0.30,
    size: 0.030,
    insideColor: "#dbe7ff",
    middleColor: "#87ceeb",
    outsideColor: "#4a9eff",
    randomness: 1.0,
    randomnessPower: 10000000,
  },
  text: {
    canvasWidth: 2048,
    canvasHeight: 512,
    fontSize: 100,
    scale: 2.2,
    floatAmplitude: 0.08,
    floatSpeed: 0.0006,
  },
  photos: {
    scale: 1.5,
    floatAmplitude: 0.06,
    floatSpeed: 0.0007,
  },
  particles: {
    count: 500,
    size: 0.10,
  }
};
const TEXT_ASPECT = CONFIG.text.canvasWidth / CONFIG.text.canvasHeight; // 4
/* ==========================
   PANTALLA DE INICIO
========================== */
function createStartScreen() {
  const startScreen = document.createElement('div');
    startButton = document.createElement('button');
  startScreen.id = 'startScreen';
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>🌌 Te doy la bienvenida al Memory Galaxy Museum</h1>
      <p>Un regalo especial</p>
      <button id="startButton" class="start-btn">
        ▶ Haz click aqui para Comenzar
      </button>
      <p class="hint">🎧 Activa el audio para mejor experiencia</p>
    </div>
  `;
  startButton.addEventListener('mouseenter', () => playUISound('hover'));
  startButton.addEventListener('click', () => playUISound('start'));

  startScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  
  startScreen.appendChild(startButton);
  document.body.appendChild(startScreen);
  return startScreen;
}

// Crear la pantalla
const startScreen = createStartScreen();
let experienceStarted = false;
// Manejar el click del botón
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');

  if (!startButton) {
    console.error('❌ startButton no encontrado');
    return;
  }

  startButton.addEventListener('click', async () => {
    if (experienceStarted) return;
    experienceStarted = true;

    startButton.textContent = 'Iniciando...';
    startButton.disabled = true;

    try {
      await playstationSound.play();
      await playstationSound.pause();
      playstationSound.currentTime = 0;
      audioUnlocked = true;
      console.log('✅ Audio desbloqueado');
    } catch (e) {
      console.warn('Audio puede estar bloqueado:', e);
      audioUnlocked = true;
    }

    startScreen.style.transition = 'opacity 0.5s ease';
    startScreen.style.opacity = '0';

    setTimeout(() => {
      startScreen.remove();

      currentState = STATES.INTRO;
      introStart = Date.now();
      introSprite = crearTextoIntro(introTexts[0].text, introTexts[0].small);

      if (audioUnlocked && introTexts[0].sound) {
        playAudio(introTexts[0].sound);
      }

      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';

      console.log('🎬 Intro iniciado');
    }, 500);
  });
});


/* ==========================
   ESCENA
========================== */
const canvas = document.getElementById("galaxy");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 8, 60);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false});

function getViewportSize() {
  const w = window.visualViewport?.width || window.innerWidth;
  const h = window.visualViewport?.height || window.innerHeight;
  return { w, h };
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.setClearColor(0x050008, 1);

function adaptCameraForMobile() {
  const isMobile = window.innerWidth < 900;
  const portrait = window.innerHeight > window.innerWidth;

  if (isMobile && portrait) {
    camera.position.z = 16; // alejar
    camera.fov = 85;        // abrir FOV
  } else if (isMobile) {
    camera.position.z = 13;
    camera.fov = 75;
  } else {
    camera.position.z = 12;
    camera.fov = 75;
  }

  camera.updateProjectionMatrix();
}

/* ==========================
   RAYCASTER
========================== */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* ==========================
   LUCES
========================== */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x4a9eff, 2.5, 25);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x87ceeb, 2.5, 25);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x6eb5ff, 2, 20);
pointLight3.position.set(0, 8, 0);
scene.add(pointLight3);

/* ==========================
   AGUJERO NEGRO
========================== */
function crearAgujeroNegro() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.6, 64, 64);
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const blackHole = new THREE.Mesh(geometry, material);
  group.add(blackHole);
  
  const glowLayers = [];
  const layerCount = 8;
  
  for (let i = 0; i < layerCount; i++) {
    const t = i / (layerCount - 1);
    const radius = 0.7 + t * 1.5;
    const opacity = 0.6 * (1 - t * 0.85);
    
    const glowGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowLayers.push(glowSphere);
    group.add(glowSphere);
  }
  
  const redLight = new THREE.PointLight(0xff0000, 5, 8);
  redLight.position.set(0, 0, 0);
  group.add(redLight);
  
  scene.add(group);
  return { group, glowLayers, light: redLight };
}

const blackHole = crearAgujeroNegro();
blackHole.group.visible = false;

/* ==========================
   ESTRELLAS FLOTANTES
========================== */
function createStarShape() {
  const shape = new THREE.Shape();
  const outerRadius = 0.5;
  const innerRadius = 0.2;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}
function crearSkybox() {
  const geometry = new THREE.SphereGeometry(50, 64, 64);

const material = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  fog: false,
  uniforms: {
    time: { value: 0 }
  },
  vertexShader: `
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    varying vec3 vPos;

    void main() {
      float h = normalize(vPos).y * 0.5 + 0.5;

      vec3 top = vec3(0.12, 0.04, 0.25);
      vec3 mid = vec3(0.04, 0.01, 0.08);
      vec3 bottom = vec3(0.25, 0.04, 0.08);

      vec3 color = mix(bottom, top, h);
      color = mix(color, mid, sin(time * 0.03) * 0.5 + 0.5);

      gl_FragColor = vec4(color, 1.0);
    }
  `
});

  const sky = new THREE.Mesh(geometry, material);
  scene.add(sky);
  return sky;
}

const skybox = crearSkybox();
scene.background = null; // asegúrate

const starParticles = [];
function createFloatingStarParticles() {
  const starShape = createStarShape();
  const extrudeSettings = { depth: 0.05, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  
  for (let i = 0; i < 128; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() > 0.5 ? 0x4a9eff : 0x87ceeb,
      transparent: true,
      opacity: 0.8,
      emissive: 0x4a9eff,
      emissiveIntensity: 0.7,
    });
    
    const star = new THREE.Mesh(geometry, material);
    star.scale.set(0.12, 0.12, 0.12);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    star.position.set(Math.cos(angle) * radius, -5 + Math.random() * 2, Math.sin(angle) * radius);
    
    star.userData = {
      baseY: star.position.y,
      speed: 0.01 + Math.random() * 0.02,
      angle: angle,
      radius: radius,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      size: 0.10,
    };
    
    starParticles.push(star);
    scene.add(star);
  }
}

createFloatingStarParticles();

/* ==========================
   TEXTURAS DE PARTÍCULAS
========================== */
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Crear gradiente radial para el brillo
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  // Agregar cruz de estrella
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Línea horizontal
  ctx.fillRect(0, 15, 32, 2);
  
  // Línea vertical
  ctx.fillRect(15, 0, 2, 32);
  
  // Diagonales
  ctx.save();
  ctx.translate(16, 16);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-16, -1, 32, 2);
  ctx.fillRect(-1, -16, 2, 32);
  ctx.restore();
  
  return new THREE.CanvasTexture(canvas);
}

function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Crear gradiente radial suave
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  
  return new THREE.CanvasTexture(canvas);
}

// Crear texturas globales
const starTexture = createStarTexture();
const circleTexture = createCircleTexture();

/* ==========================
   GLITTER
========================== */
const glitterParticles = new THREE.Group();
const glitterGeometry = new THREE.BufferGeometry();
const glitterPositions = new Float32Array(CONFIG.particles.count * 3);
const glitterColors = new Float32Array(CONFIG.particles.count * 3);

for (let i = 0; i < CONFIG.particles.count; i++) {
  const i3 = i * 3;
  const angle = Math.random() * Math.PI * 2;
  const radius = 5 + Math.random() * 10;
  
  glitterPositions[i3] = Math.cos(angle) * radius;
  glitterPositions[i3 + 1] = (Math.random() - 0.5) * 15;
  glitterPositions[i3 + 2] = Math.sin(angle) * radius;
  
  const color = new THREE.Color();
  color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.7);
  glitterColors[i3] = color.r;
  glitterColors[i3 + 1] = color.g;
  glitterColors[i3 + 2] = color.b;
}

glitterGeometry.setAttribute('position', new THREE.BufferAttribute(glitterPositions, 3));
glitterGeometry.setAttribute('color', new THREE.BufferAttribute(glitterColors, 3));

const glitterMaterial = new THREE.PointsMaterial({
  size: CONFIG.particles.size,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  map: circleTexture, // ← Textura de círculo suave
  alphaTest: 0.001,
});

const glitter = new THREE.Points(glitterGeometry, glitterMaterial);
glitterParticles.add(glitter);
scene.add(glitterParticles);

/* ==========================
   GALAXIA
========================== */
function crearGalaxia() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(CONFIG.galaxy.count * 3);
  const colors = new Float32Array(CONFIG.galaxy.count * 3);

  const inside = new THREE.Color(CONFIG.galaxy.insideColor);
  const middle = new THREE.Color(CONFIG.galaxy.middleColor);
  const outside = new THREE.Color(CONFIG.galaxy.outsideColor);

  for (let i = 0; i < CONFIG.galaxy.count; i++) {
    const i3 = i * 3;
    const r = 0.8 + Math.pow(Math.random(), 1.5) * (CONFIG.galaxy.radius - 0.8);
    const branchAngle = ((i % CONFIG.galaxy.branches) / CONFIG.galaxy.branches) * Math.PI * 2;
    const spinAngle = r * CONFIG.galaxy.spin;
    
    const branchX = Math.cos(branchAngle + spinAngle) * r;
    const branchZ = Math.sin(branchAngle + spinAngle) * r;
    
    const isOnArm = Math.random() < 0.8;
    const powerFactor = isOnArm ? 12 : 4;
    const spread = CONFIG.galaxy.randomness * r * 0.25;
    
    const randomX = Math.pow(Math.random(), powerFactor) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const randomY = Math.pow(Math.random(), powerFactor) * (Math.random() < 0.5 ? 1 : -1) * spread * 0.3;
    const randomZ = Math.pow(Math.random(), powerFactor) * (Math.random() < 0.5 ? 1 : -1) * spread;

    positions[i3] = branchX + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = branchZ + randomZ;

    const normalizedRadius = (r - 0.8) / (CONFIG.galaxy.radius - 0.8);
    let mixedColor;
    
    if (normalizedRadius < 0.3) {
      mixedColor = inside.clone().lerp(middle, normalizedRadius / 0.3);
    } else {
      mixedColor = middle.clone().lerp(outside, (normalizedRadius - 0.3) / 0.7);
    }
    
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: CONFIG.galaxy.size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: starTexture, // ← Textura de estrella brillante
    alphaTest: 0.001,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

const galaxy = crearGalaxia();

/* ==========================
   TEXTOS
========================== */
const textos = [];

function crearTexto(mensaje, index) {
  const c = document.createElement("canvas");
  c.width = CONFIG.text.canvasWidth;
  c.height = CONFIG.text.canvasHeight;

  const ctx = c.getContext("2d");
  ctx.shadowColor = '#ff5cff';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffe6ff';
  ctx.font = `bold ${CONFIG.text.fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let i = 0; i < 3; i++) {
    ctx.fillText(mensaje, c.width / 2, c.height / 2);
  }

  const texture = new THREE.CanvasTexture(c);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false })
  );


  const angle = Math.random() * Math.PI * 2;
  const radius = 2.5 + Math.random() * 2.5;
  const baseY = (Math.random() - 0.5) * 3;

  new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,   // ← hace que se sientan flotando
    depthWrite: false
  })

  sprite.userData = { angle, radius, baseY, index: index, isText: true };
  sprite.position.set(Math.cos(angle) * radius, baseY, Math.sin(angle) * radius);
  sprite.visible = true;
  sprite.material.opacity = 0;
  sprite.scale.multiplyScalar(0.5);
  sprite.userData.appearTime = null;

  textos.push(sprite);
  scene.add(sprite);
}

regalos.forEach((regalo, idx) => crearTexto(regalo.miniTexto, idx));
const hints = [
  { text: "Arrastra para explorar", delay: 2000 },
  { text: "Toca las fotos", delay: 7000 },
  { text: "Algunas guardan algo especial", delay: 12000 }
];

let hintSprites = [];
let sparkleParticles = [];
let starTrailParticles = [];
function crearHint(texto, y = -2) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;

  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(232,246,255,0.9)";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, c.width / 2, c.height / 2);

  const texture = new THREE.CanvasTexture(c);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false
    })
  );

  sprite.scale.set(6, 1.5, 1);
  sprite.position.set(0, y, 1.5);
  sprite.userData = {
    startTime: Date.now(),
    life: 6000
  };

  scene.add(sprite);
  hintSprites.push(sprite);
  
  console.log('✨ Hint 3D creado:', texto);
}

/* ==========================
   EFECTOS VISUALES
========================== */
function createSparkleEffect(position) {
  // Crear más partículas para efecto más llamativo
  for (let i = 0; i < 15; i++) {
    const particle = new THREE.Sprite(
      new THREE.SpriteMaterial({
        // Colores más saturados y brillantes
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.05, 1.0, 0.65),
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        map: starTexture, // ← Textura de estrella
      })
    );
    
    particle.position.copy(position);
    // Mayor dispersión para efecto más visible
    particle.position.x += (Math.random() - 0.5) * 0.8;
    particle.position.y += (Math.random() - 0.5) * 0.8;
    particle.position.z += (Math.random() - 0.5) * 0.8;
    
    // Partículas más grandes
    particle.scale.setScalar(0.2 + Math.random() * 0.15);
    particle.userData = {
      vx: (Math.random() - 0.5) * 0.03,
      vy: (Math.random() - 0.5) * 0.03,
      vz: (Math.random() - 0.5) * 0.03,
      // Vida más larga
      life: 50 + Math.random() * 30,
      age: 0,
      // Añadir escala inicial para animación
      initialScale: 0.2 + Math.random() * 0.15
    };
    
    scene.add(particle);
    sparkleParticles.push(particle);
  }
}

function createStarTrail() {
  if (Math.random() > 0.3) return; // No crear siempre
  
  const trail = new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map: circleTexture, // ← Textura de círculo suave
    })
  );
  
  trail.position.copy(camera.position);
  trail.scale.setScalar(0.05);
  trail.userData = {
    life: 20,
    age: 0
  };
  
  scene.add(trail);
  starTrailParticles.push(trail);
}

function updateParticleEffects() {
  // Actualizar sparkles
  sparkleParticles = sparkleParticles.filter(particle => {
    particle.userData.age++;
    
    particle.position.x += particle.userData.vx;
    particle.position.y += particle.userData.vy;
    particle.position.z += particle.userData.vz;
    
    const lifeRatio = particle.userData.age / particle.userData.life;
    
    // Fade out más suave
    if (lifeRatio < 0.2) {
      // Fade in inicial
      particle.material.opacity = lifeRatio * 5;
    } else if (lifeRatio > 0.7) {
      // Fade out final
      particle.material.opacity = (1 - lifeRatio) * 3.33;
    } else {
      // Máxima opacidad en el medio
      particle.material.opacity = 1;
    }
    
    // Efecto de pulso para más visibilidad
    const pulseScale = 1 + Math.sin(particle.userData.age * 0.2) * 0.3;
    particle.scale.setScalar(particle.userData.initialScale * pulseScale);
    
    if (particle.userData.age >= particle.userData.life) {
      scene.remove(particle);
      particle.material.dispose();
      return false;
    }
    return true;
  });
  
  // Actualizar trails
  starTrailParticles = starTrailParticles.filter(trail => {
    trail.userData.age++;
    
    const lifeRatio = trail.userData.age / trail.userData.life;
    trail.material.opacity = 0.6 * (1 - lifeRatio);
    trail.scale.multiplyScalar(1.1);
    
    if (trail.userData.age >= trail.userData.life) {
      scene.remove(trail);
      trail.material.dispose();
      return false;
    }
    return true;
  });
}

/* ==========================
   FOTOS
========================== */
function crearIconoWiiU(texture) {

  const size = 512;
  const radius = 80;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Fondo redondeado azul/morado
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "#6b8cff");
  grad.addColorStop(1, "#8a4fff");

  ctx.fillStyle = grad;
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.drawImage(texture.image, 0, 0, size, size);

  ctx.restore();

  const gloss = ctx.createLinearGradient(0, 0, 0, size * 0.5);
  gloss.addColorStop(0, "rgba(255,255,255,0.35)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, size, size * 0.5);

  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.stroke();

  const newTexture = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: newTexture,
      transparent: true,
      depthWrite: false,
    })
  );

  sprite.material.toneMapped = false;

  return sprite;
}

const spritesFotos = [];
const loader = new THREE.TextureLoader();

regalos.forEach((regalo, idx) => {
  loader.load(regalo.foto, (texture) => {
    const sprite = crearIconoWiiU(texture);

    const angle = (idx / regalos.length) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 4 + Math.random() * 2;
    const baseY = (Math.random() - 0.5) * 2;

    sprite.userData = { angle, radius, baseY, index: idx, isPhoto: true, regalo: regalo,  appearTime: null, unlocked: false, broadcastMinute: horaToMinutes(regalo.hora) };
    sprite.scale.set(0.001, 0.001, 1);
    sprite.position.set(Math.cos(angle) * radius, baseY, Math.sin(angle) * radius);
    sprite.visible = false;
    sprite.material.opacity = 0;
    sprite.scale.multiplyScalar(0.5);
    sprite.userData.appearTime = null;

    spritesFotos.push(sprite);
    scene.add(sprite);
  });
});

function checkPhotoBroadcasts(nowMinutes) {
  let unlockedThisFrame = 0;
  spritesFotos.forEach(sprite => {
    if (sprite.userData.unlocked) return;

    if (nowMinutes >= sprite.userData.broadcastMinute) {
      sprite.userData.unlocked = true;

      // Dispara la animación normal
      sprite.visible = true;
      sprite.userData.appearTime = Date.now();
      unlockedThisFrame++;

      console.log("📡 Foto liberada:", sprite.userData.regalo.autor);
    }
  });
    // SISTEMA DE NOTIFICACION
  // ==========================
  if (unlockedThisFrame > 0) {
    const totalUnlocked = spritesFotos.filter(s => s.userData.unlocked).length;
    const savedUnlocked = getSavedUnlocked();
    const lastVisit = getLastVisit();

    // Si NO es primera visita
    if (lastVisit !== 0 && totalUnlocked > savedUnlocked) {
      const nuevos = totalUnlocked - savedUnlocked;

      showNotification(
        nuevos === 1
          ? "✨ Ha llegado un nuevo recuerdo"
          : `✨ Han llegado ${nuevos} nuevos recuerdos`
      );
    }

    setSavedUnlocked(totalUnlocked);
  }
}
function countUnlockedPhotos(nowMinutes) {
  let total = 0;

  spritesFotos.forEach(sprite => {
    const unlock = sprite.userData.unlockTime;
    if (unlock !== undefined && nowMinutes >= unlock) {
      total++;
    }
  });

  return total;
}
function checkOfflineNotifications() {
  const nowMinutes = getRealMinutes();
  const totalUnlocked = countUnlockedPhotos(nowMinutes);
  const seen = getSeenPhotos();

  // Primera visita → solo guarda estado
  if (!localStorage.getItem("visitedBefore")) {
    localStorage.setItem("visitedBefore", "1");
    setSeenPhotos(totalUnlocked);
    return;
  }

  const newOnes = totalUnlocked - seen;

  if (newOnes > 0) {
    showNotification(`✨ Han llegado ${newOnes} nuevos recuerdos`);
    setSeenPhotos(totalUnlocked);
  }
}

/* ==========================
   INTRO
========================== */
function crearTextoIntro(texto, esPequeno = false) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 512;

  const ctx = c.getContext("2d");

  ctx.shadowColor = '#87ceeb';
  ctx.shadowBlur = 60;
  ctx.fillStyle = '#ffffff';
  const fontSize = esPequeno ? 107 : 100;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, c.width / 2, c.height / 2);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0 })
  );

  const baseScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  const scaleMultiplier = esPequeno ? 0.7 : 0.9;
  
  sprite.scale.set(10, 2.5, 1);
  sprite.position.set(0, 0, 2);
  scene.add(sprite);
  return sprite;
}

const introTexts = [
  { 
    text: "Szk Computer Entertainment presents", 
    small: true, 
    sound: playstationSound,
    fadeInDuration: 1500,
    holdDuration: 5000,
    fadeOutDuration: 1000
  },
  { 
    text: "GumaDev Interactive Studios Production", 
    small: false,
    fadeInDuration: 1500,
    holdDuration: 5000,
    fadeOutDuration: 1000
  },
];
let introIndex = 0;
let introStart = 0;
let introSprite = null;

if (introTexts[introIndex].sound) {
  introTexts[introIndex].sound.play().catch(e => console.log('Audio blocked:', e));
}

let entradaStart = 0;

setTimeout(() => {
  document.getElementById('loading').style.display = 'none';
}, 500);

/* ==========================
   MODALES
========================== */
/* ==========================
   MODALES
========================== */
window.openModal = function(regalo) {
  modalOpen = true;
  playUISound('open');
  
  const modal = document.getElementById('photoModal');
  const photo = document.getElementById('modalPhoto');
  const messageDiv = document.querySelector('.modal-message');
  
  // Configurar contenido
  photo.src = regalo.foto;
  document.getElementById('modalTitle').textContent = regalo.miniTexto;
  document.getElementById('modalMessage').textContent = regalo.mensajeCompleto;
  document.getElementById('modalAuthor').textContent = '— ' + regalo.autor;
  
  // Blur del fondo
  canvas.classList.add('blurred');
  modal.classList.add('active');
  
  // Animaciones con GSAP
  if (typeof gsap !== 'undefined') {
    // Reset inicial
    gsap.set(photo, { scale: 0.7, opacity: 0, rotationY: -15 });
    gsap.set(messageDiv, { x: 50, opacity: 0 });
    
    // Animar foto
    gsap.to(photo, {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 0.6,
      ease: "back.out(1.2)"
    });
    
    // Animar mensaje (con delay)
    gsap.to(messageDiv, {
      x: 0,
      opacity: 1,
      duration: 0.5,
      delay: 0.3,
      ease: "power2.out"
    });
  }
};

window.closeModal = function() {
  const modal = document.getElementById('photoModal');
  const photo = document.getElementById('modalPhoto');
  const messageDiv = document.querySelector('.modal-message');
  
  playUISound('back');
  
  // Animación de salida
  if (typeof gsap !== 'undefined') {
    gsap.to(photo, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });
    
    gsap.to(messageDiv, {
      x: 30,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        modalOpen = false;
        canvas.classList.remove('blurred');
        modal.classList.remove('active');
      }
    });
  } else {
    modalOpen = false;
    canvas.classList.remove('blurred');
    modal.classList.remove('active');
  }
};


window.openCredits = function() {
  modalOpen = true;
  const modal = document.getElementById('creditsModal');
  const content = document.querySelector('.credits-content');
  
  canvas.classList.add('blurred');
  modal.classList.add('active');
  
  if (typeof gsap !== 'undefined') {
    gsap.set(content, { scale: 0.8, opacity: 0, y: 30 });
    gsap.to(content, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "back.out(1.5)"
    });
  }
};

window.closeCredits = function() {
  const modal = document.getElementById('creditsModal');
  const content = document.querySelector('.credits-content');
  
  if (typeof gsap !== 'undefined') {
    gsap.to(content, {
      scale: 0.9,
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        modalOpen = false;
        canvas.classList.remove('blurred');
        modal.classList.remove('active');
      }
    });
  } else {
    modalOpen = false;
    canvas.classList.remove('blurred');
    modal.classList.remove('active');
  }
};
function playUISound(name) {
  if (!uiSounds[name]) return;

  const sound = uiSounds[name].cloneNode();
  sound.volume = 1.0;
  sound.play().catch(() => {});
}
window.toggleMusic = function() {
  playUISound('click');
  const btn = document.getElementById('musicBtn');

  if (!audioUnlocked || !currentGalaxyTrack) return;

  if (currentGalaxyTrack.paused) {
    currentGalaxyTrack.play();
    btn.textContent = '🔊';
  } else {
    const fadeOut = setInterval(() => {
      if (currentGalaxyTrack.volume > 0.05) {
        currentGalaxyTrack.volume -= 0.05;
      } else {
        currentGalaxyTrack.pause();
        currentGalaxyTrack.volume = 0.5;
        clearInterval(fadeOut);
      }
    }, 50);
    btn.textContent = '🔇';
  }
};


/* ==========================
   INPUT
========================== */
let lastX = null;
let lastY = null;
let deltaX = 0;
let deltaY = 0;
let isDragging = false;

function updateInput(x, y) {
  if (currentState !== STATES.EXPLORACION) return;
  if (lastX === null) {
    lastX = x;
    lastY = y;
    return;
  }
  deltaX = (x - lastX) * 0.003;
  deltaY = (y - lastY) * 0.003;
  lastX = x;
  lastY = y;
}

function onCanvasClick(event) {
  if (currentState !== STATES.EXPLORACION || modalOpen) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(spritesFotos.filter(s => s.userData.unlocked));

  if (intersects.length > 0) {
    const clickedSprite = intersects[0].object;
    if (clickedSprite.userData.isPhoto) {
      // Crear efecto de sparkle al hacer click
      createSparkleEffect(clickedSprite.position);
      
      // Vibración en móvil
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      window.openModal(clickedSprite.userData.regalo);
    }
  }
}

// Hover detection para efectos visuales
let lastHoveredPhoto = null;

function onCanvasHover(event) {
  if (currentState !== STATES.EXPLORACION || modalOpen) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(spritesFotos.filter(s => s.userData.unlocked));

  if (intersects.length > 0) {
    const hoveredSprite = intersects[0].object;
    if (hoveredSprite !== lastHoveredPhoto) {
      // Efecto sparkle sutil al hacer hover
      createSparkleEffect(hoveredSprite.position);
      lastHoveredPhoto = hoveredSprite;
      canvas.style.cursor = 'pointer';
    }
  } else {
    lastHoveredPhoto = null;
    canvas.style.cursor = 'grab';
  }
}


canvas.addEventListener("mousedown", () => {
  isDragging = true;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    updateInput(e.clientX, e.clientY);
  } else {
    // Detectar hover cuando no está draggeando
    onCanvasHover(e);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDragging || (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01)) {
    onCanvasClick(e);
  }
  isDragging = false;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("touchstart", (e) => {
  // Detectar pinch (2 dedos)
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
    isDragging = false; // No drag cuando hay pinch
  } else {
    isDragging = true;
    if (e.touches.length) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }
});

let lastPinchDistance = 0;

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  
  // Pinch zoom con 2 dedos
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (lastPinchDistance > 0) {
      const delta = distance - lastPinchDistance;
      camera.fov = THREE.MathUtils.clamp(camera.fov - delta * 0.1, 40, 100);
      camera.updateProjectionMatrix();
    }
    
    lastPinchDistance = distance;
  } else if (e.touches.length && isDragging) {
    updateInput(e.touches[0].clientX, e.touches[0].clientY);
  }
});

canvas.addEventListener("touchend", (e) => {
  // Reset pinch
  if (e.touches.length < 2) {
    lastPinchDistance = 0;
  }
  
  if (!isDragging || (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01)) {
    if (e.changedTouches.length) {
      const touch = e.changedTouches[0];
      onCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }
  isDragging = false;
  lastX = null;
  lastY = null;
});

/* ==========================
   ANIMACIÓN
========================== */
let orbit = 0;
const clock = new THREE.Clock();
let lastFrame = 0;
const FPS = 120;
const frameTime = 1000 / FPS;
let lastFrameTime = 0;
const frameDuration = 1000 / FPS;

function animate(time) {
  requestAnimationFrame(animate);
  if (time - lastFrameTime < frameDuration) return;
  lastFrameTime = time;
  const now = Date.now();
  const elapsedTime = clock.getElapsedTime();
  const nowMinutes = getRealMinutes();
  checkPhotoBroadcasts(nowMinutes);



if (currentState === STATES.INTRO) {
  const t = now - introStart;
  const currentIntroText = introTexts[introIndex];


  const fadeInEnd = currentIntroText.fadeInDuration;
  const holdEnd = fadeInEnd + currentIntroText.holdDuration;
  const fadeOutEnd = holdEnd + currentIntroText.fadeOutDuration;

  if (t < fadeInEnd) {
    introSprite.material.opacity = t / fadeInEnd;
  } 
  else if (t < holdEnd) {
    introSprite.material.opacity = 1;
  } 
  else if (t < fadeOutEnd) {
    introSprite.material.opacity = 1 - (t - holdEnd) / currentIntroText.fadeOutDuration;
  } 
  else {
    scene.remove(introSprite);
    introIndex++;
    
    if (introIndex < introTexts.length) {
      introSprite = crearTextoIntro(introTexts[introIndex].text, introTexts[introIndex].small);
      introStart = now;
      
      if (introTexts[introIndex].sound && audioUnlocked) {
        playAudio(introTexts[introIndex].sound);
      }
    } else {
      currentState = STATES.ENTRADA;
      entradaStart = now;
      
      if (!musicStarted && audioUnlocked) {
        startGalaxyMusic();
        musicStarted = true;
      }
    }
  }

  renderer.render(scene, camera);
  return;
}

  if (currentState === STATES.ENTRADA) {
    const p = Math.min((now - entradaStart) / 3000, 1);
    galaxy.material.opacity = p * 0.95;
    const eased = 1 - Math.pow(1 - p, 3);
    camera.position.z = 12 - eased * 4;

    if (p > 0.3) {
      blackHole.group.visible = true;
      const blackHoleOpacity = Math.min((p - 0.3) / 0.7, 1);
      blackHole.glowLayers.forEach((layer, i) => {
        const t = i / (blackHole.glowLayers.length - 1);
        const baseOpacity = 0.6 * (1 - t * 0.85);
        layer.material.opacity = baseOpacity * blackHoleOpacity;
      });
    }

      if (p >= 1 && currentState === STATES.ENTRADA) {
        const baseTime = Date.now();

        textos.forEach((t, i) => {
          t.userData.appearTime = baseTime + i * 150;
        });

        spritesFotos.forEach((s, i) => {
          s.userData.appearTime = baseTime + 600 + i * 200;
        });

        hints.forEach(h =>
          setTimeout(() => crearHint(h.text), h.delay)
        );
        
        // Hints HUD estáticos (como botones, se quedan fijos en pantalla)
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          setTimeout(() => showHudHint("👉 Desliza para explorar la galaxia"), 3000);
          setTimeout(() => showHudHint("📸 Toca las fotos para ver los mensajes"), 8000);
          setTimeout(() => showHudHint("🎵 Usa el botón de música para ajustar el volumen"), 13000);
        } else {
          setTimeout(() => showHudHint("🖱️ Haz clic y arrastra para explorar la galaxia"), 3000);
          setTimeout(() => showHudHint("✨ Haz clic en las fotos para ver los mensajes"), 8000);
          setTimeout(() => showHudHint("🎵 Usa el botón de música para ajustar el volumen"), 13000);
        }
        
        currentState = STATES.EXPLORACION;
        checkOfflineNotifications();

        if (!sessionStorage.getItem("visit_started")) {
          setLastVisit(Date.now());
          sessionStorage.setItem("visit_started", "1");
        }
        if (!localStorage.getItem("tutorialShown")) {

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
          showBigHint("👉 DESLIZA PARA MOVER LA GALAXIA", 500);
          showBigHint("📸 TOCA LAS FOTOS PARA VER LOS RECUERDOS", 2500);
        } else {
          showBigHint("🖱 HAZ CLICK Y ARRASTRA PARA MOVER LA GALAXIA", 500);
          showBigHint("✨ HAZ CLICK EN LAS FOTOS PARA ABRIR RECUERDOS", 2500);
        }

        localStorage.setItem("tutorialShown", "1");
      }

        document.getElementById('creditsBtn').style.display = 'block';
        document.getElementById('musicBtn').style.display = 'block';
      }
  }

  if (currentState === STATES.EXPLORACION) {

    if (!isDragging && Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
      orbit += 0.0003;
    } else {
      orbit += deltaX;
    }

    deltaX *= 0.92;
    deltaY *= 0.92;
    
    // Actualizar efectos de partículas
    updateParticleEffects();
    
    // Crear star trail cuando hay movimiento rápido
    if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
      createStarTrail();
    }

    galaxy.rotation.y = -orbit * 0.3;
    galaxy.rotation.x = Math.sin(orbit * 0.15) * 0.08;
    
    blackHole.group.rotation.y = elapsedTime * 0.3;
    blackHole.group.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
    
    const pulse = Math.sin(elapsedTime * 2) * 0.5 + 0.5;
    blackHole.light.intensity = 4 + pulse * 3;
    
    blackHole.glowLayers.forEach((layer, i) => {
      const t = i / (blackHole.glowLayers.length - 1);
      const baseOpacity = 0.6 * (1 - t * 0.85);
      layer.material.opacity = baseOpacity * (0.7 + pulse * 0.3);
    });

    camera.position.x = Math.sin(orbit) * 8;
    camera.position.z = Math.cos(orbit) * 8;
    camera.position.y = THREE.MathUtils.clamp(camera.position.y + deltaY * 1.5, -3, 3);

    pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 5;
    pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 5;
    pointLight2.position.x = Math.sin(elapsedTime * 0.3 + Math.PI) * 5;
    pointLight2.position.z = Math.cos(elapsedTime * 0.3 + Math.PI) * 5;
    pointLight3.position.y = 8 + Math.sin(elapsedTime * 0.4) * 2;

    starParticles.forEach((star, i) => {
      star.position.y += star.userData.speed;
      if (star.position.y > 10) star.position.y = -5;
      
      const angle = star.userData.angle + elapsedTime * 0.1;
      star.position.x = Math.cos(angle) * star.userData.radius;
      star.position.z = Math.sin(angle) * star.userData.radius;
      
      star.rotation.y += star.userData.rotSpeed;
      star.rotation.z = Math.sin(elapsedTime + i) * 0.1;
    });

    glitterParticles.rotation.y = elapsedTime * 0.05;
    const positions = glitter.geometry.attributes.position.array;
    for (let i = 0; i < CONFIG.particles.count; i++) {
      const i3 = i * 3;
      if (i % 3 === 0) {
        positions[i3 + 1] += Math.sin(elapsedTime * 2 + i) * 0.01;
      }

    }
    glitter.geometry.attributes.position.needsUpdate = true;

    hintSprites.forEach((h, i) => {
      const t = Date.now() - h.userData.startTime;

      if (t < 1000) {
        h.material.opacity = t / 1000;
      } else if (t > h.userData.life - 1000) {
        h.material.opacity = 1 - (t - (h.userData.life - 1000)) / 1000;
      } else {
        h.material.opacity = 0.6;
      }

      h.position.y += Math.sin(clock.getElapsedTime() + i) * 0.0005;

      h.lookAt(camera.position);

      if (t > h.userData.life) {
        scene.remove(h);
      }
    });



    textos.forEach((t, i) => {
      if (t.userData.appearTime === null) return;

      const appearDuration = 800;
      const progress = THREE.MathUtils.clamp(
        (now - t.userData.appearTime) / appearDuration,
        0,
        1
      );

      t.material.opacity = progress;

      const a = t.userData.angle + orbit * 0.8;
      t.position.x = Math.cos(a) * t.userData.radius;
      t.position.z = Math.sin(a) * t.userData.radius;
      t.position.y =
        t.userData.baseY +
        Math.sin(now * CONFIG.text.floatSpeed + i * 0.5) *
          CONFIG.text.floatAmplitude;

      const s = THREE.MathUtils.lerp(0.001, CONFIG.text.scale, progress);
      t.scale.set(
        s * TEXT_ASPECT, // X
        s,               // Y
        1
      );

      t.lookAt(camera.position);
    });


      spritesFotos.forEach((s, i) => {
        if (s.userData.appearTime === null) return;

        const appearDuration = 1000;
        const progress = THREE.MathUtils.clamp(
          (now - s.userData.appearTime) / appearDuration,
          0,
          1
        );

        s.material.opacity = progress;

        const a = s.userData.angle + orbit * 0.5;
        s.position.x = Math.cos(a) * s.userData.radius;
        s.position.z = Math.sin(a) * s.userData.radius;
        s.position.y =
          s.userData.baseY +
          Math.sin(now * CONFIG.photos.floatSpeed + i * 0.7) *
            CONFIG.photos.floatAmplitude;
            
        // ===== TILT WII U (CORREGIDO) =====
        // Primero hacer que mire a la cámara
        s.lookAt(camera.position);
        
        // Calcular el vector dirección para el tilt
        const dir = new THREE.Vector3();
        dir.subVectors(camera.position, s.position);
        dir.normalize();
        
        // Aplicar tilt basado en la posición relativa
        const tiltAmount = 0.15; // Intensidad del tilt
        const tiltX = THREE.MathUtils.clamp(dir.y * tiltAmount, -0.2, 0.2);
        const tiltZ = THREE.MathUtils.clamp(-dir.x * tiltAmount, -0.2, 0.2);
        
        // Aplicar el tilt como rotación adicional (después del lookAt)
        s.rotateX(tiltX);
        s.rotateZ(tiltZ);

        s.scale.setScalar(
          THREE.MathUtils.lerp(0.001, CONFIG.photos.scale, progress)
        );
          // micro pulso
        const pulse = 1 + Math.sin(elapsedTime * 2 + i) * 0.03;
        s.scale.multiplyScalar(pulse);

      });


    galaxy.rotation.y += 0.00015;
  }

  if (skybox) {
    skybox.material.uniforms.time.value = elapsedTime;
  }

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

if (Math.floor(getRealMinutes()) % 5 === 0){
  console.log("🕒 Hora simulada:", simulatedMinutes.toFixed(2));
}

animate();

/* ==========================
   RESIZE
========================== */
function updateRendererSize() {
  const { w, h } = getViewportSize();

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  adaptCameraForMobile();

  renderer.setSize(w, h, false);
}
window.addEventListener("resize", updateRendererSize);
window.visualViewport?.addEventListener("resize", updateRendererSize);
updateRendererSize();

window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    updateRendererSize();
  }, 300);
});