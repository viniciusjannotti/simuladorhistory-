import React from 'react';

export default function SimTable({ data }) {
    if (!data) return null;

    const rows = [
        ["Simulações", data.simulations],
        ["Média (kills)", data.avg_kills],
        ["Mediana (kills)", data.median_kills],
        ["P10", data.p10],
        ["P25", data.p25],
        ["P75", data.p75],
        ["P90", data.p90],
    ];

    return (
        <div className="card">
            <h3>Resultados da Simulação</h3>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px"
            }}>
                <thead>
                    <tr>
                        <th style={{ padding: "8px", textAlign: "left" }}>Estatística</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([label, value]) => (
                        <tr key={label}>
                            <td style={{
                                padding: "8px",
                                borderBottom: "1px solid #2a3142"
                            }}>{label}</td>
                            <td style={{
                                padding: "8px",
                                borderBottom: "1px solid #2a3142",
                                textAlign: "right",
                                color: "#10b981",
                                fontWeight: "600"
                            }}>
                                {typeof value === "number" ? value.toFixed(2) : value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
