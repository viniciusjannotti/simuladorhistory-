import React from 'react';

// Icon mapping based on content name/id
const getContentIcon = (content) => {
    const name = content.name.toLowerCase();
    const id = content.content_id.toLowerCase();

    // Map content to icon images
    if (name.includes('moedas') || name.includes('selada')) {
        return '/icons/moedas_selada.png';
    }
    if (name.includes('villa') || name.includes('zeny')) {
        return '/icons/villa_zenys.png';
    }
    if (name.includes('fenda maior')) {
        return '/icons/fenda_maior.png';
    }
    if (name.includes('dimensional') || name.includes('fenda dimensional')) {
        return '/icons/fenda_dimensional.png';
    }
    if (name.includes('trial')) {
        return '/icons/trial.png';
    }
    if (name.includes('glast') || name.includes('extreme')) {
        return '/icons/glast_heim.png';
    }

    // Default emoji for unmapped contents (will be replaced when 7th icon is generated)
    return null; // Will show emoji fallback
};

export default function ContentSelector({ contents, selectedContent, onContentChange }) {
    if (!contents || contents.length === 0) {
        return null;
    }

    return (
        <div className="content-selector">
            <h3 className="section-title">Conteúdo</h3>
            <div className="content-grid">
                {contents.map(content => {
                    const iconPath = getContentIcon(content);

                    return (
                        <button
                            key={content.content_id}
                            className={`content-button ${selectedContent === content.content_id ? 'active' : ''}`}
                            onClick={() => onContentChange(content.content_id)}
                        >
                            {iconPath ? (
                                <img
                                    src={iconPath}
                                    alt={content.name}
                                    className="content-icon-img"
                                />
                            ) : (
                                <span className="content-icon">📦</span>
                            )}
                            <span className="content-name">{content.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
