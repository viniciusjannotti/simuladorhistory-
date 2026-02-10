import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, contents, selectedContent, onContentChange, configControls }) {
    return (
        <div className="app-layout">
            <Sidebar
                contents={contents}
                selectedContent={selectedContent}
                onContentChange={onContentChange}
                configControls={configControls}
            />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
