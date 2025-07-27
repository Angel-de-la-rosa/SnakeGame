// Elementos DOM
const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const gameOverModal = document.querySelector(".game-over-modal");
const muteBtn = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume-slider");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const mainMenu = document.querySelector(".main-menu");
const wrapper = document.querySelector(".wrapper");
const soundOptions = document.getElementById("sound-options");
const restartBtn = document.getElementById("restart-btn");
const exitBtn = document.getElementById("exit-btn");
const btnUp = document.querySelector(".control.up");
const btnDown = document.querySelector(".control.down");
const btnLeft = document.querySelector(".control.left");
const btnRight = document.querySelector(".control.right");
const mobileControls = document.querySelector(".mobile-controls");

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
let musicaIniciada = false;

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerHTML = `high score: ${highScore}`;

// Inicializar pantallas al cargar
wrapper.style.display = "none";
soundOptions.classList.add("hidden");
gameOverModal.classList.add("hidden");
startScreen.style.display = "none";
mobileControls.classList.add("hidden");

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

  mobileControls.classList.add("hidden");
  soundOptions.classList.add("hidden");
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

// Control de volumen
volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  if (audioFondo) {
    audioFondo.volume = volume;
  }
});

// Mute / Unmute sonido
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;

  if (!audioFondo) {
    reproducirCancionAleatoria();
    return;
  }

  if (isMuted) {
    audioFondo.pause();
    muteBtn.textContent = "🔇";
  } else {
    audioFondo.play().catch(err => {
      console.log("No se pudo reproducir audio:", err);
    });
    muteBtn.textContent = "🔊";
  }
});

// Reproducir música de fondo aleatoria en loop (una sola vez)
function reproducirCancionAleatoria() {
  if (musicaIniciada) return;
  musicaIniciada = true;

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
  startScreen.style.display = 'none';
  wrapper.style.display = 'flex';
  soundOptions.classList.remove("hidden");

  if (window.innerWidth <= 768) {
    document.querySelector('.mobile-controls').classList.add('active');
  }

  reproducirCancionAleatoria();
  changFoodPosition();
  setIntervalId = setInterval(initGame, selectedSpeed);
});

// Función para iniciar el juego desde menú con dificultad
function startGame(speed) {
  selectedSpeed = speed;
  mainMenu.style.display = "none";
  startScreen.style.display = "flex";
  mobileControls.classList.add("hidden");
  soundOptions.classList.add("hidden"); 
}

// Botones modal game over
restartBtn.onclick = () => location.reload();
exitBtn.onclick = () => window.close();

// Controles móviles
btnUp.addEventListener("click", () => {
  if (velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  }
});

btnDown.addEventListener("click", () => {
  if (velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  }
});

btnLeft.addEventListener("click", () => {
  if (velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  }
});

btnRight.addEventListener("click", () => {
  if (velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
});

// Prevenir scroll en móviles
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });
