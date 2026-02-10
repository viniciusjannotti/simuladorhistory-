import React from 'react';
import ContentSelector from './ContentSelector';

export default function Sidebar({ contents, selectedContent, onContentChange, configControls }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="sidebar-title">Simulator Settings</h1>
            </div>

            <div className="sidebar-content">
                <ContentSelector
                    contents={contents}
                    selectedContent={selectedContent}
                    onContentChange={onContentChange}
                />

                {/* Configuration Section */}
                {configControls && (
                    <div className="config-section">
                        <h3 className="section-title">Configurações</h3>
                        {configControls}
                    </div>
                )}

                {/* Support Section */}
                <div className="support-section">
                    <h3 className="section-title">💙 Apoie o Projeto</h3>

                    {/* PIX Section */}
                    <div className="pix-section">
                        <div className="pix-label">PIX</div>
                        <img src="/qr-code.png" alt="QR Code PIX" className="qr-code" />
                        <div className="pix-name">Vinícius Jannotti</div>
                    </div>

                    {/* ROPS Section */}
                    <div className="rops-section">
                        <div className="rops-title">Apoie também com ROPS:</div>
                        <div className="rops-info">
                            <span className="rops-char">🎮 Aprimonk</span>
                            <span className="rops-char">⚔️ 275 Shura</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
