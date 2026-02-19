import React from 'react';

/**
 * ItemStatsTooltip
 * 
 * Shows community statistics for a specific ITEM across all farms.
 * Architecture: granular per ITEM.
 */
export default function ItemStatsTooltip({ communityStats, itemId, children }) {

    const getConfidenceBadge = (totalFarms) => {
        if (totalFarms < 3) return { type: 'low', label: '🔴 Poucas Amostras', hint: 'Tamanho de amostra muito pequeno, os resultados podem variar.' };
        if (totalFarms < 10) return { type: 'medium', label: '🟡 Amostra Média', hint: 'Os dados mostram alguma consistência.' };
        return { type: 'high', label: '🟢 Confiável', hint: 'Grande tamanho de amostra. Estatisticamente confiável.' };
    };

    const formatTime = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'No data';
        const now = new Date();
        const past = new Date(timestamp);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return 'Atualizado agora';
        if (diffInMins < 60) return `Atualizado há ${diffInMins}m`;
        if (diffInHours < 24) return `Atualizado há ${diffInHours}h`;
        return `Atualizado há ${diffInDays}d`;
    };

    // 0. Handle Loading state (null)
    if (communityStats === null) {
        return (
            <div className="cell-hover">
                {children}
                <div className="community-tooltip">
                    <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px" }}>
                        Carregando estatísticas...
                    </div>
                </div>
            </div>
        );
    }

    // 1. Find the specific row for this item
    const row = Array.isArray(communityStats) ? communityStats.find(r => r.item_id === itemId) : null;

    const confidence = row ? getConfidenceBadge(row.total_runs) : null;

    return (
        <div className="cell-hover">
            {children}
            <div className="community-tooltip">
                {confidence && (
                    <div className={`confidence-badge badge-${confidence.type}`} title={confidence.hint}>
                        {confidence.label}
                    </div>
                )}

                <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "8px", borderBottom: "1px solid #374151", paddingBottom: "4px", paddingRight: "40px" }}>
                    Estatísticas Globais
                </div>

                {row ? (
                    <>
                        {row.avg_florzinha !== null && row.avg_florzinha !== undefined && (
                            <div style={{ fontSize: "12px", marginBottom: "3px" }}>
                                Média florzinha: <span style={{ color: "#fff", fontWeight: "bold" }}>{Number(row.avg_florzinha).toFixed(2)}%</span>
                            </div>
                        )}

                        {row.avg_multiplier !== null && row.avg_multiplier !== undefined && (
                            <div style={{ fontSize: "12px", marginBottom: "3px" }}>
                                Multiplicador médio: <span style={{ color: "#fff", fontWeight: "bold" }}>{Number(row.avg_multiplier).toFixed(2)}x</span>
                            </div>
                        )}

                        {row.drop_rate_real !== null && row.drop_rate_real !== undefined && (
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#00ff88" }}>
                                Drop rate real: <span style={{ fontWeight: "bold" }}>{(Number(row.drop_rate_real) * 100).toFixed(2)}%</span>
                            </div>
                        )}

                        {row.drops_per_hour !== null && row.drops_per_hour !== undefined && (
                            <div style={{ fontSize: "12px", marginTop: "2px", color: "#ffa500" }}>
                                Drops/Hora: <span style={{ fontWeight: "bold" }}>{Number(row.drops_per_hour).toFixed(2)}</span>
                            </div>
                        )}

                        <hr className="sample-quality-divider" />

                        <span className="sample-quality-title">Qualidade da Amostra</span>

                        <div className="sample-row">
                            <span className="sample-label">Total Farms:</span>
                            <span className="sample-value">{row.total_runs}</span>
                        </div>
                        <div className="sample-row">
                            <span className="sample-label">Total Mobs:</span>
                            <span className="sample-value">{Number(row.total_samples || 0).toLocaleString()}</span>
                        </div>
                        <div className="sample-row">
                            <span className="sample-label">Tempo Total:</span>
                            <span className="sample-value">{formatTime(row.total_time)}</span>
                        </div>
                        <div className="sample-row">
                            <span className="sample-label">Total Drops:</span>
                            <span className="sample-value">{row.total_drops}</span>
                        </div>

                        <div className="last-update-text">
                            {getTimeAgo(row.last_updated_at)}
                        </div>
                    </>
                ) : (
                    <div style={{ color: "#9ca3af", fontSize: "12px", padding: "4px 0" }}>
                        Dados insuficientes
                    </div>
                )}
            </div>
        </div>
    );
}
