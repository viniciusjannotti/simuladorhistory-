import React from 'react';

export default function DonationCard() {
    return (
        <div className="card donation-card">
            <div className="donation-content">
                {/* PIX Section - Left Side */}
                <div className="pix-section">
                    <div className="pix-header">
                        <span className="pix-label">💙 APOIE (PIX): </span>
                        <span className="pix-name">Vinícius Jannotti</span>
                    </div>
                    <img src="/qr-code.png" alt="QR Code PIX" className="qr-code" />
                </div>

                {/* ROPS Section - Right Side */}
                <div className="rops-section">
                    <div className="rops-title">Ou via ROPS:</div>
                    <div className="rops-info">
                        <span className="rops-char">🎮 Peti</span>
                        <span className="rops-char">⚔️ Shura</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
