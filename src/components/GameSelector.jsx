import React, { useState } from 'react';

const games = [
    { id: 'diablo', name: 'Diablo', icon: '💀' },
    { id: 'wow', name: 'WoW', icon: '⚔️' },
    { id: 'destiny', name: 'Destiny', icon: '🚀' },
    { id: 'genshin', name: 'Genshin', icon: '🎮' },
    { id: 'warframe', name: 'Warframe', icon: '🤖' }
];

export default function GameSelector() {
    const [selectedGame, setSelectedGame] = useState('genshin');

    return (
        <div className="game-selector">
            <h3 className="section-title">Game</h3>
            <div className="game-grid">
                {games.map(game => (
                    <button
                        key={game.id}
                        className={`game-button ${selectedGame === game.id ? 'active' : ''}`}
                        onClick={() => setSelectedGame(game.id)}
                    >
                        <span className="game-icon">{game.icon}</span>
                        <span className="game-name">{game.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
