import React from 'react';

export default function CalcTable({ data }) {
    if (!data) return null;

    const rows = [
        ["Florzinha (%)", data.drop_florzinha_percent],
        ["Chance Final (%)", data.p_final_percent],
        ["Drop base (%)", data.p_base_percent],
        ["Bônus Geral (%)", data.B_general_percent],
        ["Bônus Final (%)", data.B_final_percent],
        ["Drop Intermediário (%)", data.p_inter_percent],
        ["Prob. ≥ 1 drop em N kills", data.prob_at_least_one_in_N],
        ["Drops esperados", data.expected_drops_in_N],
        ["Média de kills p/ 1 drop", data.mean_kills_for_one],
        ["Mediana 50% (kills)", data.median_kills_for_50pct],
    ];

    return (
        <div className="card">
            <h3>Resultados do Cálculo</h3>
            <table style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px"
            }}>
                <thead>
                    <tr>
                        <th style={{ padding: "8px", textAlign: "left" }}>Descrição</th>
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
                                color: "#00d9ff",
                                fontWeight: "600"
                            }}>
                                {typeof value === "number" ? value.toFixed(4) : value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
