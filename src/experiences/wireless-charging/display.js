import * as T from 'three';

const WIDTH = 512;
const HEIGHT = 1024;

// The mesh has baked metre coordinates; keep the display on its assembly so
// docking, isolation and exploded transforms continue to move it with the phone.
export function createPhoneDisplay(root) {
  const node = root.userData.sculptRuntime.nodes.screen;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.minFilter = T.LinearFilter;
  texture.magFilter = T.LinearFilter;
  texture.generateMipmaps = false;
  const material = new T.MeshBasicMaterial({
    map: texture, transparent: true, alphaTest: .02, toneMapped: false,
  });
  const geometry = new T.PlaneGeometry(.070, .147);
  const mesh = new T.Mesh(geometry, material);
  mesh.name = 'Live OLED lock screen';
  mesh.userData.partId = 'screen';
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = .0204;
  node.add(mesh);
  let disposed = false;
  let wasCharging = false;
  let wakeStart = 0;
  let lastFrame = '';

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }
  function label(text, y, size, color, weight = 400) {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(text, WIDTH / 2, y);
  }
  function draw(charging, time, percent) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    // The physical glass has 7 mm corners: its vertical and horizontal pixel
    // radii differ because the texture is not exactly the physical aspect ratio.
    ctx.beginPath();
    ctx.roundRect(0, 0, WIDTH, HEIGHT, {x: 51.2, y: 48.76});
    ctx.clip();
    const wallpaper = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    wallpaper.addColorStop(0, charging ? '#142b3b' : '#09121e');
    wallpaper.addColorStop(.5, charging ? '#164053' : '#0d2330');
    wallpaper.addColorStop(1, '#080e1b');
    ctx.fillStyle = wallpaper;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const glow = ctx.createRadialGradient(420, 700, 20, 420, 700, 610);
    glow.addColorStop(0, charging ? '#287373' : '#143d48');
    glow.addColorStop(1, 'rgba(8,16,30,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Quiet curved wallpaper bands, rather than a reflective glass highlight.
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(129,197,204,${charging ? .09 : .035})`;
      ctx.lineWidth = 44;
      ctx.beginPath();
      ctx.ellipse(550, 770, 260 + i * 80, 410 + i * 90, -.45, 0, Math.PI * 2);
      ctx.stroke();
    }
    const ink = charging ? '#e4f3f2' : '#91a8b3';
    ctx.fillStyle = ink;
    ctx.font = '500 16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', 37, 49);
    // Signal, Wi-Fi and battery are drawn as paths to avoid platform emoji.
    for (let i = 0; i < 4; i++) ctx.fillRect(398 + i * 6, 47 - i * 3, 4, 5 + i * 3);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(438, 47, 5 + i * 5, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
    roundRect(454, 34, 26, 14, 3);
    ctx.stroke();
    ctx.fillRect(481, 38, 3, 6);
    ctx.fillStyle = charging ? '#72ebac' : ink;
    ctx.fillRect(458, 38, 17 * percent / 100, 6);

    label('Thứ Ba, 6 tháng 10', 153, 23, ink, 500);
    label('09:41', 270, 103, ink, 300);
    label(charging ? 'Đã kết nối nguồn điện' : 'Màn hình khóa', 311, 17, charging ? '#a3c9cc' : '#617984');
    if (charging) {
      const elapsed = Math.max(0, time - wakeStart);
      const pulse = .5 + .5 * Math.sin(elapsed * 2.5);
      const ringY = 526;
      ctx.strokeStyle = 'rgba(108,236,168,.12)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, ringY, 103, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#75f0ae';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#62e5a2';
      ctx.shadowBlur = 9 + pulse * 9;
      ctx.beginPath();
      ctx.arc(256, ringY, 103, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percent / 100);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#8ef6bc';
      ctx.beginPath();
      ctx.moveTo(264, 462); ctx.lineTo(243, 495); ctx.lineTo(256, 495);
      ctx.lineTo(248, 518); ctx.lineTo(273, 484); ctx.lineTo(260, 484);
      ctx.closePath(); ctx.fill();
      label(`${percent}%`, 569, 45, '#d9ffe8', 500);
      label('Đang sạc không dây', 692, 28, '#b3f5d0', 500);
      label('Qi · Sạc cảm ứng', 726, 19, '#83b0b3');
      if (elapsed < 1.2) {
        ctx.strokeStyle = `rgba(141,250,188,${.35 * (1 - elapsed / 1.2)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(256, ringY, 110 + elapsed * 50, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Lock-screen flashlight and camera affordances.
    ctx.fillStyle = 'rgba(188,213,218,.10)';
    for (const x of [69, 443]) {
      ctx.beginPath(); ctx.arc(x, 918, 28, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    roundRect(433, 911, 21, 15, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(443.5, 918.5, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(438, 910); ctx.lineTo(440, 907); ctx.lineTo(448, 907); ctx.lineTo(450, 910); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(61, 908); ctx.lineTo(77, 908); ctx.lineTo(73, 916); ctx.lineTo(73, 929); ctx.lineTo(65, 929); ctx.lineTo(65, 916); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = ink;
    roundRect(178, 986, 156, 6, 3); ctx.fill();
    ctx.restore();
    // Expose the original earpiece and front camera geometry through the OLED.
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    roundRect(208, 39, 96, 13, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(365.7, 52.2, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    texture.needsUpdate = true;
  }

  draw(false, 0, 42);
  return {
    update(state, dt) {
      if (disposed) return;
      mesh.visible = state.isolated ? state.selected === 'screen' : state.cover <= .98;
      const charging = Boolean(state.docked && state.dockProgress < .01 &&
        state.mode === 'explore' && state.cover < .01 && state.explode < .01 && state.charging);
      const time = Number.isFinite(state.screenTime) ? state.screenTime : 0;
      if (charging && (!wasCharging || time < wakeStart)) wakeStart = time;
      wasCharging = charging;
      const percent = Math.round(T.MathUtils.clamp(state.soc ?? 42, 0, 100));
      const frame = `${charging}:${percent}:${charging ? Math.floor(time * 15) : 0}`;
      if (frame === lastFrame) return;
      lastFrame = frame;
      draw(charging, time, percent);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      mesh.removeFromParent();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      canvas.width = canvas.height = 1;
    },
  };
}
