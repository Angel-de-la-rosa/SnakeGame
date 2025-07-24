const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const gameOverModal = document.querySelector(".game-over-modal");
const muteBtn = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume-slider");

document.getElementById("restart-btn").onclick = () => location.reload();
document.getElementById("exit-btn").onclick = () => window.close();

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let gameSpeed = 125;
let isMuted = false;
let audioFondo = null;

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerHTML = `high score: ${highScore}`;

// Posicionar comida en lugar aleatorio
const changFoodPosition = () => {
  foodX = Math.floor(Math.random() * 20) + 1;
  foodY = Math.floor(Math.random() * 20) + 1;
};

// Mostrar modal de game over y detener música
const handleGameOver = () => {
  clearInterval(setIntervalId);
  gameOverModal.classList.remove("hidden");

  // Detener música al perder
  if (audioFondo && !audioFondo.paused) {
    audioFondo.pause();
    audioFondo.currentTime = 0;
  }
};

// Cambiar dirección al presionar flechas
const changeDirection = (e) => {
  if (e.key === "ArrowUp" && velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

// Activar detección de teclas
document.addEventListener("keydown", changeDirection);

// Lógica del juego por intervalo
const initGame = () => {
  if (gameOver) return handleGameOver();

  let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}; background-image: url('assets/fruta.png');"></div>`;

  // Comer comida
  if (snakeX === foodX && snakeY === foodY) {
    changFoodPosition();
    snakeBody.push([foodX, foodY]);
    score++;
    highScore = Math.max(score, highScore);
    localStorage.setItem("high-score", highScore);
    scoreElement.innerHTML = `score: ${score}`;
    highScoreElement.innerHTML = `high score: ${highScore}`;
  }

  // Mover cuerpo
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }

  // Actualizar cabeza
  snakeBody[0] = [snakeX, snakeY];
  snakeX += velocityX;
  snakeY += velocityY;

  // Colisión con paredes
  if (snakeX <= 0 || snakeX > 20 || snakeY <= 0 || snakeY > 20) {
    gameOver = true;
  }

  // Dibujar serpiente
  for (let i = 0; i < snakeBody.length; i++) {
    let x = snakeBody[i][0];
    let y = snakeBody[i][1];
    let rotation = "";

    if (i > 0) {
      const [prevX, prevY] = snakeBody[i - 1];
      if (x === prevX && y !== prevY) rotation = "rotate(90deg)";
      else if (y === prevY && x !== prevX) rotation = "rotate(0deg)";
    }

    const part = i === 0 ? "cabezaSerpiente.png" : "cuerpo.png";
    htmlMarkup += `<div class="snake-part" style="
      grid-area: ${y} / ${x};
      background-image: url('assets/${part}');
      transform: ${rotation};
    "></div>`;

    // Colisión con sí mismo
    if (i !== 0 && snakeBody[0][1] === y && snakeBody[0][0] === x) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = htmlMarkup;
};

// Mute / Unmute
muteBtn.addEventListener("click", function () {
  isMuted = !isMuted;

  if (audioFondo) {
    if (isMuted) {
      audioFondo.pause();
      muteBtn.textContent = "🔇";
    } else {
      audioFondo.play();
      muteBtn.textContent = "🔊";
    }
  } else {
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  }
});

// Control de volumen
volumeSlider.addEventListener("input", function () {
  const volume = parseFloat(volumeSlider.value);
  if (audioFondo) {
    audioFondo.volume = volume;
  }
});

// Reproducir canción aleatoria de fondo
function reproducirCancionAleatoria() {
  const canciones = [
    './backgroundMusic/8BitFunny.mp3',
    './backgroundMusic/8BitMenu.mp3',
    './backgroundMusic/8BitRetro.mp3',
  ];

  const cancionIndex = Math.floor(Math.random() * canciones.length);
  audioFondo = new Audio(canciones[cancionIndex]);

  audioFondo.loop = false;
  audioFondo.volume = parseFloat(volumeSlider.value);

  audioFondo.addEventListener('ended', reproducirCancionAleatoria);

  if (!isMuted) {
    audioFondo.play();
  }
}

// Iniciar el juego (desde menú)
function startGame(speed) {
  gameSpeed = speed;
  document.querySelector(".main-menu").style.display = "none";
  document.getElementById("sound-options").classList.remove("hidden");  
  reproducirCancionAleatoria();
  changFoodPosition();
  setIntervalId = setInterval(initGame, gameSpeed);
}
