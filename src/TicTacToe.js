import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Sun, Moon, RotateCcw, Settings } from 'lucide-react';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState('2player'); // '2player' or 'computer'
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

    // Sound effects using Web Audio API
    const playSound = useCallback((type) => {
        if (!soundEnabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'move') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        } else if (type === 'win') {
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        }

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + (type === 'win' ? 0.3 : 0.1));
    }, [soundEnabled]);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let line of lines) {
            const [a, b, c] = line;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line };
            }
        }
        return null;
    };

    const getRandomMove = (squares) => {
        const availableMoves = squares
            .map((square, index) => square === null ? index : null)
            .filter(val => val !== null);

        if (availableMoves.length === 0) return null;
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    const handleClick = (index) => {
        if (board[index] || gameOver) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);
        playSound('move');

        const result = checkWinner(newBoard);
        if (result) {
            setWinner(result);
            setGameOver(true);
            setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
            playSound('win');
        } else if (newBoard.every(square => square !== null)) {
            setGameOver(true);
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        } else {
            setIsXNext(!isXNext);
        }
    };

    // Computer move effect
    useEffect(() => {
        if (gameMode === 'computer' && !isXNext && !gameOver) {
            const timer = setTimeout(() => {
                const move = getRandomMove(board);
                if (move !== null) {
                    handleClick(move);
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, gameOver, board]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setGameOver(false);
    };

    const resetScores = () => {
        setScores({ X: 0, O: 0, draws: 0 });
    };

    const renderSquare = (index) => {
        const isWinningSquare = winner?.line?.includes(index);

        return (
            <button
                key={index}
                className={`
          aspect-square text-4xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105
          ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'}
          ${isWinningSquare ? (darkMode ? 'bg-green-700' : 'bg-green-200') : ''}
          ${board[index] === 'X' ? 'text-blue-500' : 'text-red-500'}
          shadow-lg hover:shadow-xl
        `}
                onClick={() => handleClick(index)}
                disabled={gameOver || board[index]}
            >
                {board[index]}
            </button>
        );
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
            }`}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${darkMode ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'
                        } bg-clip-text text-transparent`}>
                        Tic Tac Toe
                    </h1>

                    {/* Controls */}
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-3 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                                } shadow-lg hover:shadow-xl`}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-3 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                                } shadow-lg hover:shadow-xl`}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-3 rounded-full transition-all duration-300 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                                } shadow-lg hover:shadow-xl`}
                        >
                            <Settings size={20} />
                        </button>
                    </div>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className={`mx-auto max-w-md p-6 rounded-2xl mb-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'
                            } shadow-xl`}>
                            <h3 className="text-xl font-semibold mb-4">Game Settings</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Game Mode</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setGameMode('2player'); resetGame(); }}
                                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${gameMode === '2player'
                                                    ? 'bg-blue-500 text-white'
                                                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                                }`}
                                        >
                                            2 Player
                                        </button>
                                        <button
                                            onClick={() => { setGameMode('computer'); resetGame(); }}
                                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${gameMode === 'computer'
                                                    ? 'bg-blue-500 text-white'
                                                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                                }`}
                                        >
                                            vs Computer
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={resetScores}
                                    className={`w-full px-4 py-2 rounded-lg transition-all duration-300 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                                        } text-white`}
                                >
                                    Reset Scores
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Status */}
                <div className={`text-center mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg max-w-md mx-auto`}>
                    {gameOver ? (
                        <div>
                            {winner ? (
                                <p className="text-2xl font-bold">
                                    🎉 Player <span className={winner.winner === 'X' ? 'text-blue-500' : 'text-red-500'}>
                                        {winner.winner}
                                    </span> Wins!
                                </p>
                            ) : (
                                <p className="text-2xl font-bold">🤝 It's a Draw!</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xl">
                            Current Player: <span className={isXNext ? 'text-blue-500' : 'text-red-500'}>
                                {isXNext ? 'X' : 'O'}
                            </span>
                            {gameMode === 'computer' && !isXNext && ' (Computer thinking...)'}
                        </p>
                    )}
                </div>

                {/* Scores */}
                <div className={`text-center mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg max-w-md mx-auto`}>
                    <h3 className="text-lg font-semibold mb-2">Scores</h3>
                    <div className="flex justify-around text-sm">
                        <div>Player X: <span className="font-bold text-blue-500">{scores.X}</span></div>
                        <div>Player O: <span className="font-bold text-red-500">{scores.O}</span></div>
                        <div>Draws: <span className="font-bold">{scores.draws}</span></div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="grid grid-cols-3 gap-3 p-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-2xl">
                        {Array.from({ length: 9 }, (_, i) => renderSquare(i))}
                    </div>
                </div>

                {/* Reset Button */}
                <div className="text-center">
                    <button
                        onClick={resetGame}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${darkMode
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            } shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto`}
                    >
                        <RotateCcw size={20} />
                        New Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicTacToe;