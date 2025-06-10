import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sun, Moon, Settings, RotateCcw, X } from 'lucide-react';
import {getOptimalMove} from "./minimax";

const TicTacToe = () => {
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [gameMode, setGameMode] = useState('2player');
    const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
    const [winningLine, setWinningLine] = useState([]);
    const [animatingSquare, setAnimatingSquare] = useState(null);

    useEffect(() => {
        document.documentElement.classList.toggle('dark');
        document.body.classList.toggle('dark');
    }, [darkMode]);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        return null;
    };

    const playSound = (type) => {
        if (!soundEnabled) return;
        
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        if (type === 'move') {
            oscillator.frequency.setValueAtTime(800, context.currentTime);
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        } else if (type === 'win') {
            oscillator.frequency.setValueAtTime(523.25, context.currentTime);
            oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
        }
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + (type === 'win' ? 0.3 : 0.1));
    };

    const makeComputerMove = (currentSquares) => {
        const availableSquares = currentSquares
            .map((square, index) => square === null ? index : null)
            .filter(val => val !== null);
        
        if (availableSquares.length === 0) return;
        
        // Get optimal move using minimax algorithm
        const optimalMoveIndex = getOptimalMove(currentSquares);
        
        setTimeout(() => {
            const newSquares = [...currentSquares];
            newSquares[optimalMoveIndex] = 'O';
            setSquares(newSquares);
            setAnimatingSquare(optimalMoveIndex);
            
            setTimeout(() => setAnimatingSquare(null), 300);
            
            const result = calculateWinner(newSquares);
            if (result) {
                setWinner(result);
                setWinningLine(result.line);
                setGameOver(true);
                playSound('win');
                setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
            } else if (newSquares.every(square => square !== null)) {
                setGameOver(true);
                setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            } else {
                setIsXNext(true);
            }
        }, 800);
    };

    const handleClick = (i) => {
        if (gameOver || squares[i] || (gameMode === 'computer' && !isXNext)) return;
        
        const newSquares = [...squares];
        newSquares[i] = isXNext ? 'X' : 'O';
        setSquares(newSquares);
        setAnimatingSquare(i);
        
        setTimeout(() => setAnimatingSquare(null), 300);
        
        playSound('move');
        
        const result = calculateWinner(newSquares);
        if (result) {
            setWinner(result);
            setWinningLine(result.line);
            setGameOver(true);
            playSound('win');
            setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
        } else if (newSquares.every(square => square !== null)) {
            setGameOver(true);
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        } else {
            if (gameMode === 'computer' && isXNext) {
                setIsXNext(false);
                makeComputerMove(newSquares);
            } else {
                setIsXNext(!isXNext);
            }
        }
    };

    const resetGame = () => {
        setSquares(Array(9).fill(null));
        setIsXNext(true);
        setGameOver(false);
        setWinner(null);
        setWinningLine([]);
        setAnimatingSquare(null);
    };

    const resetScores = () => {
        setScores({ X: 0, O: 0, draws: 0 });
    };

    const renderSquare = (i) => {
        const isWinningSquare = winningLine.includes(i);
        const isAnimating = animatingSquare === i;
        
        return (
            <button
                key={i}
                className={`
                    aspect-square text-3xl sm:text-4xl lg:text-5xl font-bold rounded-xl
                    transition-all duration-300 transform
                    ${darkMode 
                        ? 'bg-gray-600 hover:bg-gray-500 text-white shadow-lg' 
                        : 'bg-white hover:bg-gray-50 text-gray-800 shadow-md'
                    }
                    hover:scale-105 hover:shadow-xl
                    ${isWinningSquare ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                    ${isAnimating ? 'animate-bounce' : ''}
                    ${squares[i] === 'X' 
                        ? (darkMode ? 'text-blue-300' : 'text-blue-600') 
                        : squares[i] === 'O' 
                        ? (darkMode ? 'text-red-300' : 'text-red-600') 
                        : ''
                    }
                    disabled:cursor-not-allowed
                `}
                onClick={() => handleClick(i)}
                disabled={gameOver || squares[i] || (gameMode === 'computer' && !isXNext)}
            >
                <span className={`${isAnimating ? 'animate-ping' : ''} block`}>
                    {squares[i]}
                </span>
            </button>
        );
    };

    return (
        <div className={`min-h-screen transition-all duration-500 ${
            darkMode 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
            <div className="container mx-auto px-4 py-4 sm:py-8">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r ${
                        darkMode 
                            ? 'from-blue-400 to-purple-400' 
                            : 'from-blue-600 to-purple-600'
                    } bg-clip-text text-transparent animate-pulse`}>
                        Tic Tac Toe
                    </h1>
                    
                    <div className="flex justify-center items-center gap-2 sm:gap-4 mb-6">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                                darkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                    : 'bg-white hover:bg-gray-100 text-gray-800'
                            }`}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                                darkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                    : 'bg-white hover:bg-gray-100 text-gray-800'
                            }`}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl ${
                                darkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                    : 'bg-white hover:bg-gray-100 text-gray-800'
                            }`}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-4 sm:gap-6 lg:gap-10">
                    <div className="w-full md:w-auto md:flex-shrink-0 order-1 md:order-1">
                        <div className="flex gap-4 md:flex-col md:gap-6">
                            <div className="flex-1 md:flex-none text-center p-3 sm:p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 md:w-48 lg:w-56">
                                {gameOver ? (
                                    <div className="animate-bounce">
                                        {winner ? (
                                            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 dark:text-white">
                                                🎉 <span className={winner.winner === 'X' ? 'text-blue-500' : 'text-red-500'}>
                                                    {winner.winner}
                                                </span> Wins!
                                            </p>
                                        ) : (
                                            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 dark:text-white">🤝 Draw!</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-800 dark:text-white">
                                        <p className="text-xs sm:text-sm md:text-base font-medium mb-1 md:mb-2">Current Player:</p>
                                        <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${isXNext ? 'text-blue-500' : 'text-red-500'} animate-pulse`}>
                                            {isXNext ? 'X' : 'O'}
                                        </span>
                                        {gameMode === 'computer' && !isXNext && (
                                            <p className="text-xs md:text-sm mt-1 text-gray-600 dark:text-gray-400 animate-pulse">
                                                Computer...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 md:flex-none text-center p-3 sm:p-4 md:p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 md:w-48 lg:w-56">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 md:mb-3 text-gray-800 dark:text-white">Scores</h3>
                                <div className="flex justify-around md:flex-col md:space-y-2 text-xs sm:text-sm md:text-base">
                                    <div className="text-gray-800 dark:text-white">
                                        X: <span className="font-bold text-blue-500">{scores.X}</span>
                                    </div>
                                    <div className="text-gray-800 dark:text-white">
                                        O: <span className="font-bold text-red-500">{scores.O}</span>
                                    </div>
                                    <div className="text-gray-800 dark:text-white">
                                        Draws: <span className="font-bold text-gray-600 dark:text-gray-400">{scores.draws}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto md:flex-shrink-0 flex flex-col items-center order-2 md:order-2">
                        <div className="w-80 sm:w-96 md:w-80 lg:w-[420px] mb-4 sm:mb-6 md:mb-8">
                            <div className={`grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl shadow-2xl transition-all duration-300 ${
                                !gameOver 
                                    ? (isXNext 
                                        ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' 
                                        : 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800')
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
                            }`}>
                                {Array.from({ length: 9 }, (_, i) => renderSquare(i))}
                            </div>
                        </div>
                        <div className="text-center">
                            <button
                                onClick={resetGame}
                                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto text-sm sm:text-base"
                            >
                                <RotateCcw size={16} className="sm:w-5 sm:h-5" />
                                New Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-slideIn">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    Game Settings
                                </h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors transform hover:scale-110"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-3 text-gray-800 dark:text-white">
                                        Game Mode
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { 
                                                setGameMode('2player'); 
                                                resetGame(); 
                                                setShowSettings(false);
                                            }}
                                            className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                                gameMode === '2player'
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                                            }`}
                                        >
                                            2 Player
                                        </button>
                                        <button
                                            onClick={() => { 
                                                setGameMode('computer'); 
                                                resetGame(); 
                                                setShowSettings(false);
                                            }}
                                            className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                                gameMode === 'computer'
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                                            }`}
                                        >
                                            vs Computer
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        resetScores();
                                        setShowSettings(false);
                                    }}
                                    className="w-full px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold shadow-lg"
                                >
                                    Reset Scores
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToe;