const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 450;

const GRAVITY = 0.5;
const TILE = 40;

// ASSETS
const playerImg = new Image();
playerImg.src = "assets/player.png";

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

const tileImg = new Image();
tileImg.src = "assets/tiles.png";

const bg = new Image();
bg.src = "assets/background.png";

// SOUND
const jumpSound = new Audio("assets/jump.wav");
const coinSound = new Audio("assets/coin.wav");
const stompSound = new Audio("assets/stomp.wav");

// LEVEL
const level = [
"............................................................",
"............................................................",
"..................C.........................................",
"..............BBB..........................................",
"............................................................",
"......E.....................................................",
"########....##########################################......"
];

// PLAYER 1
const player = {
  x: 100, y: 0, w: 32, h: 32,
  dx: 0, dy: 0, grounded: false,
  frame: 0, coins: 0
};

// PLAYER 2
const player2 = {
  x: 200, y: 0, w: 32, h: 32,
  dx: 0, dy: 0, grounded: false
};

let enemies = [];
let cameraX = 0;
let keys = {};

// INPUT
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// MOBILE
document.getElementById("left").ontouchstart = () => keys["ArrowLeft"] = true;
document.getElementById("left").ontouchend = () => keys["ArrowLeft"] = false;

document.getElementById("right").ontouchstart = () => keys["ArrowRight"] = true;
document.getElementById("right").ontouchend = () => keys["ArrowRight"] = false;

document.getElementById("jump").ontouchstart = () => keys["Space"] = true;
document.getElementById("jump").ontouchend = () => keys["Space"] = false;

// INIT ENEMIES
function initLevel() {
  for (let r = 0; r < level.length; r++) {
    for (let c = 0; c < level[r].length; c++) {
      if (level[r][c] === "E") {
        enemies.push({
          x: c * TILE,
          y: r * TILE,
          w: 32,
          h: 32,
          dx: -1
        });
      }
    }
  }
}

// UPDATE CHARACTER
function updateCharacter(p, leftKey, rightKey, jumpKey) {

  if (keys[leftKey]) p.dx = -4;
  else if (keys[rightKey]) p.dx = 4;
  else p.dx = 0;

  if (keys[jumpKey] && p.grounded) {
    p.dy = -12;
    p.grounded = false;
    jumpSound.play();
  }

  p.dy += GRAVITY;
  p.x += p.dx;
  p.y += p.dy;

  p.grounded = false;

  // COLLISION
  for (let r = 0; r < level.length; r++) {
    for (let c = 0; c < level[r].length; c++) {

      let tile = level[r][c];
      let x = c * TILE;
      let y = r * TILE;

      if (tile === "#" || tile === "B") {
        if (
          p.x < x + TILE &&
          p.x + p.w > x &&
          p.y < y + TILE &&
          p.y + p.h > y
        ) {
          if (p.dy > 0) {
            p.y = y - p.h;
            p.dy = 0;
            p.grounded = true;
          }
        }
      }

      if (tile === "C") {
        if (
          p.x < x + TILE &&
          p.x + p.w > x &&
          p.y < y + TILE &&
          p.y + p.h > y
        ) {
          coinSound.play();
          player.coins++;
          level[r] = level[r].replace("C", ".");
        }
      }
    }
  }
}

// ENEMIES
function updateEnemies() {
  enemies.forEach(e => {
    e.x += e.dx;

    if (
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ) {
      if (player.dy > 0) {
        e.dead = true;
        player.dy = -8;
        stompSound.play();
      } else {
        alert("Game Over");
        location.reload();
      }
    }
  });

  enemies = enemies.filter(e => !e.dead);
}

// DRAW BACKGROUND
function drawBackground() {
  ctx.drawImage(bg, -cameraX * 0.3, 0, canvas.width, canvas.height);
}

// DRAW LEVEL
function drawLevel() {
  for (let r = 0; r < level.length; r++) {
    for (let c = 0; c < level[r].length; c++) {

      let tile = level[r][c];
      let x = c * TILE - cameraX;
      let y = r * TILE;

      if (tile === "#") ctx.drawImage(tileImg, 0, 0, 32, 32, x, y, TILE, TILE);
      if (tile === "B") ctx.drawImage(tileImg, 32, 0, 32, 32, x, y, TILE, TILE);
      if (tile === "C") ctx.drawImage(tileImg, 64, 0, 32, 32, x, y, TILE, TILE);
    }
  }
}

// DRAW
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawLevel();

  ctx.drawImage(playerImg, player.frame * 32, 0, 32, 32,
    player.x - cameraX, player.y, player.w, player.h);

  player.frame = (player.frame + 0.2) % 3;

  // PLAYER 2
  ctx.fillStyle = "green";
  ctx.fillRect(player2.x - cameraX, player2.y, 32, 32);

  enemies.forEach(e => {
    ctx.drawImage(enemyImg, 0, 0, 32, 32,
      e.x - cameraX, e.y, e.w, e.h);
  });

  ctx.fillStyle = "black";
  ctx.fillText("Coins: " + player.coins, 20, 30);
}

// LOOP
function loop() {
  updateCharacter(player, "ArrowLeft", "ArrowRight", "Space");
  updateCharacter(player2, "KeyA", "KeyD", "KeyW");

  updateEnemies();

  cameraX = player.x - 300;

  draw();
  requestAnimationFrame(loop);
}

// START
initLevel();
loop();