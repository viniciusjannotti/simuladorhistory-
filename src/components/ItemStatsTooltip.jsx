import React from 'react';

/**
 * ItemStatsTooltip
 * 
 * Shows community statistics for a specific ITEM across all farms.
 * This is item-centric, not mob-centric.
 */
export default function ItemStatsTooltip({ contentId, levelId, itemId, farmRecords, children }) {
    // Filter farms that have this specific item
    const relevantFarms = (farmRecords || []).filter(f => {
        const contentMatch = String(f.content_id).toLowerCase() === String(contentId).toLowerCase();
        const levelMatch = String(f.level_id).toLowerCase() === String(levelId).toLowerCase();
        const hasItem = f.items?.some(i => String(i.item_id).toLowerCase() === String(itemId).toLowerCase());

        return contentMatch && levelMatch && hasItem;
    });

    // Aggregate statistics for this item
    const stats = relevantFarms.reduce((acc, farm) => {
        const item = farm.items.find(i => String(i.item_id).toLowerCase() === String(itemId).toLowerCase());

        return {
            total_samples: acc.total_samples + 1,
            total_quantity: acc.total_quantity + (item?.quantity || 0),
            total_time: acc.total_time + (farm.time_minutes || farm.farm_time_minutes || 0),
            total_mobs: acc.total_mobs + (farm.mobs_killed || 0)
        };
    }, {
        total_samples: 0,
        total_quantity: 0,
        total_time: 0,
        total_mobs: 0
    });

    // Calculate derived metrics
    const avgQuantityPerFarm = stats.total_samples > 0
        ? (stats.total_quantity / stats.total_samples).toFixed(2)
        : 0;

    const dropRateReal = stats.total_mobs > 0
        ? ((stats.total_quantity / stats.total_mobs) * 100).toFixed(4)
        : null;

    return (
        <div className="cell-hover">
            {children}
            <div className="community-tooltip">
                <div style={{ color: "#00d9ff", fontWeight: "bold", marginBottom: "4px", borderBottom: "1px solid #374151", paddingBottom: "4px" }}>
                    Dados da Comunidade
                </div>
                {stats.total_samples >= 10 ? (
                    <>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Amostras: <span style={{ color: "#fff", fontWeight: "bold" }}>{stats.total_samples} farms</span>
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Total farmado: <span style={{ color: "#00ff88", fontWeight: "bold" }}>{stats.total_quantity} unidades</span>
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Média por farm: <span style={{ color: "#fff", fontWeight: "bold" }}>{avgQuantityPerFarm}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                            Tempo total: {stats.total_time} min
                        </div>
                        {dropRateReal && (
                            <div style={{ fontSize: "12px", marginTop: "4px", color: "#00d9ff" }}>
                                Drop rate real: <span style={{ fontWeight: "bold" }}>{dropRateReal}%</span>
                            </div>
                        )}
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px", fontStyle: "italic" }}>
                            * Baseado em farms reais
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ color: "#ff4d4d", fontSize: "12px" }}>Dados insuficientes</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>Amostras atuais: {stats.total_samples}</div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "4px" }}>
                            Mínimo necessário: 10
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
