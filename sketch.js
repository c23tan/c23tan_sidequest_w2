// Y-position of the floor (ground level)
let floorY3;

// Player character (excited, happy blob)
let blob3 = {
  x: 80,
  y: 0,

  // Visual properties
  r: 26,
  points: 56,
  wobble: 10,
  wobbleFreq: 1.4,

  // Animation timing
  t: 0,
  tSpeed: 0.025,

  // Physics
  vx: 0,
  vy: 0,

  // Movement tuning (floaty + joyful)
  accel: 0.6,
  maxRun: 4.5,
  gravity: 0.4,
  jumpV: -14.5,

  onGround: false,

  frictionAir: 0.998,
  frictionGround: 0.9,
};

// Platforms
let platforms = [];

// Clouds
let clouds = [];

function setup() {
  createCanvas(640, 360);

  floorY3 = height - 36;

  noStroke();
  textFont("sans-serif");
  textSize(14);

  // Platforms: higher + shorter
  platforms = [
    { x: 0, y: floorY3, w: width, h: height - floorY3 },
    { x: 110, y: floorY3 - 80, w: 90, h: 14 },
    { x: 260, y: floorY3 - 140, w: 85, h: 14 },
    { x: 400, y: floorY3 - 200, w: 80, h: 14 },
    { x: 520, y: floorY3 - 260, w: 75, h: 14 },
  ];

  // Create fluffy clouds
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: random(width),
      y: random(40, 160),
      s: random(0.8, 1.3),
      speed: random(0.2, 0.5),
    });
  }

  blob3.y = floorY3 - blob3.r - 1;
}

function draw() {
  // Sky background
  background(255, 230, 245);

  // --- Draw clouds ---
  drawClouds();

  // --- Draw platforms ---
  fill(255, 200, 220);
  for (const p of platforms) {
    rect(p.x, p.y, p.w, p.h, 8);
  }

  // --- Input ---
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob3.vx += blob3.accel * move;

  // --- Friction + clamp ---
  blob3.vx *= blob3.onGround ? blob3.frictionGround : blob3.frictionAir;
  blob3.vx = constrain(blob3.vx, -blob3.maxRun, blob3.maxRun);

  // --- Gravity ---
  blob3.vy += blob3.gravity;

  // --- Collision box ---
  let box = {
    x: blob3.x - blob3.r,
    y: blob3.y - blob3.r,
    w: blob3.r * 2,
    h: blob3.r * 2,
  };

  // Horizontal collision
  box.x += blob3.vx;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vx > 0) box.x = s.x - box.w;
      else if (blob3.vx < 0) box.x = s.x + s.w;
      blob3.vx = 0;
    }
  }

  // Vertical collision
  box.y += blob3.vy;
  blob3.onGround = false;

  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vy > 0) {
        box.y = s.y - box.h;
        blob3.vy = 0;
        blob3.onGround = true;
        blob3.wobble = 14;
      } else if (blob3.vy < 0) {
        box.y = s.y + s.h;
        blob3.vy = 0;
      }
    }
  }

  // Apply position
  blob3.x = box.x + box.w / 2;
  blob3.y = box.y + box.h / 2;
  blob3.x = constrain(blob3.x, blob3.r, width - blob3.r);

  // Ease wobble
  blob3.wobble = lerp(blob3.wobble, 10, 0.1);

  // Draw blob
  blob3.t += blob3.tSpeed;
  drawBlobCircle(blob3);

  // HUD
  fill(120);
  text("Excited / Happy Mode 💕  Float through the clouds", 10, 18);
}

// ---- Clouds ----
function drawClouds() {
  fill(255, 255, 255, 220);

  for (const c of clouds) {
    push();
    translate(c.x, c.y);
    scale(c.s);

    ellipse(0, 0, 50, 30);
    ellipse(-20, 5, 40, 25);
    ellipse(20, 5, 40, 25);
    ellipse(0, -10, 35, 25);

    pop();

    // Drift
    c.x += c.speed;
    if (c.x > width + 60) c.x = -60;
  }
}

// AABB overlap test
function overlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// Draw pink blob
function drawBlobCircle(b) {
  fill(255, 120, 180);
  beginShape();

  for (let i = 0; i < b.points; i++) {
    const a = (i / b.points) * TAU;

    const n = noise(
      cos(a) * b.wobbleFreq + 100,
      sin(a) * b.wobbleFreq + 100,
      b.t,
    );

    const r = b.r + map(n, 0, 1, -b.wobble, b.wobble);
    vertex(b.x + cos(a) * r, b.y + sin(a) * r);
  }

  endShape(CLOSE);
}

// Jump input
function keyPressed() {
  if (
    (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) &&
    blob3.onGround
  ) {
    blob3.vy = blob3.jumpV;
    blob3.onGround = false;
    blob3.wobble = 16;
  }
}
