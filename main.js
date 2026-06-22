import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ==========================
   AUDIO
========================== */
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

// P7: pool de Audio reutilizables en lugar de cloneNode sin cleanup
const uiSounds = {
  hover: new Audio('./sounds/12.mp3'),
  click: new Audio('./sounds/12.mp3'),
  back:  new Audio('./sounds/15.mp3'),
  start: new Audio('./sounds/14.mp3'),
  open:  new Audio('./sounds/13.mp3')
};
Object.values(uiSounds).forEach(s => { s.volume = 1.0; });

function playUISound(name) {
  const s = uiSounds[name];
  if (!s) return;
  s.currentTime = 0;
  s.play().catch(() => {});
}

let currentGalaxyTrack = null;
let currentGalaxyIndex = -1;
let audioUnlocked = false;
let musicStarted = false;

playstationSound.volume = 0.7;

async function playAudio(audio, fadeIn = false) {
  if (!audioUnlocked) return false;
  try {
    audio.currentTime = 0;
    if (fadeIn) {
      audio.volume = 0;
      await audio.play();
      const id = setInterval(() => {
        if (audio.volume < 0.45) { audio.volume += 0.05; }
        else { audio.volume = 0.5; clearInterval(id); }
      }, 50);
    } else {
      await audio.play();
    }
    return true;
  } catch (e) {
    console.error('Error al reproducir audio:', e);
    return false;
  }
}

async function startGalaxyMusic() {
  if (!audioUnlocked) return;
  if (currentGalaxyTrack) { currentGalaxyTrack.pause(); currentGalaxyTrack = null; }

  // evitar repetir la misma pista
  let index;
  do { index = Math.floor(Math.random() * galaxyPlaylist.length); }
  while (index === currentGalaxyIndex && galaxyPlaylist.length > 1);
  currentGalaxyIndex = index;

  const audio = new Audio(galaxyPlaylist[index]);
  audio.volume = 0;
  try {
    await audio.play();
    const id = setInterval(() => {
      if (audio.volume < 0.45) { audio.volume += 0.05; }
      else { audio.volume = 0.5; clearInterval(id); }
    }, 60);
    audio.addEventListener('ended', startGalaxyMusic);
    currentGalaxyTrack = audio;
  } catch (e) {
    console.warn('No se pudo reproducir música:', e);
  }
}

/* ==========================
   STORAGE  (P9: keys centralizadas, P14: bug unlockTime→broadcastMinute)
========================== */
const STORAGE = {
  LAST_VISIT:    'galaxy_last_visit',
  UNLOCKED:      'galaxy_unlocked_count',
  SEEN_PHOTOS:   'seenPhotos',
  VISITED:       'visitedBefore',
  TUTORIAL:      'tutorialShown',
  SESSION:       'visit_started',
};

const store = {
  get:    k       => localStorage.getItem(k),
  set:    (k, v)  => localStorage.setItem(k, String(v)),
  getInt: (k, d)  => parseInt(localStorage.getItem(k) || d),
};

/* ==========================
   NOTIFICACIONES
========================== */
function showNotification(text) {
  const el = document.getElementById('notification');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

function showBigHint(text, delay = 0) {
  setTimeout(() => {
    const hint = document.createElement('div');
    hint.className = 'big-hint';
    hint.innerText = text;
    document.body.appendChild(hint);
    requestAnimationFrame(() => hint.classList.add('visible'));
    setTimeout(() => {
      hint.classList.remove('visible');
      setTimeout(() => hint.remove(), 800);
    }, 5000);
  }, delay);
}

function showHudHint(text, duration = 5000) {
  const hint = document.createElement('div');
  hint.className = 'hud-hint';
  hint.innerText = text;
  document.body.appendChild(hint);
  requestAnimationFrame(() => hint.classList.add('visible'));
  setTimeout(() => {
    hint.classList.remove('visible');
    setTimeout(() => hint.remove(), 500);
  }, duration);
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
    hora: '03:00'
  },
  {
    foto: './img/2.png',
    miniTexto: '🎁',
    mensajeCompleto: 'Feliz cumpleaños Irene. Espero que disfrutes mucho de este día y te deseo mucha suerte en cualquier proyecto que tengas. TQM.',
    autor: 'liss',
    hora: '03:05'
  },
  {
    foto: './img/3.jpg',
    miniTexto: '💙',
    mensajeCompleto: 'Gracias por tu amistad, sabes que cuentas conmigo para lo que sea, se que estas loca pero las mejores personas lo estan, yo te apoyare como gen a senku',
    autor: 'Jesus',
    hora: '03:00'
  },
  {
    foto: './img/4.jpg',
    miniTexto: '🌟',
    mensajeCompleto: '¡Feliz cumpleaños, Irene! No quería dejar pasar el día sin decirte que, aunque llevamos poco tiempo de conocernos, me da mucho gusto haber coincidido contigo. Es curioso cómo en tan poco tiempo se puede empezar a construir una amistad tan auténtica, y valoro mucho la confianza que hemos ido ganando. Me parece genial que, más allá de los estudios, seamos personas con las que se puede platicar y compartir momentos de calidad como el de hoy.Me la estoy pasando muy bien hoy tomando algo con todos y conociéndonos más a fondo fuera del entorno de siempre. Creo que son estos momentos de convivencia los que realmente cuentan y los que hacen que una amistad crezca de verdad, dejando de lado por un rato las responsabilidades para simplemente disfrutar. Me agrada mucho tu forma de ser y la vibra que transmites, y me da gusto que estemos compartiendo este festejo entre amigos y con la maestra.Te deseo un año increíble, lleno de éxitos en todo lo que te propongas y de muchos más momentos compartidos como este. Espero que este sea solo el primero de muchos cumpleaños que me toque festejar contigo ahora que somos amigos. Disfruta muchísimo tu día, sigue siendo esa gran persona que eres y cuenta conmigo para lo que necesites en este camino que estamos recorriendo. ¡Muchas felicidades, Irene, te mando un fuerte abrazo!',
    autor: 'JuanMa',
    hora: '03:00'
  },
  {
    foto: './img/5.jpg',
    miniTexto: '⭐',
    mensajeCompleto: 'Gracias por cada risa compartida y cada momento inolvidable. Que sigas brillando siempre.',
    autor: 'Urios',
    hora: '03:00'
  },
  {
    foto: './img/6.jpg',
    miniTexto: '💫',
    mensajeCompleto: 'La primera vez que te vi nunca me imagine lo importante que ibas a ser para mi, estos ultimos años me he divertido haciendo y deshaciendo contigo, no me imagino como habria sido todo sin ti, muchas gracias por aparecer en mi vida, se que te lo digo a cada rato pero... "Si sabes que te quiero mucho, verdad? 🥺", jajaja. Feliz cumpleaños!!',
    autor: 'Servin',
    hora: '03:00'
  },
  {
    foto: './img/7.jpg',
    miniTexto: '💫',
    mensajeCompleto: 'Holis Irene💕, no tenemos fotitas juntas pero si tendré siempre un huequito en mi corazón para ti, feliz cumpleaños amiga, te quiero muchote!!!',
    autor: 'Carol',
    hora: '03:00'
  }
];

