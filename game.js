'use strict';
const doc = document.documentElement;
const controller = document.querySelector('.controller');
const gameOverScreen = document.querySelector('.game-over');
const scoreElement = document.querySelector('.score');
const scoresBoard = document.querySelector('.scores');
const grid = document.querySelector('.grid');
const scoreNumber = document.querySelector('.points');
const replayBtn = document.querySelector('button');
const fullScreenBtn = document.querySelector('.fullscreen-btn');
gameOverScreen.classList.add('hidden');
scoresBoard.classList.add('hidden');
let nextTimeRender = 0;
let gameSpeed = 1;
const rows = 20;
const cols = 10;
let board = [];
const empty = '#dfe6e9';
let score = 0;

for (let r = 0; r < rows; r++) {
  board[r] = [];
  for (let c = 0; c < cols; c++) {
    board[r][c] = empty;
  }
}

function drawSquare(x, y, color) {
  const boardElement = document.createElement('div');
  boardElement.style.gridRowStart = x;
  boardElement.style.gridColumnStart = y;
  boardElement.style.backgroundColor = color;
  boardElement.classList.add('piece--element');
  grid.appendChild(boardElement);
}
function drawBackground(x, y, color) {
  const boardElement = document.createElement('div');
  boardElement.style.gridRowStart = x;
  boardElement.style.gridColumnStart = y;
  boardElement.style.backgroundColor = color;
  boardElement.style.zIndex = '-1';
  boardElement.classList.add('backgorund--element');
  grid.appendChild(boardElement);
}
function colorBoard() {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] !== empty) {
        drawSquare(r + 1, c + 1, board[r][c]);
      } else {
        drawBackground(r + 1, c + 1, board[r][c]);
      }
    }
  }
}

function Piece(piece, color) {
  this.piece = piece;
  this.color = color;
  this.pieceN = 0;
  this.activePiece = this.piece[this.pieceN];
  this.x = 4;
  this.y = 0;
}

const pieces = [
  [I, 'aqua'],
  [J, 'red'],
  [L, 'blue'],
  [Z, 'yellow'],
  [S, 'purple'],
  [T, 'green'],
  [O, 'orange'],
];

function randomPiece() {
  let r = Math.floor(Math.random() * pieces.length);
  return new Piece(pieces[r][0], pieces[r][1]);
}

let p = randomPiece();
Piece.prototype.renderPiece = function () {
  for (let r = 0; r < this.activePiece.length; r++) {
    for (let c = 0; c < this.activePiece.length; c++) {
      if (this.activePiece[r][c]) {
        drawSquare(this.y + r, this.x + c, this.color);
      }
    }
  }
};
p.renderPiece();

Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.activePiece)) {
    grid.innerHTML = '';
    this.x--;
    this.renderPiece();
  }
};
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.activePiece)) {
    grid.innerHTML = '';
    this.x++;
    this.renderPiece();
  }
};
Piece.prototype.rotate = function () {
  let nextRotation = this.piece[(this.pieceN + 1) % this.piece.length];
  let move = 0;
  if (this.collision(0, 0, nextRotation)) {
    if (this.x > cols / 2) {
      move = -1;
    } else {
      move = 1;
    }
  }
  if (!this.collision(move, 0, nextRotation)) {
    grid.innerHTML = '';
    this.x += move;
    this.pieceN = (this.pieceN + 1) % this.piece.length;
    this.activePiece = this.piece[this.pieceN];
    this.renderPiece();
  }
};
Piece.prototype.moveDown = function () {
  if (!this.collision(0, 1, this.activePiece)) {
    grid.innerHTML = '';
    this.y++;
    this.renderPiece();
  } else {
    p = randomPiece();
    this.stick();
  }
};

window.addEventListener('keydown', control);
function control(e) {
  if (e.keyCode === 37) {
    p.moveLeft();
    colorBoard();
  }
  if (e.keyCode === 39) {
    p.moveRight();
    colorBoard();
  }
  if (e.keyCode === 40) {
    p.moveDown();
    colorBoard();
  }
  if (e.keyCode === 38) {
    p.rotate();
    colorBoard();
  }
}

