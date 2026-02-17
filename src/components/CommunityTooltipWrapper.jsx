import React from 'react';

/**
 * CommunityTooltipWrapper
 * 
 * Reusable component to show community farm data in a tooltip on hover.
 * Using real locally stored data instead of mocks.
 */
export default function CommunityTooltipWrapper({ contentId, levelId, mode, farmRecords, children }) {
    // Logic for Community Stats (Dynamic from local state)
    // Filters by content, level, and the specific monster mode
    const relevantFarms = (farmRecords || []).filter(f => {
        const contentMatch = f.content_id === contentId;
        const levelMatch = f.level_id === levelId;

        // If record has a mode field, it must match
        // If record has no mode field, treat it as "normal" mode
        const modeMatch = f.mode ? f.mode === mode : mode === 'normal';

        return contentMatch && levelMatch && modeMatch;
    });

    const samples = relevantFarms.length;

    const calculateStats = (farms) => {
        if (farms.length < 10) return null;

        // Extract fatigue times and sort
        const times = farms.map(f => f.first_fatigue_minutes).sort((a, b) => a - b);
        const n = times.length;

        // Garmoth approach: remove extremes (10% from each side)
        // Ensure at least 1 is removed if n >= 10
        const toRemove = Math.max(1, Math.floor(n * 0.1));
        const trimmed = times.slice(toRemove, n - toRemove);

        if (trimmed.length === 0) return null;

        const sum = trimmed.reduce((acc, val) => acc + val, 0);
        const average = (sum / trimmed.length).toFixed(1);
        const bestTime = Math.min(...trimmed).toFixed(1);

        return { average, bestTime };
    };

    const stats = calculateStats(relevantFarms);

    return (
        <div className="cell-hover">
            {children}
            <div className="community-tooltip">
                <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid #374151", paddingBottom: "4px" }}>
                    Dados da Comunidade
                </div>
                {stats ? (
                    <>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>Média: <span style={{ color: "#fff", fontWeight: "bold" }}>{stats.average} min</span></div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>Melhor tempo: <span style={{ color: "#00ff88", fontWeight: "bold" }}>{stats.bestTime} min</span></div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Amostras: {samples} farms</div>
                        <div style={{ fontSize: "10px", color: "#00d9ff", marginTop: "4px", fontStyle: "italic" }}>
                            * Baseado em farms reais deste modo
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ color: "#ff4d4d", fontSize: "12px" }}>Dados insuficientes</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Amostras atuais: {samples}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>
                            Minimo necessário: 10
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
