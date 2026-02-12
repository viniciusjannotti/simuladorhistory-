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


            </div>
        </aside>
    );
}
