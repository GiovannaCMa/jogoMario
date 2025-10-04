// INICIO
const startButton = document.getElementById('start-game');
const gameContainer = document.getElementById('game-container');

// Botão de reiniciar
startButton.addEventListener('click', () => {
  window.location.href = 'game.html';
});

// GAME
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const recordScoreElement = document.getElementById("recordScore"); // fixo no HTML
const gameOverMessageElement = document.getElementById("gameOverMessage");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// CONFIG
const groundHeight = 100;
const gravity = 1;
const jumpForce = -20;
let speed = 6; // velocidade inicial
let score = 0;
let gameOver = false;

// RECORD
let record = Number(localStorage.getItem("record")) || 0;

// IMAGENS
const jaoImg = new Image();
jaoImg.src = "img/jão.png";

const fundoImg = new Image();
fundoImg.src = "img/f3.jpeg"; // Fundo do jogo

const obstacleImgs = [
  "img/lobos.jpeg",
  "img/anti heroi.jpeg",
  "img/pirata.jpeg",
  "img/super.jpeg",
  "img/super nova.jpeg",
].map((src) => {
  let img = new Image();
  img.src = src;
  return img;
});

// Nomes para identificar cada obstáculo
const obstacleNames = ["lobos", "antiheroi", "pirata", "super", "supernova"];

// Frases específicas para cada tipo de obstáculo
const mensagensPorObstaculo = {
  lobos: [
    "Ai, meu Deus, eu vou morrer sozinho!",
    "Como fodemos o maior amor do mundo?",
    "Porra, a gente se ama, isso é lindo demais!",
    "É que eu sou fraco, frágil, estúpido, pra falar de amor!",
    "Minha cabeça é a minha prisão, deixei pra trás quem eu fui sem razão!",
    "Qual a graça em se comprometer, quando eu tenho o mundo pra ver?",
    "Eu queria ser como você, que sofre só um pouco, na medida!",
    "Quão forte e frágil foi o nosso ser?",
    "É tão claro agora, eu sei que vai doer mas isso é necessário pra quem você vai ser!"
  ],
  antiheroi: [
    "Nós somos mesmo tão pequenos, isso é a coisa mais linda!",
    "Será que eu sou a melhor coisa da tua vida, ou só o melhor que você conseguiu até aqui?",
    "Essa eu fiz pra toda letra do Cazuza que eu decorei porque 'cê disse que gostava!",
    "O que eu fiz pra merecer o teu amor de fim de festa?",
    "Meu Deus que mania de me afogar!",
    "Eu tenho medo de te perguntar o que a gente é!",
    "Me devolve o que eu te dei meu amor e o meu tempo!",
    "Que culpa a gente tem de ser bonito e ter pouca idade?",
    "E eu fiquei com o que dói em queda livre, eu sou mesmo um anti-herói"
  ],
  pirata: [
    "Que seja um segundo de liberdade um beijo nunca é em vão!",
    "Eu juro, eu não te amo, eu só bebi demais, amor!",
    "Me perdi em nós e gostei mais de você do que você gostou de mim!",
    "Deus não fez o amor tão lindo pra ser proibido!",
    "O que o amor vira quando chega o fim?",
    "Talvez se afastar um pouco sem perder de vista parecesse o certo",
    "mas meu coração é grande e cabem todos os meninos e as meninas!",
    "Então, o que a gente faz agora?",
    "Verde-limão, várias cores na onda do doce, estrelas do mar!",
    "Me mataram ontem, mas nunca me senti tão vivo!",
    "Eu, eu quero me perder, incendiar...",
  ],
  super: [
    "Te quero bem é o caralho!",
    "Posso ser seu Game Boy!",
    "Você me ama e eu te amo, alinhamento milenar, você não acha?",
    "Eu vou beijar a sua boca!",
    "Eu precisava me deixar pra descobrir onde eu estava!",
    "Julho é tudo o que a gente não vai mais ser!",
    "Eu posso ser como você!",
    "Eu ouvi a sua voz vindo de cima!",
    "Te deixar foi a coisa mais difícil e mais bonita que eu já fiz por mim",
    "Baby, eu ainda me lembro!",
    "Eu tenho um sonho, eu tenho um sonho!",
    "Meu Deus, você jurou que ia cuidar de mim!",
    "Eu não me sinto mal, eu só não sinto nada!"
  ],
  supernova: [
    "Eu vou queimar pelo preço de te ter!",
    "Tudo bem, finge que eu fui um acidente!",
    "Que com essa idade, ficou meio tarde pra ser tão sentimental!",
    "O triste é que eu te amo!",
    "Um dia em fevereiro eu fui seu carnaval!",
    "Do que você tem medo?",
    "Am I being paranoid?",
  ],
};

