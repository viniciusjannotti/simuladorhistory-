import { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import MonsterTable from './components/MonsterTable';
import DonationCard from './components/DonationCard';
import ItemStatsTooltip from './components/ItemStatsTooltip';
import FarmRegistrationModal from './components/FarmRegistrationModal';
import { supabase } from './lib/supabaseClient';
import { logger } from './lib/logger';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://simulador-backend-x3u3.onrender.com';



function App() {
    // Cascata de seletores
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState(() => {
        return localStorage.getItem("selectedContent") || 'caminho_iniciante';
    });
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(() => {
        return localStorage.getItem("selectedLevel") || '18';
    });
    const [allDropsData, setAllDropsData] = useState(null); // Armazena resultado do /calculate-all
    const [monsterTableData, setMonsterTableData] = useState(null); // Armazena resultado do /calculate-monster-table

    // presets / tabelas — DEFINIDAS ANTES DE USAR
    const RATE_PRESETS = { "100x": 0, "50x": 12, "25x": 25, "12x": 37, "1x": 50, "1x Temporada": 60, "1x Temporada 275": 70 };
    const VIP_PRESETS = { "Nenhum": 0, "VIP 1": 10, "VIP 1+2": 20 };
    const PET_PRESETS = { "Nenhum": 0, "Pet 45%": 15, "Pet 70%": 20, "Pet 90%": 30, "Pet 150%": 50 };
    const MEMBER_PRESETS = { "0": 0, "1": 50 };
    const BIO_REPUTATION_PRESETS = { "0 Bolinhas": 0, "1 Bolinha": 2, "2 Bolinhas": 4, "3 Bolinhas": 6 };
    const CHEFF_PRESETS = { "Nenhum": 0, "1 Bolinha": 2, "2 Bolinhas": 4, "3 Bolinhas": 6 };
    const TEMP_PRESETS = { "Nenhum": 0, "5 Feitos": 2, "10 Feitos": 4, "14 Feitos": 6, "18 Feitos": 8 };


    // consumíveis iniciais (checkbox state)
    const [consumables, setConsumables] = useState({

    });
    const consumablesList = {
        calice: "Cálice (+220%)",
        chicle: "Chicle de Bola / Manual (+200%)",
        chiclete: "Chiclete (+100%)",
        lata: "Lata para Gatos (+20%)",
        drop_pot: "Drop em Pote (+25%)",
        fusion: "Fusão em Pote (+25%)",
        doador: "Poção do Doador (+35%)",

    };

    // resultados
    const [connectionError, setConnectionError] = useState(null);

    // Farm Registration State
    const [communityStats, setCommunityStats] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ contentId: '', levelId: '' });

    // Race condition prevention refs
    const lastCalcController = useRef(null);
    const lastSimController = useRef(null);

    const handleRegisterFarm = (contentId, levelId, availableDrops = []) => {
        setModalContext({ contentId, levelId, availableDrops });
        setIsModalOpen(true);
    };

    const handleSaveFarm = async (record) => {
        if (!supabase) {
            alert('Não foi possível salvar:\n\n1. Supabase não configurado no Vercel (Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações do projeto).\n2. Ou arquivo .env local incompleto.');
            return;
        }


        try {
            // Standardize record before saving
            const finalRecord = {
                ...record,
                timestamp: record.timestamp || new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('farm_records')
                .insert([{
                    content_id: finalRecord.content_id,
                    level_id: finalRecord.level_id,
                    data: finalRecord
                }])
                .select(); // Select back to verify what was actually stored

            if (error) {
                throw error;
            }

            logger.log('Registro salvo com sucesso no Supabase.');
        } catch (err) {
            logger.error('Erro ao salvar no Supabase:', err);
            alert('Erro ao salvar registro no Supabase. Verifique sua conexão.');
        }
    };

    // modifiers state (controlled inputs)
    const [modifiers, setModifiers] = useState({

    });

    const handleModifierChange = (e) => {
        const { id, value } = e.target;
        setModifiers(prev => ({ ...prev, [id]: value }));
    };

    // Carrega conteúdos ao montar o componente
    useEffect(() => {
        const controller = new AbortController();

        fetch(API_BASE + "/contents", { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                setContents(data.contents || []);
                // Carrega níveis do primeiro conteúdo
                if (data.contents && data.contents.length > 0) {
                    loadLevels(data.contents[0].content_id);
                }
                setConnectionError(null);
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                logger.error("Erro ao carregar conteúdos:", err);
                setConnectionError("Erro de conexão: Verifique se o backend está rodando.");
            });

        return () => controller.abort();
    }, []);

    // Carrega estatísticas da comunidade do Supabase
    useEffect(() => {
        if (!supabase) return;
        if (!selectedContent || !selectedLevel) return;

        let isMounted = true;
        setCommunityStats(null);

        const fetchCommunityStats = async () => {
            const { data, error } = await supabase
                .from('community_stats')
                .select('*')
                .eq('content_id', selectedContent)
                .eq('level_id', selectedLevel);

            if (!isMounted) return;

            if (error) {
                logger.error("[CommunityStats] Erro ao buscar:", error);
                setCommunityStats(null);
                return;
            }

            logger.info(`[CommunityStats] Sucesso: ${data?.length || 0} itens carregados para ${selectedContent}/${selectedLevel}`);
            setCommunityStats(data);
        };

        fetchCommunityStats();
        return () => { isMounted = false; };
    }, [selectedContent, selectedLevel]);

    // Persiste seleções no localStorage
    useEffect(() => {
        localStorage.setItem("selectedContent", selectedContent);
    }, [selectedContent]);

    useEffect(() => {
        localStorage.setItem("selectedLevel", selectedLevel);
    }, [selectedLevel]);

    // Carrega níveis quando o conteúdo muda
    const loadLevels = (contentId) => {
        setSelectedContent(contentId);
        fetch(API_BASE + `/contents/${contentId}/levels`)
            .then(res => res.json())
            .then(data => {
                setLevels(data.levels || []);
                // Só atualiza o nível selecionado
                if (data.levels && data.levels.length > 0) {
                    setSelectedLevel(data.levels[0].level_id);
                }
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                logger.error("Erro ao carregar níveis:", err);
            });
    };

    // Função para recalcular drops quando modificadores mudam
    const recalculateDrops = () => {
        if (!selectedContent || !selectedLevel) return;

        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const memberBonus = Number(modifiers.memberPreset) || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const cheffBonus = CHEFF_PRESETS[modifiers.cheffPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

        const payload = {
            content_id: selectedContent,
            level_id: selectedLevel,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheff_bonus: cheffBonus,
                temp_bonus: tempBonus,
                profs: 0
            },
            final_mods: {
            },
            consumables: Object.keys(consumables).filter(k => consumables[k])
        };

        // Abort previous recalculation if any
        if (lastCalcController.current) lastCalcController.current.abort();
        lastCalcController.current = new AbortController();

        fetch(API_BASE + "/drop/calculate-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: lastCalcController.current.signal
        })
            .then(res => {
                if (!res.ok) throw new Error("API Indisponível (404/500)");
                return res.json();
            })
            .then(data => {
                setAllDropsData(data);
                setConnectionError(null);
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                setConnectionError("Modo Normal indisponível no servidor remoto. Use o Backend Local.");
            });
    };

    // Função para carregar drops de monster table
    const loadMonsterTable = () => {
        if (!selectedContent || !selectedLevel) return;

        // Primeiro verifica se é monster_table
        const currentContent = Array.isArray(contents) ? contents.find(c => c.content_id === selectedContent) : null;
        if (!currentContent || currentContent.type !== 'monster_table') {
            return;
        }

        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const memberBonus = Number(modifiers.memberPreset) || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const cheffBonus = CHEFF_PRESETS[modifiers.cheffPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

        const payload = {
            content_id: selectedContent,
            level_id: selectedLevel,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheff_bonus: cheffBonus,
                temp_bonus: tempBonus,
                profs: 0
            },

            final_mods: {
            },
            consumables: Object.keys(consumables).filter(k => consumables[k])
        };

        // Abort previous monster table fetch if any
        if (lastCalcController.current) lastCalcController.current.abort();
        lastCalcController.current = new AbortController();

        fetch(API_BASE + "/drop/calculate-monster-table", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: lastCalcController.current.signal
        })
            .then(res => {
                if (!res.ok) throw new Error("Conteúdo não suportado neste servidor");
                return res.json();
            })
            .then(data => {
                setMonsterTableData(data);
                setConnectionError(null);
            })
            .catch(err => {
                if (err.name === 'AbortError') return;
                setConnectionError("A Tabela de Monstros requer o Backend Local rodando.");
            });
    };

    // Recalcula quando qualquer dependencia muda (level, consumiveis, modificadores)
    useEffect(() => {
        if (!selectedContent || !selectedLevel) return;

        // Busca o conteúdo atual para verificar o tipo
        const currentContent = Array.isArray(contents) ? contents.find(c => c.content_id === selectedContent) : null;

        if (currentContent && currentContent.type === 'monster_table') {
            // Limpa a tabela normal e carrega a tabela de monstros
            setAllDropsData(null);
            loadMonsterTable();
        } else {
            // Limpa a tabela de monstros e carrega a tabela normal
            setMonsterTableData(null);
            recalculateDrops();
        }
    }, [selectedLevel, selectedContent, consumables, modifiers]);

    function handleConsumableChange(key) {
        setConsumables(prev => {
            const newVal = { ...prev, [key]: !prev[key] };
            return newVal;
        });
    }


    return (
        <Layout
            contents={contents}
            selectedContent={selectedContent}
            onContentChange={loadLevels}
            configControls={
                <>
                    <label>Nível / Andar:
                        <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
                            {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.name}</option>)}
                        </select>
                    </label>
                    {monsterTableData ? (
                        <p style={{ fontStyle: "italic", fontSize: "12px" }}>Modo Tabela de Monstros Ativo</p>
                    ) : (
                        <p style={{ fontStyle: "italic", fontSize: "12px" }}>Modo Cálculo Normal (Drops Gerais)</p>
                    )}
                    {connectionError && (
                        <div style={{
                            marginTop: "10px",
                            padding: "12px",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid #ef4444",
                            borderRadius: "8px",
                            color: "#fca5a5",
                            fontSize: "12px",
                            lineHeight: "1.4"
                        }}>
                            <strong style={{ color: "#ef4444", display: "block", marginBottom: "4px" }}>⚠️ BACKEND OU CONFIGURAÇÃO INDISPONÍVEL</strong>
                            {connectionError}
                            <hr style={{ margin: "8px 0", borderColor: "rgba(239, 68, 68, 0.2)" }} />
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                {selectedContent === 'moedas_cheffenia_bio5' || selectedContent === 'monster_table' ?
                                    "Este conteúdo requer o Backend Local rodando ou suporte no servidor remoto." :
                                    "Verifique se as variáveis de ambiente (VITE_) estão configuradas no Vercel."
                                }
                            </div>
                        </div>
                    )}
                </>
            }
        >
            <div className="card header-card">
                <div className="header-info">
                    <h2>Hero Drop Simulator</h2>
                    <h4>O último doador terá suas informações como padrão até o próximo valor superior ou 30 dias corridos: Envie discord junto a doação!</h4>
                    <p>Último doador: Você? || Valor: R$0,01 / 0k Rops || Data de vencimento:  </p>
                </div>
                <div className="header-donation">
                    <DonationCard />
                </div>
            </div>

            {/* Se o modo tabela estiver ativo, mostra a tabela de monstros */}
            {monsterTableData && (
                <MonsterTable
                    data={monsterTableData}
                    contentId={selectedContent}
                    levelId={selectedLevel}
                    onRegisterFarm={handleRegisterFarm}
                    communityStats={communityStats}
                />
            )}
            {!monsterTableData && allDropsData && (() => {
                const florzinha = allDropsData.drops.find(d => d.item_id === 'florzinha');
                const otherDrops = allDropsData.drops.filter(d => d.item_id !== 'florzinha');

                // Fallback calculation for when florzinha is not in the data
                const florzinhaVal = florzinha ? florzinha.p_final_percent :
                    Math.min(2.0 * (1 + allDropsData.B_general_percent / 100.0) * (1 + allDropsData.B_final_percent / 100.0), 90.0);

                return (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '24px' }}>
                            <h3 style={{ margin: 0 }}>Drops</h3>
                            <div className="drops-header-info" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                <span>Bônus Geral: {allDropsData.B_general_percent}% | Bônus Final: {allDropsData.B_final_percent}%</span>
                                <span className="florzinha-metric-header">
                                    🌸 Florzinha: <strong>{florzinhaVal.toFixed(4)}%</strong>
                                    {(selectedContent === 'villa_of_zenys' || selectedContent === 'caminho_iniciante' || selectedContent === 'labirinto_valquirias' || selectedContent === 'jardim_sagrado' || selectedContent === 'trilha_heroi' || selectedContent === 'campo_minerador' || selectedContent === 'legiao' || selectedContent === 'unknown_blue_hole' || selectedContent === 'ascensao_somatologica') && (
                                        <button
                                            className="btn-registrar"
                                            onClick={() => handleRegisterFarm(selectedContent, selectedLevel, allDropsData.drops)}
                                        >
                                            + Registrar Farm
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                            <thead>
                                <tr style={{ background: "#1a1f2e", borderBottom: "2px solid #00d9ff" }}>
                                    <th style={{ padding: "8px", textAlign: "left", color: "#00d9ff" }}>Item</th>
                                    <th style={{ padding: "8px", textAlign: "right", color: "#00d9ff" }}>Base</th>
                                    <th style={{ padding: "8px", textAlign: "right", color: "#00d9ff" }}>Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {otherDrops.map(d => (
                                    <tr key={d.item_id} style={{ borderBottom: "1px solid #2a3142" }}>
                                        <td style={{ padding: "8px", color: "#e4e7eb" }}>
                                            <ItemStatsTooltip
                                                communityStats={communityStats}
                                                itemId={d.item_id}
                                            >
                                                {d.item_name}
                                            </ItemStatsTooltip>
                                        </td>
                                        <td style={{ padding: "8px", textAlign: "right", color: "#9ca3af" }}>{d.base_drop_percent}%</td>
                                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: "#00d9ff" }}>
                                            {d.p_final_percent.toFixed(4)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })()}

            <div className="row">
                <div className="card">
                    <h3>Modificadores Gerais</h3>
                    <label>Rate do Servidor:
                        <select id="ratePreset" value={modifiers.ratePreset} onChange={handleModifierChange}>
                            {Object.keys(RATE_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>VIP:
                        <select id="vipPreset" value={modifiers.vipPreset} onChange={handleModifierChange}>
                            {Object.keys(VIP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Pet:
                        <select id="petPreset" value={modifiers.petPreset} onChange={handleModifierChange}>
                            {Object.keys(PET_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Membro HGC (Villa?):
                        <select id="memberPreset" value={modifiers.memberPreset} onChange={handleModifierChange}>
                            <option value="0">Não</option>
                            <option value="1">Sim</option>
                        </select>
                    </label>
                    <label>Reputação Bio 5:
                        <select id="bioReputationPreset" value={modifiers.bioReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(BIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Reputação Cheffênia:
                        <select id="cheffPreset" value={modifiers.cheffPreset} onChange={handleModifierChange}>
                            {Object.keys(CHEFF_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Temporada:
                        <select id="temporadaPreset" value={modifiers.temporadaPreset} onChange={handleModifierChange}>
                            {Object.keys(TEMP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                </div>

            </div>

            <div className="card consumables-section">
                <h3>Consumíveis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {Object.keys(consumablesList).map(key => (
                        <div key={key}>
                            <label style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!consumables[key]}
                                    onChange={() => handleConsumableChange(key)}
                                    style={{ width: 'auto', marginRight: '8px' }}
                                />
                                {consumablesList[key]}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <FarmRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFarm}
                contentId={modalContext.contentId}
                levelId={modalContext.levelId}
                availableDrops={modalContext.availableDrops}
                communityStats={communityStats}
            />
        </Layout>
    );
}

export default App;