window.addEventListener('mousedown', function (e) {
  if (e.target.classList.contains('up')) {
    p.rotate();
    colorBoard();
  }
  if (e.target.classList.contains('right')) {
    p.moveRight();
    colorBoard();
  }
  if (e.target.classList.contains('down')) {
    p.moveDown();
    colorBoard();
  }
  if (e.target.classList.contains('left')) {
    p.moveLeft();
    colorBoard();
  }
});

Piece.prototype.collision = function (a, b, piece) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece.length; c++) {
      if (!piece[r][c]) {
        continue;
      }
      let newX = this.x + c + a;
      let newY = this.y + r + b;

      if (newX > cols || newX < 0 || newY > rows) {
        return true;
      }
      if (newY <= 0) {
        continue;
      }
      if (board[newY - 1][newX - 1] !== empty) {
        return true;
      }
    }
  }
};
Piece.prototype.stick = function () {
  for (let r = 0; r < this.activePiece.length; r++) {
    for (let c = 0; c < this.activePiece.length; c++) {
      if (!this.activePiece[r][c]) {
        continue;
      }
      if (this.y + r <= 0) {
        console.log(score);
        gameSpeed = 0;
        grid.classList.add('stop-events');
        controller.classList.add('stop-events');
        scoresBoard.classList.remove('hidden');
        gameOverScreen.classList.remove('hidden');
        window.removeEventListener('keydown', control);
        saveScore(score);
        reduceArray(scores);
        arraySort(scores);
        renderArray(scores);
        gameSpeed = 0;
        break;
      }
      board[this.y + r - 1][this.x + c - 1] = this.color;
    }
  }
  for (let r = 0; r < rows; r++) {
    let isFullRow = true;
    for (let c = 0; c < cols; c++) {
      isFullRow = isFullRow && board[r][c] !== empty;
    }
    if (isFullRow) {
      for (let y = r; y > 1; y--) {
        for (let c = 0; c < cols; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      score = score + 10;
    }
  }
  scoreNumber.textContent = score;
  colorBoard();
};
function dropPiece(currentTime) {
  const deltaTime = (currentTime - nextTimeRender) / 1000;
  window.requestAnimationFrame(dropPiece);
  if (deltaTime < 1 / gameSpeed) return;
  nextTimeRender = currentTime;
  p.moveDown();
  colorBoard();
}
window.requestAnimationFrame(dropPiece);
window.addEventListener('keydown', e => {
  if (e.key === 'r') {
    window.localStorage.clear();
  }
});
const localScores = function () {
  let scores;
  if (localStorage.getItem('Scores') === null) {
    scores = [];
  } else {
    scores = JSON.parse(localStorage.getItem('Scores'));
  }
  return scores;
};
const scores = localScores();
function arraySort(arr) {
  let newArr = arr.sort((a, b) => b - a);
  return newArr;
}
function saveScore(el) {
  scores.push(el);
  localStorage.setItem('Scores', JSON.stringify(scores));
}
function reduceArray(arr) {
  arr.length = 15;
  return arr;
}
function renderArray(arr) {
  arr.forEach((score, index) => {
    const scoreElement = document.createElement('div');
    scoreElement.textContent = `Score ${index + 1} : ${score}`;
    if (index === 0) {
      scoreElement.classList.add('first__score--element');
      scoreElement.style.fontWeight = '800';
    } else {
      scoreElement.classList.add('score--element');
    }
    scoresBoard.appendChild(scoreElement);
  });
}
replayBtn.addEventListener('click', () => {
  window.location = './index.html';
});

function openFullscreen() {
  if (doc.requestFullscreen) {
    doc.requestFullscreen();
  } else if (doc.webkitRequestFullscreen) {
    doc.webkitRequestFullscreen();
  } else if (doc.msRequestFullscreen) {
    doc.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}
fullScreenBtn.addEventListener('click', function () {
  if (fullScreenBtn.textContent == 'Go Fullscreen') {
    openFullscreen();
    fullScreenBtn.textContent = 'Exit Fullscreen';
  } else {
    closeFullscreen();
    fullScreenBtn.textContent = 'Go Fullscreen';
  }
});