// JAO
const jao = {
  x: 100,
  y: height - groundHeight - 45,
  width: 100,
  height: 100,
  vy: 0,
  grounded: true,
};

// OBSTÁCULOS
let obstacles = [];

// Função para criar um obstáculo
function createObstacle(offset = 0) {
  const index = Math.floor(Math.random() * obstacleImgs.length);
  return {
    x: width + offset,
    y: height - groundHeight - 60,
    width: 55,
    height: 55,
    img: obstacleImgs[index],
    type: obstacleNames[index],
  };
}

// Inicializa com um obstáculo
obstacles.push(createObstacle());

// CONTROLES
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") jump();
});
window.addEventListener("click", jump);

function jump() {
  if (jao.grounded && !gameOver) {
    jao.vy = jumpForce;
    jao.grounded = false;
  }
}

// Função de colisão
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y + a.height > b.y &&
    a.y < b.y + b.height
  );
}

// LOOP PRINCIPAL
let frame = 0;
function loop() {
  if (!gameOver) requestAnimationFrame(loop);
  frame++;

  // fundo rolando
  ctx.clearRect(0, 0, width, height);
  const bgX = -(frame * speed * 0.5) % width;
  ctx.drawImage(fundoImg, bgX, 0, width, height);
  ctx.drawImage(fundoImg, bgX + width, 0, width, height);

  // jao
  jao.vy += gravity;
  jao.y += jao.vy;
  if (jao.y + jao.height >= height - groundHeight) {
    jao.y = height - groundHeight - jao.height;
    jao.vy = 0;
    jao.grounded = true;
  }
  ctx.drawImage(jaoImg, jao.x, jao.y, jao.width, jao.height);

  // Obstáculos
  obstacles.forEach((o, index) => {
    o.x -= speed;
    ctx.drawImage(o.img, o.x, o.y, o.width, o.height);

    // colisão
    if (checkCollision(jao, o) && !gameOver) {
      gameOver = true;

      // Atualiza a pontuação final
      finalScoreElement.innerText = `SCORE: ${score}`;

      // Atualiza o recorde no localStorage
      if (score > record) {
        record = score;
        localStorage.setItem("record", record);
      }

      // Atualiza o recorde na tela de Game Over
      recordScoreElement.innerText = `RECORD: ${record}`;

      // Escolhe uma frase aleatória baseada no obstáculo
      const frases = mensagensPorObstaculo[o.type];
      const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
      gameOverMessageElement.innerText = fraseAleatoria;

      // Exibe a tela de Game Over
      gameOverScreen.style.display = "block";
    }

    // remove obstáculo fora da tela
    if (o.x + o.width < 0) {
      obstacles.splice(index, 1);
    }
  });

  // Adicionar novo obstáculo quando o último estiver chegando perto
  const lastObstacle = obstacles[obstacles.length - 1];
  if (lastObstacle && lastObstacle.x < width - 300) {
    obstacles.push(createObstacle(300));
  }

  // pontuação mais lenta
  if (!gameOver && frame % 45 === 0) {
    score++;

    // aumenta a dificuldade gradualmente
    if (score % 20 === 0) speed += 0.01;

    // atualiza recorde se necessário
    if (score > record) {
      record = score;
      localStorage.setItem("record", record);
    }

    overlay.innerText = `SCORE: ${score} | RECORD: ${record}`;
  }
}

// Aguarda todas as imagens carregarem antes de iniciar
let imagesToLoad = [jaoImg, fundoImg, ...obstacleImgs];
let loadedCount = 0;

imagesToLoad.forEach((img) => {
  img.onload = () => {
    loadedCount++;
    if (loadedCount === imagesToLoad.length) {
      loop(); // inicia o jogo
    }
  };
});

// Ajustar tela ao redimensionar
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  jao.y = height - groundHeight - jao.height;
});
