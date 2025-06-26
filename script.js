const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stitchImg = new Image();
stitchImg.src = "./Basket.png"; 

const cupcakeImgs = ["cupcake1.png", "cupcake2.png"].map((src) => {
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

let stitch = { x: canvas.width / 2 - 50, y: canvas.height - 80, width: 100, height: 80 };
let cakes = [];
let score = 0, missed = 0, timeLeft = 30, highScore = 0;

let isRunning = true;
let freezeTime = false;
let timerInterval;

const elemScore = document.getElementById("score");
const elemMissed = document.getElementById("missed");
const elemTimer = document.getElementById("timer");
const elemFinalScore = document.getElementById("finalScore");
const elemHighScore = document.getElementById("highScore");
const elemGameOverPopup = document.getElementById("gameOverPopup");
const elemGameOverHeader = elemGameOverPopup.querySelector("h2");

function drawStitch() {
  ctx.drawImage(stitchImg, stitch.x, stitch.y, stitch.width, stitch.height);
}

function drawCakes() {
  cakes.forEach((cake) => {
    ctx.drawImage(cake.image, cake.x - 30, cake.y - 30, 50, 50);
  });
}

function updateCakes() {
  cakes.forEach((cake) => (cake.y += cake.speed));
  cakes = cakes.filter((cake) => {
    if (cake.y > canvas.height) {
      missed++;
      elemMissed.textContent = missed;
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
      cake.y + 20 > stitch.y &&
      cake.y - 20 < stitch.y + stitch.height
    ) {
      switch (cake.type) {
        case "bonus":
          score += 5;
          soundBonus.play();
          break;
        case "bomb":
          soundBomb.play();
          endGame(true);
          return;
        case "lucky":
          freezeTimer(5);
          soundBonus.play();
          break;
        case "timer":
          timeLeft += 10;
          elemTimer.textContent = timeLeft;
          soundBonus.play();
          break;
        default:
          score += 1;
          soundCatch.play();
      }
      elemScore.textContent = score;
      cakes.splice(i, 1);
    }
  }
}

function freezeTimer(seconds) {
  freezeTime = true;
  setTimeout(() => (freezeTime = false), seconds * 1000);
}

function spawnCake() {
  const x = Math.random() * (canvas.width - 40) + 20;
  const rand = Math.random();
  let type = "normal";
  let img = cupcakeImgs[Math.floor(Math.random() * cupcakeImgs.length)];

  if (rand < 0.1) {
    type = "bonus"; img = bonusImg;
  } else if (rand < 0.15) {
    type = "bomb"; img = bombImg;
  } else if (rand < 0.18) {
    type = "lucky"; img = luckyImg;
  } else if (rand < 0.21) {
    type = "timer"; img = timerImg;
  }

  cakes.push({ x, y: 0, speed: 3 + Math.random() * 2, type, image: img });
}

function gameLoop() {
  if (!isRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStitch();
  drawCakes();
  updateCakes();
  checkCollision();

  // Reduced the spawn rate slightly
  if (Math.random() < 0.015) {
    spawnCake();
  }

  requestAnimationFrame(gameLoop);
}

// Input handling
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  stitch.x = e.clientX - rect.left - stitch.width / 2;
});
canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  stitch.x = touch.clientX - rect.left - stitch.width / 2;
});

// Game controls
function restartGame() {
  score = 0; missed = 0; timeLeft = 30;
  isRunning = true;
  cakes = [];
  elemScore.textContent = score;
  elemMissed.textContent = missed;
  elemTimer.textContent = timeLeft;
  elemFinalScore.textContent = score;

  elemGameOverPopup.classList.add("hidden");
  clearInterval(timerInterval);
  startTimer();
  gameLoop();
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (!freezeTime) {
      timeLeft--; elemTimer.textContent = timeLeft;
    }
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame(bombCaught = false) {
  isRunning = false;
  clearInterval(timerInterval);
  if (score > highScore) {
    highScore = score;
    elemHighScore.textContent = highScore;
  }

  const message = bombCaught
    ? "💥 You caught a cherry bomb! Game Over!"
    : `🎉 You caught ${score} cakes! You're a birthday hero!`;

  elemFinalScore.textContent = score;
  elemGameOverHeader.textContent = message;
  elemGameOverPopup.classList.remove("hidden");

  if (!bombCaught) {
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `-10px`;
      confetti.style.width = "6px";
      confetti.style.height = "12px";
      confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
      confetti.style.opacity = "0.8";
      confetti.style.zIndex = "9999";
      confetti.style.animation = `fall ${1 + Math.random()}s linear forwards`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  }
}

function goHome() {
  window.location.href = "index.html";
}

// Add confetti keyframes
const style = document.createElement("style");
style.innerHTML = `@keyframes fall { to { transform: translateY(100vh) rotate(360deg); opacity: 0; } }`;
document.head.appendChild(style);

// Start only when all images are preloaded
let imagesLoaded = 0;
const allImages = [...cupcakeImgs, bonusImg, bombImg, luckyImg, timerImg, stitchImg];
allImages.forEach((img) => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === allImages.length) {
      startTimer();
      gameLoop();
    }
  };
});

// Bind restart handler explicitly
window.onload = function() {
  const restartButton = document.getElementById("gameOverRestart");
  if (restartButton) {
    restartButton.addEventListener("click", restartGame);
  }
};
