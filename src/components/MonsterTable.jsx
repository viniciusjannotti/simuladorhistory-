import React from 'react';
import ItemStatsTooltip from './ItemStatsTooltip';

export default function MonsterTable({ data, contentId, levelId, onRegisterFarm, communityStats }) {
    if (!data || !data.monsters || !data.drops) return null;

    const florzinhaDrop = data.drops.find(d => d.item_id === 'florzinha');
    const otherDrops = data.drops.filter(d => d.item_id !== 'florzinha');

    // Fallback calculation for when florzinha is not in the data
    const florzinhaVal = florzinhaDrop
        ? Math.max(...data.monsters.map(m => florzinhaDrop.calculated_rates[m.monster_id]?.final || 0))
        : Math.min(2.0 * (1 + data.B_general_percent / 100.0) * (1 + data.B_final_percent / 100.0), 90.0);

    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '24px' }}>
                <h3 style={{ margin: 0 }}>Drops </h3>
                <div className="drops-header-info" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <span>Bônus Geral: {data.B_general_percent}% | Bônus Final: {data.B_final_percent}%</span>
                    <span className="florzinha-metric-header">
                        🌸 Florzinha: <strong>{florzinhaVal.toFixed(4)}%</strong>
                    </span>
                    {(contentId === 'moedas' || contentId === 'villa_of_zenys' || contentId === 'fenda_maior' || contentId === 'trial' || contentId === 'glast_heim_extreme' || contentId === 'dominio') && (levelId === '1' || levelId === '2' || contentId === 'fenda_maior' || contentId === 'trial' || contentId === 'glast_heim_extreme' || contentId === 'dominio') && (
                        <button className="btn-registrar" onClick={() => onRegisterFarm(contentId, levelId, data.drops)}>
                            + Registrar Farm
                        </button>
                    )}
                </div>
            </div>

            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "8px",
                minWidth: "800px"
            }}>
                <thead>
                    <tr>
                        <th style={{ padding: "8px", textAlign: "left", position: "sticky", left: 0, background: "#1a1f2e" }}>
                            Item
                        </th>
                        {data.monsters.map(monster => (
                            <th key={monster.monster_id} style={{ padding: "8px", textAlign: "center" }}>
                                {monster.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {otherDrops.map((drop) => (
                        <tr key={drop.item_id}>
                            <td style={{
                                padding: "8px",
                                borderBottom: "1px solid #2a3142",
                                fontWeight: "500",
                                position: "sticky",
                                left: 0,
                                background: "#151923"
                            }}>
                                <ItemStatsTooltip
                                    communityStats={communityStats}
                                    itemId={drop.item_id}
                                >
                                    {drop.item_name}
                                </ItemStatsTooltip>
                            </td>
                            {data.monsters.map(monster => {
                                const rate = drop.calculated_rates[monster.monster_id];

                                return (
                                    <td key={monster.monster_id} style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #2a3142",
                                        textAlign: "center"
                                    }}>
                                        {rate ? (
                                            <>
                                                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00d9ff" }}>
                                                    {rate.final.toFixed(4)}%
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                                    (base: {rate.base.toFixed(4)}%)
                                                </div>
                                            </>
                                        ) : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
