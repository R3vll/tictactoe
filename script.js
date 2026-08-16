/**
 * Tic-Tac-Toe Game with Minimax AI
 * Player X (human) vs Player O (AI)
 */

// Game State
const state = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameOver: false,
    scores: { X: 0, O: 0, draw: 0 },
    aiPlayer: 'O', // Will be randomly assigned in resetGame()
    humanPlayer: 'X',
    winningCombos: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ]
};

// DOM Elements
const elements = {
    board: document.getElementById('board'),
    cells: document.querySelectorAll('.cell'),
    status: document.getElementById('status'),
    resetBtn: document.getElementById('resetBtn'),
    scoreX: document.getElementById('scoreX'),
    scoreO: document.getElementById('scoreO'),
    scoreDraw: document.getElementById('scoreDraw')
};

/**
 * Initialize the game
 */
function init() {
    renderBoard();
    bindEvents();
    updateScoreDisplay();
}

/**
 * Bind event listeners
 */
function bindEvents() {
    elements.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('keydown', handleCellKeydown);
    });
    elements.resetBtn.addEventListener('click', resetGame);
}

/**
 * Handle cell click
 */
function handleCellClick(event) {
    const index = parseInt(event.target.dataset.index, 10);
    makeMove(index);
}

/**
 * Handle keyboard navigation
 */
function handleCellKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const index = parseInt(event.target.dataset.index, 10);
        makeMove(index);
    }
}

/**
 * Make a move at the given index
 */
function makeMove(index) {
    // Validate move
    if (state.board[index] !== null || state.gameOver || state.currentPlayer !== state.humanPlayer) {
        return;
    }

    // Place human player's symbol
    state.board[index] = state.humanPlayer;
    renderBoard();

    // Check for win/draw
    if (checkGameEnd()) {
        return;
    }

    // Switch to AI turn
    state.currentPlayer = state.aiPlayer;
    updateStatus('AI thinking...', 'ai-turn');

    // Small delay for better UX
    setTimeout(() => {
        if (!state.gameOver) {
            makeAIMove();
        }
    }, 500);
}

/**
 * AI makes a move using minimax algorithm
 */
function makeAIMove() {
    const bestMove = findBestMove(state.board);

    if (bestMove !== -1) {
        state.board[bestMove] = state.aiPlayer;
        renderBoard();
        checkGameEnd();

        if (!state.gameOver) {
            state.currentPlayer = state.humanPlayer;
            updateStatus(`Your turn (${state.humanPlayer})`, 'player-turn');
        }
    }
}

/**
 * Minimax algorithm with alpha-beta pruning
 * Returns the best score for the current player
 */
function minimax(board, depth, isMaximizing, alpha, beta) {
    const winner = checkWinner(board);

    // Terminal states
    if (winner === state.aiPlayer) return 10 - depth;  // AI wins
    if (winner === state.humanPlayer) return depth - 10;  // Human wins
    if (isBoardFull(board)) return 0;       // Draw

    if (isMaximizing) {
        // AI's turn (maximizing)
        let maxEval = -Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = state.aiPlayer;
                const evalScore = minimax(board, depth + 1, false, alpha, beta);
                board[i] = null;
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return maxEval;
    } else {
        // Human's turn (minimizing)
        let minEval = Infinity;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = state.humanPlayer;
                const evalScore = minimax(board, depth + 1, true, alpha, beta);
                board[i] = null;
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
        return minEval;
    }
}

/**
 * Find the best move for AI using minimax
 */
function findBestMove(board) {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = state.aiPlayer;
            const score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

/**
 * Check if there's a winner on the given board
 * Returns 'X', 'O', or null
 */
function checkWinner(board = state.board) {
    for (const [a, b, c] of state.winningCombos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

/**
 * Check if board is full
 */
function isBoardFull(board = state.board) {
    return board.every(cell => cell !== null);
}

/**
 * Check for game end (win or draw)
 * Returns true if game ended
 */
function checkGameEnd() {
    const winner = checkWinner();

    if (winner) {
        state.gameOver = true;
        highlightWinningCells(winner);
        updateScore(winner);
        updateStatus(`${winner === state.humanPlayer ? 'You' : 'AI'} wins! 🎉`, 'win');
        disableBoard();
        return true;
    }

    if (isBoardFull()) {
        state.gameOver = true;
        state.scores.draw++;
        updateScoreDisplay();
        updateStatus("It's a draw! 🤝", 'draw');
        disableBoard();
        return true;
    }

    return false;
}

/**
 * Highlight winning cells
 */
function highlightWinningCells(winner) {
    for (const [a, b, c] of state.winningCombos) {
        if (state.board[a] === winner && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
            elements.cells[a].classList.add('winning');
            elements.cells[b].classList.add('winning');
            elements.cells[c].classList.add('winning');
            break;
        }
    }
}

/**
 * Disable all cells
 */
function disableBoard() {
    elements.cells.forEach(cell => {
        cell.classList.add('disabled');
    });
}

/**
 * Update score and display
 */
function updateScore(winner) {
    state.scores[winner]++;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    elements.scoreX.textContent = state.scores.X;
    elements.scoreO.textContent = state.scores.O;
    elements.scoreDraw.textContent = state.scores.draw;
}

/**
 * Update status message
 */
function updateStatus(message, className = '') {
    elements.status.textContent = message;
    elements.status.className = 'status ' + className;
}

/**
 * Render the board from state
 */
function renderBoard() {
    state.board.forEach((value, index) => {
        const cell = elements.cells[index];
        cell.textContent = value || '';
        cell.className = 'cell';
        if (value) {
            cell.classList.add('filled', value.toLowerCase());
            const isHumanMove = value === state.humanPlayer;
            cell.setAttribute('aria-label', `${cell.getAttribute('aria-label')}, ${isHumanMove ? 'Your move' : 'AI move'}`);
        } else {
            cell.setAttribute('aria-label', cell.getAttribute('aria-label').split(',')[0]);
        }
    });
}

/**
 * Reset the game
 */
function resetGame() {
    // Randomly assign AI as X or O
    state.aiPlayer = Math.random() < 0.5 ? 'X' : 'O';
    state.humanPlayer = state.aiPlayer === 'X' ? 'O' : 'X';
    state.currentPlayer = 'X'; // X always goes first
    state.board = Array(9).fill(null);
    state.gameOver = false;

    elements.cells.forEach(cell => {
        cell.className = 'cell';
        cell.textContent = '';
        const baseLabel = cell.getAttribute('aria-label').split(',')[0];
        cell.setAttribute('aria-label', baseLabel);
    });

    // Update subtitle to show who is who
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = `You (${state.humanPlayer}) vs AI (${state.aiPlayer})`;
    }

    // Determine whose turn it is
    if (state.currentPlayer === state.humanPlayer) {
        updateStatus(`Your turn (${state.humanPlayer})`, 'player-turn');
    } else {
        updateStatus('AI thinking...', 'ai-turn');
        // AI makes first move
        setTimeout(() => {
            if (!state.gameOver) {
                makeAIMove();
            }
        }, 500);
    }

    renderBoard();
}

/**
 * Handle window load
 */
document.addEventListener('DOMContentLoaded', init);