function horaToMinutes(hora) {
  if (!hora) return Infinity;
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}
function getRealMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/* ==========================
   ESTADOS
========================== */
const STATES = { INTRO: 'intro', ENTRADA: 'entrada', EXPLORACION: 'exploracion' };
let currentState = 'WAITING';
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
    insideColor: '#dbe7ff',
    middleColor: '#87ceeb',
    outsideColor: '#4a9eff',
    randomness: 1.0,
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
  particles: { count: 500, size: 0.10 },
};
const TEXT_ASPECT = CONFIG.text.canvasWidth / CONFIG.text.canvasHeight;

/* ==========================
   PANTALLA DE INICIO
========================== */
function createStartScreen() {
  const startScreen = document.createElement('div');
  startScreen.id = 'startScreen';
  startScreen.innerHTML = `
    <div class="start-content">
      <h1>🌌 Te doy la bienvenida al Memory Galaxy Museum</h1>
      <p>Un regalo especial</p>
      <button id="startButton" class="start-btn">▶ Haz click aqui para Comenzar</button>
      <p class="hint">🎧 Activa el audio para mejor experiencia</p>
    </div>`;
  startScreen.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:linear-gradient(135deg,#0a0a1a 0%,#1a1a3a 100%);
    display:flex;justify-content:center;align-items:center;
    z-index:10000;font-family:Arial,sans-serif;`;
  document.body.appendChild(startScreen);
  return startScreen;
}

const startScreen = createStartScreen();
let experienceStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('startButton');
  if (!btn) { console.error('❌ startButton no encontrado'); return; }

  btn.addEventListener('mouseenter', () => playUISound('hover'));

  btn.addEventListener('click', async () => {
    if (experienceStarted) return;
    experienceStarted = true;
    btn.textContent = 'Iniciando...';
    btn.disabled = true;

    try {
      await playstationSound.play();
      playstationSound.pause();
      playstationSound.currentTime = 0;
    } catch (e) { /* autoplay bloqueado */ }
    audioUnlocked = true;

    startScreen.style.transition = 'opacity 0.5s ease';
    startScreen.style.opacity = '0';

    setTimeout(() => {
      startScreen.remove();
      currentState = STATES.INTRO;
      introStart = Date.now();
      introSprite = crearTextoIntro(introTexts[0].text, introTexts[0].small);
      if (audioUnlocked && introTexts[0].sound) playAudio(introTexts[0].sound);
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
    }, 500);
  });
});

/* ==========================
   ESCENA
========================== */
const canvas = document.getElementById('galaxy');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 8, 60);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.setClearColor(0x050008, 1);

function getViewportSize() {
  return { w: window.visualViewport?.width || window.innerWidth, h: window.visualViewport?.height || window.innerHeight };
}

function adaptCameraForMobile() {
  const isMobile = window.innerWidth < 900;
  const portrait = window.innerHeight > window.innerWidth;
  if (isMobile && portrait)   { camera.position.z = 16; camera.fov = 85; }
  else if (isMobile)          { camera.position.z = 13; camera.fov = 75; }
  else                        { camera.position.z = 12; camera.fov = 75; }
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
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.6, 64, 64), new THREE.MeshBasicMaterial({ color: 0x000000 })));

  const glowLayers = [];
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const m = new THREE.MeshBasicMaterial({
      color: 0xff0000, transparent: true, opacity: 0.6 * (1 - t * 0.85),
      blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.7 + t * 1.5, 32, 32), m);
    glowLayers.push(mesh);
    group.add(mesh);
  }

  const light = new THREE.PointLight(0xff0000, 5, 8);
  group.add(light);
  scene.add(group);
  return { group, glowLayers, light };
}

const blackHole = crearAgujeroNegro();
blackHole.group.visible = false;

/* ==========================
   SKYBOX
========================== */
function crearSkybox() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, fog: false,
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vPos; void main(){ vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float time; varying vec3 vPos;
      void main(){
        float h=normalize(vPos).y*.5+.5;
        vec3 top=vec3(.12,.04,.25), mid=vec3(.04,.01,.08), bottom=vec3(.25,.04,.08);
        vec3 color=mix(bottom,top,h);
        color=mix(color,mid,sin(time*.03)*.5+.5);
        gl_FragColor=vec4(color,1.0);
      }`
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 64), material);
  scene.add(sky);
  return sky;
}
const skybox = crearSkybox();
scene.background = null;

