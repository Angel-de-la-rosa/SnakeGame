// Elementos DOM
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const gameOverModal = document.querySelector(".game-over-modal");
const muteBtn = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume-slider");
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const mainMenu = document.querySelector(".main-menu");
const wrapper = document.querySelector(".wrapper");
const soundOptions = document.getElementById("sound-options");
const restartBtn = document.getElementById("restart-btn");
const exitBtn = document.getElementById("exit-btn");

// Variables del juego
let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let selectedSpeed = 125;
let isMuted = false;
let audioFondo = null;

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerHTML = `high score: ${highScore}`;

// Inicializar pantallas al cargar
wrapper.style.display = "none";
soundOptions.classList.add("hidden");
gameOverModal.classList.add("hidden");
startScreen.style.display = "none";

// Función para posicionar comida aleatoriamente
const changFoodPosition = () => {
  foodX = Math.floor(Math.random() * 20) + 1;
  foodY = Math.floor(Math.random() * 20) + 1;
};

// Función para terminar el juego
const handleGameOver = () => {
  clearInterval(setIntervalId);
  gameOverModal.classList.remove("hidden");

  if (audioFondo && !audioFondo.paused) {
    audioFondo.pause();
    audioFondo.currentTime = 0;
  }
};

// Cambiar dirección con teclas
const changeDirection = (e) => {
  if (e.key === "ArrowUp" && velocityY !== 1) {
    velocityX = 0; velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY !== -1) {
    velocityX = 0; velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1; velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX !== -1) {
    velocityX = 1; velocityY = 0;
  }
};
document.addEventListener("keydown", changeDirection);

// Lógica principal del juego
const initGame = () => {
  if (gameOver) return handleGameOver();

  let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}; background-image: url('assets/fruta.png');"></div>`;

  if (snakeX === foodX && snakeY === foodY) {
    changFoodPosition();
    snakeBody.push([foodX, foodY]);
    score++;
    highScore = Math.max(score, highScore);
    localStorage.setItem("high-score", highScore);
    scoreElement.innerHTML = `score: ${score}`;
    highScoreElement.innerHTML = `high score: ${highScore}`;
  }

  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }

  snakeBody[0] = [snakeX, snakeY];
  snakeX += velocityX;
  snakeY += velocityY;

  if (snakeX <= 0 || snakeX > 20 || snakeY <= 0 || snakeY > 20) {
    gameOver = true;
  }

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

    if (i !== 0 && snakeBody[0][1] === y && snakeBody[0][0] === x) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = htmlMarkup;
};

// Mute / Unmute sonido
muteBtn.addEventListener("click", () => {
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
volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  if (audioFondo) {
    audioFondo.volume = volume;
  }
});

// Reproducir música de fondo aleatoria en loop
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

// Botón para comenzar a jugar tras instrucciones
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';         // Ocultar instrucciones
  wrapper.style.display = 'flex';              // Mostrar tablero
  soundOptions.classList.remove("hidden");    // Mostrar opciones de sonido
  reproducirCancionAleatoria();
  changFoodPosition();
  setIntervalId = setInterval(initGame, selectedSpeed);
});

// Función para iniciar el juego desde menú con dificultad
function startGame(speed) {
  selectedSpeed = speed;
  mainMenu.style.display = "none";   // Ocultar menú principal
  startScreen.style.display = "flex"; // Mostrar instrucciones
}

// Botones modal game over
restartBtn.onclick = () => location.reload();
exitBtn.onclick = () => window.close();
