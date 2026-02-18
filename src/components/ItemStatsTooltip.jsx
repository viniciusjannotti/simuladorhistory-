import React from 'react';

/**
 * ItemStatsTooltip
 * 
 * Shows community statistics for a specific ITEM across all farms.
 * This is item-centric, not mob-centric.
 */
export default function ItemStatsTooltip({ contentId, levelId, itemId, communityStats, children }) {
    // 0. Handle Loading / Empty state as "Loading"
    // We treat [] or null as loading until the fetch in App.jsx completes
    if (!communityStats || communityStats.length === 0) {
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

    // Direct access to the single row for this content/level
    const row = communityStats[0];

    // Diagnostic Log as requested
    console.log("[Tooltip Row Used]", row);

    return (
        <div className="cell-hover">
            {children}
            <div className="community-tooltip">
                <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid #374151", paddingBottom: "4px" }}>
                    Estatísticas da Comunidade
                </div>

                {row && row.total_runs > 0 ? (
                    <>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Amostras: <span style={{ color: "#fff", fontWeight: "bold" }}>{row.total_runs} farms</span>
                        </div>

                        {row.avg_florzinha !== null && row.avg_florzinha !== undefined && (
                            <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                                Média Florzinha: <span style={{ color: "#fff", fontWeight: "bold" }}>{Number(row.avg_florzinha).toFixed(2)}%</span>
                            </div>
                        )}

                        {row.avg_multiplier !== null && row.avg_multiplier !== undefined && (
                            <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                                Média Multiplicador: <span style={{ color: "#fff", fontWeight: "bold" }}>{Number(row.avg_multiplier).toFixed(2)}x</span>
                            </div>
                        )}

                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Total drops: <span style={{ color: "#00ff88", fontWeight: "bold" }}>{row.total_drops}</span>
                        </div>

                        {row.drop_rate_real !== null && row.drop_rate_real !== undefined && (
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#00d9ff" }}>
                                Drop rate real: <span style={{ fontWeight: "bold" }}>{(Number(row.drop_rate_real) * 100).toFixed(2)}%</span>
                            </div>
                        )}

                        {row.drop_rate_base_estimated !== null && row.drop_rate_base_estimated !== undefined && (
                            <div style={{ fontSize: "12px", marginTop: "2px", color: "#00d9ff" }}>
                                Drop rate base est.: <span style={{ fontWeight: "bold" }}>{(Number(row.drop_rate_base_estimated) * 100).toFixed(2)}%</span>
                            </div>
                        )}

                        {row.drops_per_hour !== null && row.drops_per_hour !== undefined && (
                            <div style={{ fontSize: "12px", marginTop: "2px", color: "#ffa500" }}>
                                Drops/Hora: <span style={{ fontWeight: "bold" }}>{Number(row.drops_per_hour).toFixed(2)}</span>
                            </div>
                        )}

                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "6px", borderTop: "1px dashed #4b5563", paddingTop: "4px" }}>
                            Baseado em {row.total_time} min de farm total
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