/* ==========================
   ESTRELLAS FLOTANTES
========================== */
function createStarShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.2;
    const a = (i * Math.PI) / 5;
    i === 0 ? shape.moveTo(Math.cos(a)*r, Math.sin(a)*r) : shape.lineTo(Math.cos(a)*r, Math.sin(a)*r);
  }
  shape.closePath();
  return shape;
}

const starParticles = [];
function createFloatingStarParticles() {
  const geometry = new THREE.ExtrudeGeometry(createStarShape(), { depth: 0.05, bevelEnabled: false });
  for (let i = 0; i < 128; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() > 0.5 ? 0x4a9eff : 0x87ceeb,
      transparent: true, opacity: 0.8, emissive: 0x4a9eff, emissiveIntensity: 0.7,
    });
    const star = new THREE.Mesh(geometry, material);
    star.scale.set(0.12, 0.12, 0.12);
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    star.position.set(Math.cos(angle) * radius, -5 + Math.random() * 2, Math.sin(angle) * radius);
    star.userData = { speed: 0.01 + Math.random() * 0.02, angle, radius, rotSpeed: (Math.random() - 0.5) * 0.02 };
    starParticles.push(star);
    scene.add(star);
  }
}
createFloatingStarParticles();

/* ==========================
   TEXTURAS
========================== */
function createStarTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.2,'rgba(255,255,255,0.8)');
  g.addColorStop(0.4,'rgba(255,255,255,0.3)'); g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,32,32);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(0,15,32,2); ctx.fillRect(15,0,2,32);
  ctx.save(); ctx.translate(16,16); ctx.rotate(Math.PI/4);
  ctx.fillRect(-16,-1,32,2); ctx.fillRect(-1,-16,2,32); ctx.restore();
  return new THREE.CanvasTexture(c);
}

function createCircleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.5,'rgba(255,255,255,0.5)'); g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(16,16,16,0,Math.PI*2); ctx.fill();
  return new THREE.CanvasTexture(c);
}

const starTexture   = createStarTexture();
const circleTexture = createCircleTexture();

/* ==========================
   GLITTER  (P5: movimiento oscilante puro, sin acumulación)
========================== */
const glitterParticles = new THREE.Group();
const glitterGeometry  = new THREE.BufferGeometry();
const glitterBaseY     = new Float32Array(CONFIG.particles.count); // P5: guardar Y base
const glitterPositions = new Float32Array(CONFIG.particles.count * 3);
const glitterColors    = new Float32Array(CONFIG.particles.count * 3);

for (let i = 0; i < CONFIG.particles.count; i++) {
  const angle  = Math.random() * Math.PI * 2;
  const radius = 5 + Math.random() * 10;
  const baseY  = (Math.random() - 0.5) * 15;
  glitterBaseY[i]         = baseY;
  glitterPositions[i*3]   = Math.cos(angle) * radius;
  glitterPositions[i*3+1] = baseY;
  glitterPositions[i*3+2] = Math.sin(angle) * radius;
  const col = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.7);
  glitterColors[i*3]=col.r; glitterColors[i*3+1]=col.g; glitterColors[i*3+2]=col.b;
}

glitterGeometry.setAttribute('position', new THREE.BufferAttribute(glitterPositions, 3));
glitterGeometry.setAttribute('color',    new THREE.BufferAttribute(glitterColors, 3));

const glitter = new THREE.Points(glitterGeometry, new THREE.PointsMaterial({
  size: CONFIG.particles.size, vertexColors: true, transparent: true, opacity: 0.9,
  blending: THREE.AdditiveBlending, depthWrite: false, map: circleTexture, alphaTest: 0.001,
}));
glitterParticles.add(glitter);
scene.add(glitterParticles);

