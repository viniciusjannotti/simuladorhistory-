import React from 'react';

export default function Card({ children, className = '' }) {
    return (
        <div className={`gamer-card ${className}`}>
            {children}
        </div>
    );
}
