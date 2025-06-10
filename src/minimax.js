// minimax.js - Minimax algorithm implementation for Tic Tac Toe

const calculateWinner = (squares) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
};

export const isTerminal = (squares) => {
    const winner = calculateWinner(squares);
    return winner !== null || squares.every(square => square !== null);
};

const getAvailableMoves = (squares) => {
    return squares
        .map((square, index) => square === null ? index : null)
        .filter(val => val !== null);
};

const minimax = (squares, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
    const winner = calculateWinner(squares);
    
    // Terminal states
    if (winner === 'O') return 10 - depth; // Computer wins (O)
    if (winner === 'X') return depth - 10; // Human wins (X)
    if (squares.every(square => square !== null)) return 0; // Draw
    
    const availableMoves = getAvailableMoves(squares);
    
    if (isMaximizing) {
        // Computer's turn (O) - maximize score
        let maxScore = -Infinity;
        
        for (let move of availableMoves) {
            const newSquares = [...squares];
            newSquares[move] = 'O';
            
            const score = minimax(newSquares, depth + 1, false, alpha, beta);
            maxScore = Math.max(maxScore, score);
            
            // Alpha-beta pruning
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        
        return maxScore;
    } else {
        // Human's turn (X) - minimize score
        let minScore = Infinity;
        
        for (let move of availableMoves) {
            const newSquares = [...squares];
            newSquares[move] = 'X';
            
            const score = minimax(newSquares, depth + 1, true, alpha, beta);
            minScore = Math.min(minScore, score);
            
            // Alpha-beta pruning
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        
        return minScore;
    }
};

export const getOptimalMove = (squares) => {
    const availableMoves = getAvailableMoves(squares);
    
    if (availableMoves.length === 0) return null;
    
    // If it's the first move, prefer center or corner for better play
    if (availableMoves.length === 9) {
        const preferredFirstMoves = [4, 0, 2, 6, 8]; // center, then corners
        return preferredFirstMoves[0];
    }
    
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;
    
    for (let move of availableMoves) {
        const newSquares = [...squares];
        newSquares[move] = 'O';
        
        const score = minimax(newSquares, 0, false);
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
};