/* ==========================
   GALAXIA
========================== */
function crearGalaxia() {
  const geometry  = new THREE.BufferGeometry();
  const positions = new Float32Array(CONFIG.galaxy.count * 3);
  const colors    = new Float32Array(CONFIG.galaxy.count * 3);
  const inside  = new THREE.Color(CONFIG.galaxy.insideColor);
  const middle  = new THREE.Color(CONFIG.galaxy.middleColor);
  const outside = new THREE.Color(CONFIG.galaxy.outsideColor);

  for (let i = 0; i < CONFIG.galaxy.count; i++) {
    const i3 = i * 3;
    const r = 0.8 + Math.pow(Math.random(), 1.5) * (CONFIG.galaxy.radius - 0.8);
    const branchAngle = ((i % CONFIG.galaxy.branches) / CONFIG.galaxy.branches) * Math.PI * 2;
    const spinAngle   = r * CONFIG.galaxy.spin;
    const bx = Math.cos(branchAngle + spinAngle) * r;
    const bz = Math.sin(branchAngle + spinAngle) * r;
    const onArm = Math.random() < 0.8;
    const pf    = onArm ? 12 : 4;
    const spread = CONFIG.galaxy.randomness * r * 0.25;
    const rx = Math.pow(Math.random(), pf) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const ry = Math.pow(Math.random(), pf) * (Math.random() < 0.5 ? 1 : -1) * spread * 0.3;
    const rz = Math.pow(Math.random(), pf) * (Math.random() < 0.5 ? 1 : -1) * spread;
    positions[i3]=bx+rx; positions[i3+1]=ry; positions[i3+2]=bz+rz;

    const nr = (r - 0.8) / (CONFIG.galaxy.radius - 0.8);
    const mc = nr < 0.3 ? inside.clone().lerp(middle, nr / 0.3) : middle.clone().lerp(outside, (nr - 0.3) / 0.7);
    colors[i3]=mc.r; colors[i3+1]=mc.g; colors[i3+2]=mc.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: CONFIG.galaxy.size, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, map: starTexture, alphaTest: 0.001,
  }));
  scene.add(points);
  return points;
}
const galaxy = crearGalaxia();

