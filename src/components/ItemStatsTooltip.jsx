import React from 'react';

/**
 * ItemStatsTooltip
 * 
 * Shows community statistics for a specific ITEM across all farms.
 * This is item-centric, not mob-centric.
 */
export default function ItemStatsTooltip({ contentId, levelId, itemId, farmRecords, children }) {
    // 0. Handle Loading State
    if (farmRecords === null) {
        return (
            <div className="cell-hover">
                {children}
                <div className="community-tooltip">
                    <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px" }}>
                        Carregando estatísticas...
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                        Sincronizando com Supabase...
                    </div>
                </div>
            </div>
        );
    }

    // 1. Filter farms that belong to this CONTENT (all levels)
    const contentFarms = (farmRecords || []).filter(f => {
        const farmContentId = String(f.content_id || '').toLowerCase().trim();
        const targetContentId = String(contentId || '').toLowerCase().trim();
        // Match by ID or optional content name if present
        return farmContentId === targetContentId;
    });

    // 2. Filter farms for the specific LEVEL
    const specificFarms = contentFarms.filter(f => {
        const farmLevelId = String(f.level_id || '').toLowerCase().trim();
        const targetLevelId = String(levelId || '').toLowerCase().trim();
        return farmLevelId === targetLevelId;
    });

    // 3. Aggregate statistics helper
    const aggregate = (farms, targetItemId) => {
        const idToMatch = String(targetItemId || '').toLowerCase().trim();

        return farms.reduce((acc, farm) => {
            // Find item by ID
            const item = farm.items?.find(i => String(i.item_id || '').toLowerCase().trim() === idToMatch);

            if (item) {
                return {
                    total_samples: acc.total_samples + 1,
                    total_quantity: acc.total_quantity + (item.quantity || 0),
                    total_time: acc.total_time + (farm.time_minutes || farm.farm_time_minutes || 0),
                    total_mobs: acc.total_mobs + (farm.mobs_killed || 0)
                };
            }
            return acc;
        }, { total_samples: 0, total_quantity: 0, total_time: 0, total_mobs: 0 });
    };

    const specificStats = aggregate(specificFarms, itemId);
    const globalStats = aggregate(contentFarms, itemId);

    // Derived metrics for specific level
    const avgQuantity = specificStats.total_samples > 0
        ? (specificStats.total_quantity / specificStats.total_samples).toFixed(2)
        : 0;
    const dropRateReal = specificStats.total_mobs > 0
        ? ((specificStats.total_quantity / specificStats.total_mobs) * 100).toFixed(4)
        : null;

    return (
        <div className="cell-hover">
            {children}
            <div className="community-tooltip">
                <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid #374151", paddingBottom: "4px" }}>
                    Estatísticas da Comunidade
                </div>

                {specificStats.total_samples >= 10 ? (
                    <>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Amostras (Nível): <span style={{ color: "#fff", fontWeight: "bold" }}>{specificStats.total_samples} farms</span>
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Total farmado: <span style={{ color: "#00ff88", fontWeight: "bold" }}>{specificStats.total_quantity}</span>
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Média por farm: <span style={{ color: "#fff", fontWeight: "bold" }}>{avgQuantity}</span>
                        </div>
                        {dropRateReal && (
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#00d9ff" }}>
                                Drop rate real: <span style={{ fontWeight: "bold" }}>{dropRateReal}%</span>
                            </div>
                        )}
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "6px", borderTop: "1px dashed #4b5563", paddingTop: "4px" }}>
                            Baseado em {specificStats.total_time} min de farm total
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ color: "#ff4d4d", fontSize: "12px", marginBottom: "4px" }}>Dados insuficientes (Nível)</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            Amostras atuais: <span style={{ color: "#fff" }}>{specificStats.total_samples}</span>
                        </div>

                        {globalStats.total_samples > specificStats.total_samples && (
                            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                                No conteúdo (Geral): <span style={{ color: "#00ff88" }}>{globalStats.total_samples} amostras</span>
                            </div>
                        )}

                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "6px" }}>
                            Mínimo necessário: 10
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
