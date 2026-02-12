import React from 'react';

export default function MonsterTable({ data }) {
    if (!data || !data.monsters || !data.drops) return null;

    return (
        <div className="card" style={{ overflowX: 'auto' }}>
            <h3>Drops </h3>
            <p>Bônus Geral: {data.B_general_percent}% | Bônus Final: {data.B_final_percent}%</p>

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
                    {data.drops.map((drop) => (
                        <tr key={drop.item_id}>
                            <td style={{
                                padding: "8px",
                                borderBottom: "1px solid #2a3142",
                                fontWeight: "500",
                                position: "sticky",
                                left: 0,
                                background: "#151923"
                            }}>
                                {drop.item_name}
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
                                            <div>
                                                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#00d9ff" }}>
                                                    {rate.final.toFixed(4)}%
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                                    (base: {rate.base.toFixed(4)}%)
                                                </div>
                                            </div>
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
