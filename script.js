const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stitchImg = new Image();
stitchImg.src = "Basket.png";

const cupcakeImgs = ["cupcake1.png", "cupcake2.png"].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

const bonusImg = new Image();
bonusImg.src = "bonus.png";
const bombImg = new Image();
bombImg.src = "bomb.png";
const luckyImg = new Image();
luckyImg.src = "lucky.png";
const timerImg = new Image();
timerImg.src = "timer.png";

const soundCatch = new Audio("catch.mp3");
const soundBonus = new Audio("bonus.mp3");
const soundBomb = new Audio("bomb.mp3");

let stitch = { x: 100, y: 0, width: 100, height: 80 };
let cakes = [];
let score = 0, missed = 0, timeLeft = 30, highScore = 0;
let isRunning = false, freezeTime = false, timerInterval;

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.95, 600);
  canvas.height = Math.min(window.innerHeight * 0.6, 400);
  stitch.y = canvas.height - 80;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  stitch.y = canvas.height - 80;
});

function drawStitch() {
  ctx.drawImage(stitchImg, stitch.x, stitch.y, stitch.width, stitch.height);
}

function drawCakes() {
  cakes.forEach(cake => ctx.drawImage(cake.image, cake.x - 25, cake.y - 25, 50, 50));
}

function updateCakes() {
  cakes.forEach(cake => cake.y += cake.speed);
  cakes = cakes.filter(cake => {
    if (cake.y > canvas.height) {
      missed++;
      document.getElementById("missed").textContent = missed;
      return false;
    }
    return true;
  });
}

function checkCollision() {
  for (let i = cakes.length - 1; i >= 0; i--) {
    const cake = cakes[i];
    if (
      cake.x > stitch.x &&
      cake.x < stitch.x + stitch.width &&
      cake.y + 25 > stitch.y &&
      cake.y - 25 < stitch.y + stitch.height
    ) {
      switch (cake.type) {
        case "bonus": score += 5; soundBonus.play(); break;
        case "bomb": soundBomb.play(); endGame(true); return;
        case "lucky": freezeTimer(5); soundBonus.play(); break;
        case "timer": timeLeft += 10; document.getElementById("timer").textContent = timeLeft; soundBonus.play(); break;
        default: score += 1; soundCatch.play();
      }
      document.getElementById("score").textContent = score;
      cakes.splice(i, 1);
    }
  }
}

function spawnCake() {
  const x = Math.random() * (canvas.width - 40) + 20;
  const rand = Math.random();
  let type = "normal";
  let img = cupcakeImgs[Math.floor(Math.random() * cupcakeImgs.length)];

  if (rand < 0.1) { type = "bonus"; img = bonusImg; }
  else if (rand < 0.15) { type = "bomb"; img = bombImg; }
  else if (rand < 0.18) { type = "lucky"; img = luckyImg; }
  else if (rand < 0.21) { type = "timer"; img = timerImg; }

  cakes.push({ x, y: 0, speed: 2 + Math.random() * 2, type, image: img });
}

function gameLoop() {
  if (!isRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStitch();
  drawCakes();
  updateCakes();
  checkCollision();
  if (Math.random() < 0.02) spawnCake();
  requestAnimationFrame(gameLoop);
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!freezeTime) timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function freezeTimer(seconds) {
  freezeTime = true;
  setTimeout(() => (freezeTime = false), seconds * 1000);
}

function restartGame() {
  score = 0; missed = 0; timeLeft = 30; cakes = [];
  isRunning = true;
  document.getElementById("score").textContent = score;
  document.getElementById("missed").textContent = missed;
  document.getElementById("timer").textContent = timeLeft;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOverPopup").classList.add("hidden");
  clearInterval(timerInterval);
  startTimer();
  gameLoop();
}

document.getElementById("gameOverRestart").addEventListener("click", restartGame);
document.getElementById("gameOverHome").addEventListener("click", goHome);

function endGame(bombCaught = false) {
  isRunning = false;
  clearInterval(timerInterval);
  if (score > highScore) {
    highScore = score;
    document.getElementById("highScore").textContent = highScore;
  }
  const message = bombCaught ? "💥 You caught a cherry bomb! Game Over!" : `🎉 You caught ${score} cakes! You're a birthday hero!`;
  document.getElementById("finalScore").textContent = score;
  document.querySelector("#gameOverPopup h2").textContent = message;
  document.getElementById("gameOverPopup").classList.remove("hidden");
}

function goHome() {
  window.location.href = "index.html";
}

document.getElementById("leftBtn").addEventListener("click", () => {
  stitch.x -= 30;
  if (stitch.x < 0) stitch.x = 0;
});

document.getElementById("rightBtn").addEventListener("click", () => {
  stitch.x += 30;
  if (stitch.x + stitch.width > canvas.width) stitch.x = canvas.width - stitch.width;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  stitch.x = e.clientX - rect.left - stitch.width / 2;
});

canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  stitch.x = touch.clientX - rect.left - stitch.width / 2;
});

const allImages = [...cupcakeImgs, bonusImg, bombImg, luckyImg, timerImg, stitchImg];
let imagesLoaded = 0;
allImages.forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === allImages.length) {
      document.getElementById("restartButton").disabled = false;
    }
  };
});