/* ==========================
   TEXTOS
========================== */
const textos = [];
function crearTexto(mensaje, index) {
  const c = document.createElement('canvas');
  c.width = CONFIG.text.canvasWidth; c.height = CONFIG.text.canvasHeight;
  const ctx = c.getContext('2d');
  ctx.shadowColor = '#ff5cff'; ctx.shadowBlur = 40;
  ctx.fillStyle = '#ffe6ff';
  ctx.font = `bold ${CONFIG.text.fontSize}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) ctx.fillText(mensaje, c.width/2, c.height/2);

  const texture = new THREE.CanvasTexture(c);
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
  const angle  = Math.random() * Math.PI * 2;
  const radius = 2.5 + Math.random() * 2.5;
  sprite.userData = { angle, radius, baseY: (Math.random() - 0.5) * 3, index, isText: true, appearTime: null };
  sprite.position.set(Math.cos(angle) * radius, sprite.userData.baseY, Math.sin(angle) * radius);
  sprite.material.opacity = 0;
  sprite.scale.set(0.001, 0.001, 1);
  textos.push(sprite);
  scene.add(sprite);
}
regalos.forEach((r, i) => crearTexto(r.miniTexto, i));

/* ==========================
   HINTS 3D
========================== */
const hints3D = [
  { text: 'Arrastra para explorar', delay: 2000 },
  { text: 'Toca las fotos',         delay: 7000 },
  { text: 'Algunas guardan algo especial', delay: 12000 },
];
let hintSprites = [];

function crearHint(texto, y = -2) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(232,246,255,0.9)'; ctx.font = '48px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, c.width/2, c.height/2);

  const texture = new THREE.CanvasTexture(c);
  texture.minFilter = texture.magFilter = THREE.LinearFilter;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  sprite.scale.set(6, 1.5, 1);
  sprite.position.set(0, y, 1.5);
  sprite.userData = { startTime: Date.now(), life: 6000 };
  scene.add(sprite);
  hintSprites.push(sprite);
}

/* ==========================
   SPARKLES  (P2+P3: pool con límite, throttle en hover)
========================== */
const SPARKLE_POOL_SIZE = 120;   // máximo de sprites vivos
const sparklePool = [];           // pool reutilizable
let   sparkleActive = [];         // sprites actualmente en uso

// pre-crear el material una sola vez
const sparkleMat = new THREE.SpriteMaterial({
  transparent: true, blending: THREE.AdditiveBlending, depthTest: false, map: starTexture,
});

function getSparkleSprite() {
  // reutilizar uno que haya terminado su vida
  for (let i = 0; i < sparklePool.length; i++) {
    if (!sparklePool[i].visible) return sparklePool[i];
  }
  if (sparklePool.length < SPARKLE_POOL_SIZE) {
    const s = new THREE.Sprite(sparkleMat.clone());
    scene.add(s);
    sparklePool.push(s);
    return s;
  }
  return null; // pool lleno, skip
}

function createSparkleEffect(position) {
  for (let i = 0; i < 15; i++) {
    const s = getSparkleSprite();
    if (!s) break;
    s.material.color.setHSL(0.55 + Math.random() * 0.05, 1.0, 0.65);
    s.position.set(
      position.x + (Math.random() - 0.5) * 0.8,
      position.y + (Math.random() - 0.5) * 0.8,
      position.z + (Math.random() - 0.5) * 0.8
    );
    const sc = 0.2 + Math.random() * 0.15;
    s.scale.setScalar(sc);
    s.material.opacity = 1;
    s.visible = true;
    s.userData = {
      vx: (Math.random()-0.5)*0.03, vy: (Math.random()-0.5)*0.03, vz: (Math.random()-0.5)*0.03,
      life: 50 + Math.random() * 30, age: 0, initialScale: sc,
    };
    sparkleActive.push(s);
  }
}

// P3: throttle de hover (máximo 1 sparkle event cada 100ms)
let lastSparkleTime = 0;

function updateParticleEffects() {
  for (let i = sparkleActive.length - 1; i >= 0; i--) {
    const p = sparkleActive[i];
    p.userData.age++;
    p.position.x += p.userData.vx;
    p.position.y += p.userData.vy;
    p.position.z += p.userData.vz;

    const lr = p.userData.age / p.userData.life;
    p.material.opacity = lr < 0.2 ? lr * 5 : lr > 0.7 ? (1 - lr) * 3.33 : 1;
    p.scale.setScalar(p.userData.initialScale * (1 + Math.sin(p.userData.age * 0.2) * 0.3));

    if (p.userData.age >= p.userData.life) {
      p.visible = false;
      sparkleActive.splice(i, 1);
    }
  }
}

/* ==========================
   FOTOS (icono Wii U)
========================== */
function crearIconoWiiU(texture) {
  const size = 512, r = 80;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');

  ctx.beginPath();
  ctx.moveTo(r,0); ctx.lineTo(size-r,0); ctx.quadraticCurveTo(size,0,size,r);
  ctx.lineTo(size,size-r); ctx.quadraticCurveTo(size,size,size-r,size);
  ctx.lineTo(r,size); ctx.quadraticCurveTo(0,size,0,size-r);
  ctx.lineTo(0,r); ctx.quadraticCurveTo(0,0,r,0); ctx.closePath();

  const grad = ctx.createLinearGradient(0,0,0,size);
  grad.addColorStop(0,'#6b8cff'); grad.addColorStop(1,'#8a4fff');
  ctx.fillStyle = grad; ctx.fill();

  ctx.save(); ctx.clip(); ctx.drawImage(texture.image,0,0,size,size); ctx.restore();

  const gloss = ctx.createLinearGradient(0,0,0,size*0.5);
  gloss.addColorStop(0,'rgba(255,255,255,0.35)'); gloss.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = gloss; ctx.fillRect(0,0,size,size*0.5);
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  sprite.material.toneMapped = false;
  return sprite;
}

const spritesFotos = [];
const loader = new THREE.TextureLoader();

// P6: vector reutilizable fuera del loop de animación
const _dir = new THREE.Vector3();

regalos.forEach((regalo, idx) => {
  loader.load(regalo.foto, (texture) => {
    const sprite = crearIconoWiiU(texture);
    const angle  = (idx / regalos.length) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 4 + Math.random() * 2;
    sprite.userData = {
      angle, radius, baseY: (Math.random() - 0.5) * 2,
      index: idx, isPhoto: true, regalo,
      appearTime: null, unlocked: false,
      broadcastMinute: horaToMinutes(regalo.hora),
    };
    sprite.scale.set(0.001, 0.001, 1);
    sprite.position.set(Math.cos(angle) * radius, sprite.userData.baseY, Math.sin(angle) * radius);
    sprite.visible = false;
    sprite.material.opacity = 0;
    spritesFotos.push(sprite);
    scene.add(sprite);
  });
});

/* ==========================
   BROADCAST  (P4: solo se evalúa 1 vez por minuto real)
========================== */
let lastCheckedMinute = -1;

function checkPhotoBroadcasts(nowMinutes) {
  // P4: salir inmediatamente si el minuto no cambió
  if (nowMinutes === lastCheckedMinute) return;
  lastCheckedMinute = nowMinutes;

  let newlyUnlocked = 0;
  spritesFotos.forEach(sprite => {
    if (sprite.userData.unlocked) return;
    if (nowMinutes >= sprite.userData.broadcastMinute) {
      sprite.userData.unlocked = true;
      sprite.visible = true;
      sprite.userData.appearTime = Date.now();
      newlyUnlocked++;
      console.log('📡 Foto liberada:', sprite.userData.regalo.autor);
    }
  });

  if (newlyUnlocked > 0) {
    const totalUnlocked = spritesFotos.filter(s => s.userData.unlocked).length;
    const savedUnlocked = store.getInt(STORAGE.UNLOCKED, 0);
    if (store.get(STORAGE.LAST_VISIT) !== null && totalUnlocked > savedUnlocked) {
      showNotification(newlyUnlocked === 1 ? '✨ Ha llegado un nuevo recuerdo' : `✨ Han llegado ${newlyUnlocked} nuevos recuerdos`);
    }
    store.set(STORAGE.UNLOCKED, totalUnlocked);
  }
}

function checkOfflineNotifications() {
  const nowMinutes   = getRealMinutes();
  // P14: usar broadcastMinute (no unlockTime que no existía)
  const totalUnlocked = spritesFotos.filter(s => nowMinutes >= s.userData.broadcastMinute).length;
  const seen = store.getInt(STORAGE.SEEN_PHOTOS, 0);

  if (!store.get(STORAGE.VISITED)) {
    store.set(STORAGE.VISITED, '1');
    store.set(STORAGE.SEEN_PHOTOS, totalUnlocked);
    return;
  }
  const newOnes = totalUnlocked - seen;
  if (newOnes > 0) {
    showNotification(`✨ Han llegado ${newOnes} nuevos recuerdos`);
    store.set(STORAGE.SEEN_PHOTOS, totalUnlocked);
  }
}

/* ==========================
   INTRO
========================== */
function crearTextoIntro(texto, esPequeno = false) {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512;
  const ctx = c.getContext('2d');
  ctx.shadowColor = '#87ceeb'; ctx.shadowBlur = 60;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${esPequeno ? 107 : 100}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, c.width/2, c.height/2);

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0 }));
  sprite.scale.set(10, 2.5, 1);
  sprite.position.set(0, 0, 2);
  scene.add(sprite);
  return sprite;
}

const introTexts = [
  { text: 'Szk Computer Entertainment presents', small: true,  sound: playstationSound, fadeInDuration: 1500, holdDuration: 5000, fadeOutDuration: 1000 },
  { text: 'GumaDev Interactive Studios Production', small: false, fadeInDuration: 1500, holdDuration: 5000, fadeOutDuration: 1000 },
];
let introIndex  = 0;
let introStart  = 0;
let introSprite = null;
let entradaStart = 0;

setTimeout(() => { document.getElementById('loading').style.display = 'none'; }, 500);

/* ==========================
   MODALES
========================== */
window.openModal = function(regalo) {
  modalOpen = true;
  playUISound('open');
  document.getElementById('modalPhoto').src    = regalo.foto;
  document.getElementById('modalTitle').textContent   = regalo.miniTexto;
  document.getElementById('modalMessage').textContent = regalo.mensajeCompleto;
  document.getElementById('modalAuthor').textContent  = '— ' + regalo.autor;
  canvas.classList.add('blurred');
  document.getElementById('photoModal').classList.add('active');

  if (typeof gsap !== 'undefined') {
    const photo = document.getElementById('modalPhoto');
    const msg   = document.querySelector('.modal-message');
    gsap.set(photo, { scale: 0.7, opacity: 0, rotationY: -15 });
    gsap.set(msg,   { x: 50, opacity: 0 });
    gsap.to(photo,  { scale: 1, opacity: 1, rotationY: 0, duration: 0.6, ease: 'back.out(1.2)' });
    gsap.to(msg,    { x: 0,  opacity: 1,              duration: 0.5, delay: 0.3, ease: 'power2.out' });
  }
};

window.closeModal = function() {
  playUISound('back');
  if (typeof gsap !== 'undefined') {
    const photo = document.getElementById('modalPhoto');
    const msg   = document.querySelector('.modal-message');
    gsap.to(photo, { scale: 0.8, opacity: 0, duration: 0.3, ease: 'power2.in' });
    gsap.to(msg,   { x: 30,     opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: _closeModalDOM });
  } else { _closeModalDOM(); }
};
function _closeModalDOM() {
  modalOpen = false;
  canvas.classList.remove('blurred');
  document.getElementById('photoModal').classList.remove('active');
}

window.openCredits = function() {
  modalOpen = true;
  canvas.classList.add('blurred');
  document.getElementById('creditsModal').classList.add('active');
  if (typeof gsap !== 'undefined') {
    const c = document.querySelector('.credits-content');
    gsap.set(c, { scale: 0.8, opacity: 0, y: 30 });
    gsap.to(c,  { scale: 1,   opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
  }
};

window.closeCredits = function() {
  if (typeof gsap !== 'undefined') {
    gsap.to(document.querySelector('.credits-content'), {
      scale: 0.9, opacity: 0, y: -20, duration: 0.3, ease: 'power2.in',
      onComplete: _closeCreditsDOM
    });
  } else { _closeCreditsDOM(); }
};
function _closeCreditsDOM() {
  modalOpen = false;
  canvas.classList.remove('blurred');
  document.getElementById('creditsModal').classList.remove('active');
}

window.toggleMusic = function() {
  playUISound('click');
  if (!audioUnlocked || !currentGalaxyTrack) return;
  const btn = document.getElementById('musicBtn');
  if (currentGalaxyTrack.paused) {
    currentGalaxyTrack.play();
    btn.textContent = '🔊';
  } else {
    const id = setInterval(() => {
      if (currentGalaxyTrack.volume > 0.05) { currentGalaxyTrack.volume -= 0.05; }
      else { currentGalaxyTrack.pause(); currentGalaxyTrack.volume = 0.5; clearInterval(id); }
    }, 50);
    btn.textContent = '🔇';
  }
};

/* ==========================
   INPUT
========================== */
let lastX = null, lastY = null, deltaX = 0, deltaY = 0, isDragging = false, lastPinchDistance = 0;
let lastHoveredPhoto = null;

function updateInput(x, y) {
  if (currentState !== STATES.EXPLORACION) return;
  if (lastX === null) { lastX = x; lastY = y; return; }
  deltaX = (x - lastX) * 0.003;
  deltaY = (y - lastY) * 0.003;
  lastX = x; lastY = y;
}

function onCanvasClick(event) {
  if (currentState !== STATES.EXPLORACION || modalOpen) return;
  mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(spritesFotos.filter(s => s.userData.unlocked));
  if (hits.length > 0 && hits[0].object.userData.isPhoto) {
    createSparkleEffect(hits[0].object.position);
    if ('vibrate' in navigator) navigator.vibrate(50);
    window.openModal(hits[0].object.userData.regalo);
  }
}

function onCanvasHover(event) {
  if (currentState !== STATES.EXPLORACION || modalOpen) return;
  // P3: throttle — sparkle máximo cada 100ms
  const now = performance.now();
  mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(spritesFotos.filter(s => s.userData.unlocked));
  if (hits.length > 0) {
    const hovered = hits[0].object;
    canvas.style.cursor = 'pointer';
    if (hovered !== lastHoveredPhoto) {
      lastHoveredPhoto = hovered;
      if (now - lastSparkleTime > 100) { createSparkleEffect(hovered.position); lastSparkleTime = now; }
    }
  } else {
    lastHoveredPhoto = null;
    canvas.style.cursor = 'grab';
  }
}

canvas.addEventListener('mousedown', () => { isDragging = true; lastX = null; lastY = null; });
canvas.addEventListener('mousemove', e => { isDragging ? updateInput(e.clientX, e.clientY) : onCanvasHover(e); });
canvas.addEventListener('mouseup',   e => { if (!isDragging || (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01)) onCanvasClick(e); isDragging = false; lastX = null; lastY = null; });
canvas.addEventListener('mouseleave',() => { isDragging = false; lastX = null; lastY = null; });

canvas.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastPinchDistance = Math.sqrt(dx*dx + dy*dy);
    isDragging = false;
  } else {
    isDragging = true;
    if (e.touches.length) { lastX = e.touches[0].clientX; lastY = e.touches[0].clientY; }
  }
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (lastPinchDistance > 0) {
      camera.fov = THREE.MathUtils.clamp(camera.fov - (dist - lastPinchDistance) * 0.1, 40, 100);
      camera.updateProjectionMatrix();
    }
    lastPinchDistance = dist;
  } else if (e.touches.length && isDragging) {
    updateInput(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });

canvas.addEventListener('touchend', e => {
  if (e.touches.length < 2) lastPinchDistance = 0;
  if (!isDragging || (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01)) {
    if (e.changedTouches.length) onCanvasClick({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
  }
  isDragging = false; lastX = null; lastY = null;
});

/* ==========================
   ANIMACIÓN
========================== */
let orbit = 0;
const clock = new THREE.Clock();
const FRAME_DURATION = 1000 / 120; // P13: una sola constante
let lastFrameTime = 0;

function animate(time) {
  requestAnimationFrame(animate);
  if (time - lastFrameTime < FRAME_DURATION) return;
  lastFrameTime = time;

  const now         = Date.now();
  const elapsedTime = clock.getElapsedTime();
  const nowMinutes  = getRealMinutes();

  // P4: checkPhotoBroadcasts ahora es O(1) si el minuto no cambió
  checkPhotoBroadcasts(nowMinutes);

  /* ---- INTRO ---- */
  if (currentState === STATES.INTRO) {
    const t   = now - introStart;
    const cfg = introTexts[introIndex];
    const fi  = cfg.fadeInDuration, ho = fi + cfg.holdDuration, fo = ho + cfg.fadeOutDuration;

    if      (t < fi) introSprite.material.opacity = t / fi;
    else if (t < ho) introSprite.material.opacity = 1;
    else if (t < fo) introSprite.material.opacity = 1 - (t - ho) / cfg.fadeOutDuration;
    else {
      scene.remove(introSprite);
      introIndex++;
      if (introIndex < introTexts.length) {
        introSprite = crearTextoIntro(introTexts[introIndex].text, introTexts[introIndex].small);
        introStart  = now;
        if (introTexts[introIndex].sound && audioUnlocked) playAudio(introTexts[introIndex].sound);
      } else {
        currentState = STATES.ENTRADA;
        entradaStart = now;
        if (!musicStarted && audioUnlocked) { startGalaxyMusic(); musicStarted = true; }
      }
    }
    renderer.render(scene, camera);
    return;
  }

  /* ---- ENTRADA ---- */
  if (currentState === STATES.ENTRADA) {
    const p = Math.min((now - entradaStart) / 3000, 1);
    galaxy.material.opacity = p * 0.95;
    camera.position.z = 12 - (1 - Math.pow(1 - p, 3)) * 4;

    if (p > 0.3) {
      blackHole.group.visible = true;
      const bho = Math.min((p - 0.3) / 0.7, 1);
      blackHole.glowLayers.forEach((layer, i) => {
        layer.material.opacity = 0.6 * (1 - (i/7) * 0.85) * bho;
      });
    }

    if (p >= 1 && currentState === STATES.ENTRADA) {
      const baseTime = Date.now();
      textos.forEach((t, i) => { t.userData.appearTime = baseTime + i * 150; });
      spritesFotos.forEach((s, i) => { s.userData.appearTime = baseTime + 600 + i * 200; });
      hints3D.forEach(h => setTimeout(() => crearHint(h.text), h.delay));

      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTimeout(() => showHudHint('👉 Desliza para explorar la galaxia'), 3000);
        setTimeout(() => showHudHint('📸 Toca las fotos para ver los mensajes'), 8000);
        setTimeout(() => showHudHint('🎵 Usa el botón de música para ajustar el volumen'), 13000);
      } else {
        setTimeout(() => showHudHint('🖱️ Haz clic y arrastra para explorar la galaxia'), 3000);
        setTimeout(() => showHudHint('✨ Haz clic en las fotos para ver los mensajes'), 8000);
        setTimeout(() => showHudHint('🎵 Usa el botón de música para ajustar el volumen'), 13000);
      }

      currentState = STATES.EXPLORACION;
      checkOfflineNotifications();

      if (!sessionStorage.getItem(STORAGE.SESSION)) {
        store.set(STORAGE.LAST_VISIT, Date.now());
        sessionStorage.setItem(STORAGE.SESSION, '1');
      }

      if (!store.get(STORAGE.TUTORIAL)) {
        if (isMobile) {
          showBigHint('👉 DESLIZA PARA MOVER LA GALAXIA', 500);
          showBigHint('📸 TOCA LAS FOTOS PARA VER LOS RECUERDOS', 2500);
        } else {
          showBigHint('🖱 HAZ CLICK Y ARRASTRA PARA MOVER LA GALAXIA', 500);
          showBigHint('✨ HAZ CLICK EN LAS FOTOS PARA ABRIR RECUERDOS', 2500);
        }
        store.set(STORAGE.TUTORIAL, '1');
      }

      document.getElementById('creditsBtn').style.display = 'block';
      document.getElementById('musicBtn').style.display   = 'block';
    }
  }

  /* ---- EXPLORACIÓN ---- */
  if (currentState === STATES.EXPLORACION) {
    orbit += (isDragging || Math.abs(deltaX) >= 0.0001) ? deltaX : 0.0003;
    deltaX *= 0.92; deltaY *= 0.92;

    updateParticleEffects();

    galaxy.rotation.y = -orbit * 0.3;
    galaxy.rotation.x = Math.sin(orbit * 0.15) * 0.08;
    galaxy.rotation.y += 0.00015;

    blackHole.group.rotation.y = elapsedTime * 0.3;
    blackHole.group.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
    const pulse = Math.sin(elapsedTime * 2) * 0.5 + 0.5;
    blackHole.light.intensity = 4 + pulse * 3;
    blackHole.glowLayers.forEach((layer, i) => {
      layer.material.opacity = 0.6 * (1 - (i/7) * 0.85) * (0.7 + pulse * 0.3);
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
      const a = star.userData.angle + elapsedTime * 0.1;
      star.position.x = Math.cos(a) * star.userData.radius;
      star.position.z = Math.sin(a) * star.userData.radius;
      star.rotation.y += star.userData.rotSpeed;
      star.rotation.z  = Math.sin(elapsedTime + i) * 0.1;
    });

    // P5: glitter oscila alrededor de Y base, sin acumulación
    glitterParticles.rotation.y = elapsedTime * 0.05;
    const pos = glitter.geometry.attributes.position.array;
    for (let i = 0; i < CONFIG.particles.count; i++) {
      pos[i*3+1] = glitterBaseY[i] + Math.sin(elapsedTime * 2 + i) * 0.3;
    }
    glitter.geometry.attributes.position.needsUpdate = true;

    // P8: filtrar hints muertos del array
    hintSprites = hintSprites.filter(h => {
      const t  = Date.now() - h.userData.startTime;
      const alive = t < h.userData.life;
      if (alive) {
        h.material.opacity = t < 1000 ? t/1000 : t > h.userData.life - 1000 ? (h.userData.life - t)/1000 : 0.6;
        h.position.y += Math.sin(clock.getElapsedTime()) * 0.0005;
        h.lookAt(camera.position);
      } else {
        scene.remove(h);
      }
      return alive;
    });

    textos.forEach((t, i) => {
      if (t.userData.appearTime === null) return;
      const progress = THREE.MathUtils.clamp((now - t.userData.appearTime) / 800, 0, 1);
      t.material.opacity = progress;
      const a = t.userData.angle + orbit * 0.8;
      t.position.x = Math.cos(a) * t.userData.radius;
      t.position.z = Math.sin(a) * t.userData.radius;
      t.position.y = t.userData.baseY + Math.sin(now * CONFIG.text.floatSpeed + i * 0.5) * CONFIG.text.floatAmplitude;
      t.scale.set(THREE.MathUtils.lerp(0.001, CONFIG.text.scale, progress) * TEXT_ASPECT, THREE.MathUtils.lerp(0.001, CONFIG.text.scale, progress), 1);
      t.lookAt(camera.position);
    });

    spritesFotos.forEach((s, i) => {
      if (s.userData.appearTime === null) return;
      const progress = THREE.MathUtils.clamp((now - s.userData.appearTime) / 1000, 0, 1);
      s.material.opacity = progress;
      const a = s.userData.angle + orbit * 0.5;
      s.position.x = Math.cos(a) * s.userData.radius;
      s.position.z = Math.sin(a) * s.userData.radius;
      s.position.y = s.userData.baseY + Math.sin(now * CONFIG.photos.floatSpeed + i * 0.7) * CONFIG.photos.floatAmplitude;
      s.lookAt(camera.position);
      // P6: _dir reutilizado, no new Vector3 cada frame
      _dir.subVectors(camera.position, s.position).normalize();
      s.rotateX(THREE.MathUtils.clamp( _dir.y * 0.15, -0.2, 0.2));
      s.rotateZ(THREE.MathUtils.clamp(-_dir.x * 0.15, -0.2, 0.2));
      const sc = THREE.MathUtils.lerp(0.001, CONFIG.photos.scale, progress) * (1 + Math.sin(elapsedTime * 2 + i) * 0.03);
      s.scale.setScalar(sc);
    });
  }

  if (skybox) skybox.material.uniforms.time.value = elapsedTime;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

animate();

/* ==========================
   RESIZE
========================== */
function updateRendererSize() {
  const { w, h } = getViewportSize();
  camera.aspect = w / h;
  adaptCameraForMobile();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', updateRendererSize);
window.visualViewport?.addEventListener('resize', updateRendererSize);
window.addEventListener('orientationchange', () => setTimeout(updateRendererSize, 300));
updateRendererSize();
