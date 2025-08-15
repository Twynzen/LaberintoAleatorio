/*
 * Laberinto Aleatorio
 *
 * Este script genera un laberinto utilizando un algoritmo de backtracking y permite al
 * jugador recorrerlo con las flechas del teclado. El objetivo es llegar desde la
 * esquina superior izquierda hasta la esquina inferior derecha. Se incluye un
 * temporizador sencillo que mide el tiempo transcurrido desde que el jugador
 * comienza a moverse hasta que alcanza la meta. Al ganar, se muestra una alerta
 * y se puede reiniciar el juego para generar un nuevo laberinto.
 */

(function () {
  // Tamaño de la cuadrícula (número de celdas en cada dirección)
  const ROWS = 20;
  const COLS = 20;

  // Tamaño del canvas en píxeles
  const CANVAS_SIZE = 600;
  const CELL_SIZE = CANVAS_SIZE / ROWS;

  // Obtén referencias a elementos del DOM
  const canvas = document.getElementById('mazeCanvas');
  const ctx = canvas.getContext('2d');
  const restartBtn = document.getElementById('restartBtn');
  const timeValue = document.getElementById('timeValue');

  // Estructura de celdas del laberinto
  class Cell {
    constructor(row, col) {
      this.row = row;
      this.col = col;
      // Paredes: top, right, bottom, left (todas inicialmente presentes)
      this.walls = { top: true, right: true, bottom: true, left: true };
      this.visited = false;
    }
  }

  // Variables de juego
  let maze = [];
  let player = { row: 0, col: 0 };
  let gameStarted = false;
  let startTime = 0;
  let timerInterval = null;

  /**
   * Inicializa el laberinto vacío y lo genera usando DFS backtracking.
   */
  function generateMaze() {
    // Crear la matriz de celdas
    maze = new Array(ROWS);
    for (let r = 0; r < ROWS; r++) {
      maze[r] = new Array(COLS);
      for (let c = 0; c < COLS; c++) {
        maze[r][c] = new Cell(r, c);
      }
    }
    // Algoritmo DFS para generar el laberinto
    const stack = [];
    const startCell = maze[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current);
      if (neighbors.length > 0) {
        // Seleccionar un vecino al azar
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Eliminar la pared entre current y next
        removeWalls(current, next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }
  }

  /**
   * Obtiene los vecinos no visitados de una celda.
   * @param {Cell} cell 
   * @returns {Cell[]} Una lista de celdas vecinas no visitadas
   */
  function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { row, col } = cell;
    // Arriba
    if (row > 0 && !maze[row - 1][col].visited) {
      neighbors.push(maze[row - 1][col]);
    }
    // Derecha
    if (col < COLS - 1 && !maze[row][col + 1].visited) {
      neighbors.push(maze[row][col + 1]);
    }
    // Abajo
    if (row < ROWS - 1 && !maze[row + 1][col].visited) {
      neighbors.push(maze[row + 1][col]);
    }
    // Izquierda
    if (col > 0 && !maze[row][col - 1].visited) {
      neighbors.push(maze[row][col - 1]);
    }
    return neighbors;
  }

  /**
   * Elimina las paredes entre dos celdas adyacentes (current y next).
   * @param {Cell} current 
   * @param {Cell} next 
   */
  function removeWalls(current, next) {
    const x = current.col - next.col;
    const y = current.row - next.row;
    // next está a la derecha de current
    if (x === -1) {
      current.walls.right = false;
      next.walls.left = false;
    }
    // next está a la izquierda de current
    else if (x === 1) {
      current.walls.left = false;
      next.walls.right = false;
    }
    // next está abajo de current
    if (y === -1) {
      current.walls.bottom = false;
      next.walls.top = false;
    }
    // next está arriba de current
    else if (y === 1) {
      current.walls.top = false;
      next.walls.bottom = false;
    }
  }

  /**
   * Dibuja el laberinto completo en el canvas.
   */
  function drawMaze() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Dibujar paredes de cada celda
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = maze[r][c];
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        // Arriba
        if (cell.walls.top) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + CELL_SIZE, y);
          ctx.stroke();
        }
        // Derecha
        if (cell.walls.right) {
          ctx.beginPath();
          ctx.moveTo(x + CELL_SIZE, y);
          ctx.lineTo(x + CELL_SIZE, y + CELL_SIZE);
          ctx.stroke();
        }
        // Abajo
        if (cell.walls.bottom) {
          ctx.beginPath();
          ctx.moveTo(x + CELL_SIZE, y + CELL_SIZE);
          ctx.lineTo(x, y + CELL_SIZE);
          ctx.stroke();
        }
        // Izquierda
        if (cell.walls.left) {
          ctx.beginPath();
          ctx.moveTo(x, y + CELL_SIZE);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    }
    // Dibujar la meta (esquina inferior derecha)
    ctx.fillStyle = '#d1e7dd';
    ctx.fillRect((COLS - 1) * CELL_SIZE + 2, (ROWS - 1) * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    // Dibujar al jugador
    drawPlayer();
  }

  /**
   * Dibuja la representación del jugador en el laberinto.
   */
  function drawPlayer() {
    const px = player.col * CELL_SIZE;
    const py = player.row * CELL_SIZE;
    ctx.fillStyle = '#e63946';
    ctx.fillRect(px + 4, py + 4, CELL_SIZE - 8, CELL_SIZE - 8);
  }

  /**
   * Inicia el temporizador. Se actualiza cada 100 ms.
   */
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      timeValue.textContent = elapsed.toFixed(1);
    }, 100);
  }

  /**
   * Detiene el temporizador.
   */
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Reinicia el juego: genera un nuevo laberinto, restablece la posición del jugador y el temporizador.
   */
  function resetGame() {
    stopTimer();
    generateMaze();
    player.row = 0;
    player.col = 0;
    gameStarted = false;
    timeValue.textContent = '0.0';
    drawMaze();
  }

  /**
   * Maneja el movimiento del jugador según la tecla presionada.
   * @param {string} direction - 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
   */
  function movePlayer(direction) {
    const cell = maze[player.row][player.col];
    let moved = false;
    switch (direction) {
      case 'ArrowUp':
        if (!cell.walls.top && player.row > 0) {
          player.row -= 1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (!cell.walls.bottom && player.row < ROWS - 1) {
          player.row += 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (!cell.walls.left && player.col > 0) {
          player.col -= 1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (!cell.walls.right && player.col < COLS - 1) {
          player.col += 1;
          moved = true;
        }
        break;
    }
    if (moved) {
      if (!gameStarted) {
        // Primera vez que se mueve: iniciar timer
        gameStarted = true;
        startTimer();
      }
      // Redibuja el laberinto para actualizar la posición del jugador
      drawMaze();
      // Comprueba si llegó a la meta
      if (player.row === ROWS - 1 && player.col === COLS - 1) {
        stopTimer();
        setTimeout(() => {
          alert('¡Felicidades! Has completado el laberinto en ' + timeValue.textContent + ' segundos.');
        }, 50);
      }
    }
  }

  // Listeners
  document.addEventListener('keydown', (event) => {
    const allowed = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (allowed.includes(event.key)) {
      event.preventDefault();
      movePlayer(event.key);
    }
  });

  restartBtn.addEventListener('click', () => {
    resetGame();
  });

  // Inicializa el juego al cargar la página
  resetGame();
})();