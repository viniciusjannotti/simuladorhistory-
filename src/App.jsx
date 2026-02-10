import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MonsterTable from './components/MonsterTable';
import CalcTable from './components/CalcTable';
import SimTable from './components/SimTable';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://simulador-backend-x3u3.onrender.com';

function App() {
    const [itemId, setItemId] = useState('refinadora_complexa_18_savage');
    const [numKills, setNumKills] = useState(100);
    const [mc, setMc] = useState(10000);


    // Cascata de seletores
    const [contents, setContents] = useState([]);
    const [selectedContent, setSelectedContent] = useState('fenda_maior');
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('18');
    const [allDropsData, setAllDropsData] = useState(null); // Armazena resultado do /calculate-all
    const [monsterTableData, setMonsterTableData] = useState(null); // Armazena resultado do /calculate-monster-table

    // presets / tabelas — DEFINIDAS ANTES DE USAR
    const RATE_PRESETS = { "100x": 0, "50x": 12, "25x": 25, "12x": 37, "1x": 50, "1x Temporada": 60, "1x Temporada 260": 65 };
    const VIP_PRESETS = { "Nenhum": 0, "VIP 1": 10, "VIP 1+2": 20 };
    const PET_PRESETS = { "Nenhum": 0, "Pet 22%": 7, "Pet 45%": 15, "Pet 90%": 30, "Pet 90% + Grade D": 42, "Pet 90% + Grade C": 54, "Pet 90% + Grade B": 78, "Pet 90% + Grade A": 126, "Pet 90% + Grade R": 150, "Pet 90% + Grade A + Fantasia": 168, "Pet 90% + Grade R + Fantasia": 200 };
    const PK_PRESETS = { "0": 0, "1": 0 };
    const MEMBER_PRESETS = { "0": 0, "1": 50 };
    const PET_ACCESSORY_PRESETS = { "Nenhum": 0, "+0": 1, "+1": 2, "+2": 3, "+3": 4, "+4": 5, "+5": 6, "+6": 7, "+7": 8, "+8": 9, "+9": 10, "+10": 11, "+11": 12, "+12": 13, "+13": 14, "+14": 15, "+15": 16, "+16": 17, "+17": 18, "+18": 19, "+19": 20, "+20": 21 };
    const PET_ACCESSORYP_PRESETS = { "Nenhum": 0, "+0": 1, "+5": 2, "+9": 3, "+13": 4, "+15": 5 };
    const FENDA_QUEST_PRESETS = { "Nenhuma": 0, "Savage": 3, "Infernal": 4, "Pesadelo": 8, "Ultimate": 12 };
    const BIO_REPUTATION_PRESETS = { "0 Bolinhas": 0, "1 Bolinha": 2, "2 Bolinhas": 4, "3 Bolinhas": 6, "4 Bolinhas": 8, "5 Bolinhas": 10 };
    const CAS_REPUTATION_PRESETS = { "Nenhum": 0, "Rep <20": 1, "Rep >=20": 2 };
    const DOMINIO_REPUTATION_PRESETS = { "0 Bolinhas": 0, "1 Bolinha": 1, "2 Bolinhas": 3, "3 Bolinhas": 6, "4 Bolinhas": 10, "5 Bolinhas": 15, "6 Bolinhas": 21, "7 Bolinhas": 28, "8 Bolinhas": 36, "9 Bolinhas": 45, "10 Bolinhas": 70 };
    const DOMINIO_COLLECT_PRESETS = { "Nenhum": 0, "Uma completa": 1, "Duas completas": 2, "Três completas": 3 };
    const GUILD_RANKING_PRESETS = { "Nenhum": 0, "Top 3": 1, "Top 2": 2, "Top 1": 3 };
    const CATEG_RANKING_PRESETS = { "Nenhum": 0, "Top Categoria": 3 };
    const TRIAL_RANKING_PRESETS = { "Nenhum": 0, "Top Trial": 2 };
    const RUNAS_PRESETS = { "Nenhum": 0, "+5": 1, "+10": 2, "+15": 3 };
    const RUNAS_BLACK_PRESETS = { "Nenhum": 0, "+5": 1, "+10": 2, "+15": 3 };

    const REBORNC_PRESETS = { "Nenhum": 0, "Feito": 2 };
    const SEA_REPUTATION_PRESETS = { "Nenhum": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 };
    const TEMP_PRESETS = { "Nenhum": 0, "5 Feitos": 2, "10 Feitos": 4, "14 Feitos": 6, "18 Feitos": 8 };

    // mapeamentos para transformar maestrias e Reborn Kafra em percentuais (enviados em final_mods)
    const ADV_MASTER_MAP = {
        none: 0,
        adv_1: 1,
        adv_2: 3,
        adv_3: 5,
        adv_4: 8
    };
    const BIRTH_MASTER_MAP = {
        none: 0,
        birth_1: 1,
        birth_2: 2,
        birth_3: 3,
        birth_4: 5
    };
    const REBORN_KAFRA_MAP = {
        none: 0,
        reborn_1: 1,
        reborn_2: 2,
        reborn_3: 3,
        reborn_4: 5,
        reborn_5: 8
    };

    // consumíveis iniciais (checkbox state)
    const [consumables, setConsumables] = useState({});
    const consumablesList = {
        calice: "Cálice (+265%)",
        calice2: "Cálice II (+240%)",
        chicle: "Chicle de Bola / Manual (+200%)",
        chiclete: "Chiclete (+100%)",
        lata: "Lata para Gatos (+20%)",
        revitalizadora: "Poção Revitalizadora (+20%)",
        drop_pot: "Drop em Pote (+25%)",
        fusion: "Fusão em Pote (+25%)",
        doador: "Poção do Doador (+35%)",
        doador_rmt: "Poção do Doador RMT (+35%)",
        carnavalesco: "Elixir Carnavalesco (+2% Final)",
        black: "Black Candy (+6% Final)",
        agilidade: "Doce de Agilidade (+2% Final)",
        skul: "Latão Skul (+1% Final)",
        champs: "Pergaminho dos Campeões (+6% Final)",
        ativador: "Ativador Universal (+5% Final)",
        amantes: "Carta dos Amantes (+4% Final)",
    };

    // maestrias e reborn
    const [advMastery, setAdvMastery] = useState("none");     // aventureiro
    const [birthMastery, setBirthMastery] = useState("none"); // aniversário
    const [rebornMastery, setRebornMastery] = useState("none"); // Reborn Kafra

    // resultados
    const [calcResult, setCalcResult] = useState(null);
    const [simResult, setSimResult] = useState(null);

    // Carrega conteúdos ao montar o componente
    useEffect(() => {
        fetch(API_BASE + "/contents")
            .then(res => res.json())
            .then(data => {
                setContents(data.contents || []);
                // Carrega níveis do primeiro conteúdo
                if (data.contents && data.contents.length > 0) {
                    loadLevels(data.contents[0].content_id);
                }
            })
            .catch(err => console.error("Erro ao carregar conteúdos:", err));
    }, []);

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
            .catch(err => console.error("Erro ao carregar níveis:", err));
    };

    // Função para recalcular drops quando modificadores mudam
    const recalculateDrops = () => {
        if (!selectedContent || !selectedLevel) return;

        const rateBonus = RATE_PRESETS[document.getElementById("ratePreset").value] || 0;
        const vipBonus = VIP_PRESETS[document.getElementById("vipPreset").value] || 0;
        const petBonus = PET_PRESETS[document.getElementById("petPreset").value] || 0;
        const pkBonus = PK_PRESETS[document.getElementById("pkPreset").value] || 0;
        const memberBonus = MEMBER_PRESETS[document.getElementById("memberPreset").value] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[document.getElementById("petAccessoryPreset").value] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[document.getElementById("petAccessoryPPreset").value] || 0;
        const questBonus = FENDA_QUEST_PRESETS[document.getElementById("questPreset").value] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[document.getElementById("bioReputationPreset").value] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[document.getElementById("cheffeniaReputationPreset").value] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[document.getElementById("casReputationPreset").value] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[document.getElementById("dominioReputationPreset").value] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[document.getElementById("domainCollectPreset").value] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[document.getElementById("guildRankingPreset").value] || 0;
        const categBonus = CATEG_RANKING_PRESETS[document.getElementById("categRankingPreset").value] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[document.getElementById("trialRankingPreset").value] || 0;
        const runasBonus = RUNAS_PRESETS[document.getElementById("runasPreset").value] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[document.getElementById("runasBlackFridayPreset").value] || 0;
        const rebornCBonus = REBORNC_PRESETS[document.getElementById("rebornCPreset").value] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[document.getElementById("sealedReputationPreset").value] || 0;
        const tempBonus = TEMP_PRESETS[document.getElementById("temporadaPreset").value] || 0;

        const payload = {
            content_id: selectedContent,
            level_id: selectedLevel,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                pk_bonus: pkBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheffenia_reputation: chefBonus,
                dominio_reputation: dominioBonus,
                domain_collect: domainBonus,
                sealed_bonus: sealedBonus,
                temp_bonus: tempBonus,
                profs: 0
            },
            final_mods: {
                pet_equip_final: accBonus,
                pet_equip_pingente_final: accBonusP,
                quest_final: questBonus,
                adv_mastery_percent: ADV_MASTER_MAP[advMastery] || 0,
                birth_mastery_percent: BIRTH_MASTER_MAP[birthMastery] || 0,
                reborn_mastery_percent: REBORN_KAFRA_MAP[rebornMastery] || 0,
                cas_rep_final: casBonus,
                guild_final: guildBonus,
                categ_final: categBonus,
                trial_final: trialBonus,
                runas_final: runasBonus,
                runas_black_final: runasblackBonus,
                rebornC_final: rebornCBonus,
            },
            consumables: Object.keys(consumables).filter(k => consumables[k])
        };

        fetch(API_BASE + "/drop/calculate-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => setAllDropsData(data))
            .catch(err => console.error("Erro ao calcular drops:", err));
    };

    // Função para carregar drops de monster table
    const loadMonsterTable = () => {
        if (!selectedContent || !selectedLevel) return;

        // Primeiro verifica se é monster_table
        const currentContent = contents.find(c => c.content_id === selectedContent);
        if (!currentContent || currentContent.type !== 'monster_table') {
            return;
        }

        const rateBonus = RATE_PRESETS[document.getElementById("ratePreset").value] || 0;
        const vipBonus = VIP_PRESETS[document.getElementById("vipPreset").value] || 0;
        const petBonus = PET_PRESETS[document.getElementById("petPreset").value] || 0;
        const pkBonus = PK_PRESETS[document.getElementById("pkPreset").value] || 0;
        const memberBonus = MEMBER_PRESETS[document.getElementById("memberPreset").value] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[document.getElementById("petAccessoryPreset").value] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[document.getElementById("petAccessoryPPreset").value] || 0;
        const questBonus = FENDA_QUEST_PRESETS[document.getElementById("questPreset").value] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[document.getElementById("bioReputationPreset").value] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[document.getElementById("cheffeniaReputationPreset").value] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[document.getElementById("dominioReputationPreset").value] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[document.getElementById("casReputationPreset").value] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[document.getElementById("domainCollectPreset").value] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[document.getElementById("guildRankingPreset").value] || 0;
        const categBonus = CATEG_RANKING_PRESETS[document.getElementById("categRankingPreset").value] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[document.getElementById("trialRankingPreset").value] || 0;
        const runasBonus = RUNAS_PRESETS[document.getElementById("runasPreset").value] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[document.getElementById("runasBlackFridayPreset").value] || 0;
        const rebornCBonus = REBORNC_PRESETS[document.getElementById("rebornCPreset").value] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[document.getElementById("sealedReputationPreset").value] || 0;
        const tempBonus = TEMP_PRESETS[document.getElementById("temporadaPreset").value] || 0;

        const payload = {
            content_id: selectedContent,
            level_id: selectedLevel,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                pk_bonus: pkBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheffenia_reputation: chefBonus,
                dominio_reputation: dominioBonus,
                domain_collect: domainBonus,
                sealed_bonus: sealedBonus,
                temp_bonus: tempBonus,
                profs: 0
            },

            final_mods: {
                pet_equip_final: accBonus,
                pet_equip_pingente_final: accBonusP,
                quest_final: questBonus,
                adv_mastery_percent: ADV_MASTER_MAP[advMastery] || 0,
                birth_mastery_percent: BIRTH_MASTER_MAP[birthMastery] || 0,
                reborn_mastery_percent: REBORN_KAFRA_MAP[rebornMastery] || 0,
                cas_rep_final: casBonus,
                guild_final: guildBonus,
                categ_final: categBonus,
                trial_final: trialBonus,
                runas_final: runasBonus,
                runas_black_final: runasblackBonus,
                rebornC_final: rebornCBonus,
            },
            consumables: Object.keys(consumables).filter(k => consumables[k])
        };

        fetch(API_BASE + "/drop/calculate-monster-table", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => setMonsterTableData(data))
            .catch(err => console.error("Erro ao calcular monster table:", err));
    };

    // Recalcula quando level muda
    useEffect(() => {
        if (!selectedContent || !selectedLevel) return;

        // Busca o conteúdo atual para verificar o tipo
        const currentContent = contents.find(c => c.content_id === selectedContent);

        if (currentContent && currentContent.type === 'monster_table') {
            // Limpa a tabela normal e carrega a tabela de monstros
            setAllDropsData(null);
            loadMonsterTable();
        } else {
            // Limpa a tabela de monstros e carrega a tabela normal
            setMonsterTableData(null);
            recalculateDrops();
        }
    }, [selectedLevel, selectedContent, consumables, advMastery, birthMastery, rebornMastery]);

    function handleConsumableChange(key) {
        setConsumables(prev => {
            const newVal = { ...prev, [key]: !prev[key] };
            // O effect já vai recalcular
            return newVal;
        });
    }

    async function handleCalc() {
        const rateBonus = RATE_PRESETS[document.getElementById("ratePreset").value] || 0;
        const vipBonus = VIP_PRESETS[document.getElementById("vipPreset").value] || 0;
        const petBonus = PET_PRESETS[document.getElementById("petPreset").value] || 0;
        const pkBonus = PK_PRESETS[document.getElementById("pkPreset").value] || 0;
        const memberBonus = MEMBER_PRESETS[document.getElementById("memberPreset").value] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[document.getElementById("petAccessoryPreset").value] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[document.getElementById("petAccessoryPPreset").value] || 0;
        const questBonus = FENDA_QUEST_PRESETS[document.getElementById("questPreset").value] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[document.getElementById("bioReputationPreset").value] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[document.getElementById("cheffeniaReputationPreset").value] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[document.getElementById("casReputationPreset").value] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[document.getElementById("dominioReputationPreset").value] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[document.getElementById("domainCollectPreset").value] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[document.getElementById("guildRankingPreset").value] || 0;
        const categBonus = CATEG_RANKING_PRESETS[document.getElementById("categRankingPreset").value] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[document.getElementById("trialRankingPreset").value] || 0;
        const runasBonus = RUNAS_PRESETS[document.getElementById("runasPreset").value] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[document.getElementById("runasBlackFridayPreset").value] || 0;
        const rebornCBonus = REBORNC_PRESETS[document.getElementById("rebornCPreset").value] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[document.getElementById("sealedReputationPreset").value] || 0;
        const tempBonus = TEMP_PRESETS[document.getElementById("temporadaPreset").value] || 0;

        // monta payload
        const payload = {
            item_id: itemId,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                pk_bonus: pkBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheffenia_reputation: chefBonus,
                dominio_reputation: dominioBonus,
                domain_collect: domainBonus,
                sealed_bonus: sealedBonus,
                temp_bonus: tempBonus,
                profs: 0
            },
            final_mods: {
                pet_equip_final: accBonus,
                pet_equip_pingente_final: accBonusP,
                quest_final: questBonus,
                adv_mastery_percent: ADV_MASTER_MAP[advMastery] || 0,
                birth_mastery_percent: BIRTH_MASTER_MAP[birthMastery] || 0,
                reborn_mastery_percent: REBORN_KAFRA_MAP[rebornMastery] || 0,
                cas_rep_final: casBonus,
                guild_final: guildBonus,
                categ_final: categBonus,
                trial_final: trialBonus,
                runas_final: runasBonus,
                runas_black_final: runasblackBonus,
                rebornC_final: rebornCBonus,
            },
            consumables: Object.keys(consumables).filter(k => consumables[k]),
            num_kills: Number(numKills),
            mc_simulations: Number(mc)
        };

        console.log("Payload CALC:", payload);

        try {
            const res = await fetch(API_BASE + "/drop/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setCalcResult(data);
            setSimResult(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSim() {
        const rateBonus = RATE_PRESETS[document.getElementById("ratePreset").value] || 0;
        const vipBonus = VIP_PRESETS[document.getElementById("vipPreset").value] || 0;
        const petBonus = PET_PRESETS[document.getElementById("petPreset").value] || 0;
        const pkBonus = PK_PRESETS[document.getElementById("pkPreset").value] || 0;
        const memberBonus = MEMBER_PRESETS[document.getElementById("memberPreset").value] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[document.getElementById("petAccessoryPreset").value] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[document.getElementById("petAccessoryPPreset").value] || 0;
        const questBonus = FENDA_QUEST_PRESETS[document.getElementById("questPreset").value] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[document.getElementById("bioReputationPreset").value] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[document.getElementById("cheffeniaReputationPreset").value] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[document.getElementById("casReputationPreset").value] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[document.getElementById("dominioReputationPreset").value] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[document.getElementById("domainCollectPreset").value] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[document.getElementById("guildRankingPreset").value] || 0;
        const categBonus = CATEG_RANKING_PRESETS[document.getElementById("categRankingPreset").value] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[document.getElementById("trialRankingPreset").value] || 0;
        const runasBonus = RUNAS_PRESETS[document.getElementById("runasPreset").value] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[document.getElementById("runasBlackFridayPreset").value] || 0;
        const rebornCBonus = REBORNC_PRESETS[document.getElementById("rebornCPreset").value] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[document.getElementById("sealedReputationPreset").value] || 0;
        const tempBonus = TEMP_PRESETS[document.getElementById("temporadaPreset").value] || 0;

        const payload = {
            item_id: itemId,
            general_mods: {
                server_rate: rateBonus,
                vip_total: vipBonus,
                pet_bonus: petBonus,
                pk_bonus: pkBonus,
                member_bonus: memberBonus,
                bio_reputation: bioBonus,
                cheffenia_reputation: chefBonus,
                dominio_reputation: dominioBonus,
                domain_collect: domainBonus,
                sealed_bonus: sealedBonus,
                temp_bonus: tempBonus,
                profs: 0
            },
            final_mods: {
                pet_equip_final: accBonus,
                pet_equip_pingente_final: accBonusP,
                quest_final: questBonus,
                adv_mastery_percent: ADV_MASTER_MAP[advMastery] || 0,
                birth_mastery_percent: BIRTH_MASTER_MAP[birthMastery] || 0,
                reborn_mastery_percent: REBORN_KAFRA_MAP[rebornMastery] || 0,
                cas_rep_final: casBonus,
                guild_final: guildBonus,
                categ_final: categBonus,
                trial_final: trialBonus,
                runas_final: runasBonus,
                runas_black_final: runasblackBonus,
                rebornC_final: rebornCBonus,
            },
            consumables: Object.keys(consumables).filter(k => consumables[k]),
            num_kills: Number(numKills),
            mc_simulations: Number(mc)
        };

        console.log("Payload SIM:", payload);

        try {
            const res = await fetch(API_BASE + "/drop/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setSimResult(data);
        } catch (err) {
            console.error(err);
        }
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
                </>
            }
        >
            <div className="card">
                <h2>History Drop Simulator</h2>
                <h4>O último doador terá suas informações como padrão até o próximo valor superior ou 30 dias corridos: Envie discord junto a doação!</h4>
                <p>Último doador: Você? || Valor: R$0,00 / 0 Rops dividido por 8000 || Data de vencimento: </p>
            </div>

            {/* Se o modo tabela estiver ativo, mostra a tabela de monstros */}
            <MonsterTable data={monsterTableData} />

            {/* Se o modo tabela não estiver ativo, ou seja, modo "normal", mostra os drops calculados naquela lista antiga */}
            {!monsterTableData && allDropsData && (
                <div className="card">
                    <h3>Drops (Cálculo Geral para o Nível)</h3>
                    <p>Bônus Geral: {allDropsData.B_general_percent}% | Bônus Final: {allDropsData.B_final_percent}%</p>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                        <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                                <th style={{ padding: "8px", textAlign: "left" }}>Item</th>
                                <th style={{ padding: "8px", textAlign: "right" }}>Base</th>
                                <th style={{ padding: "8px", textAlign: "right" }}>Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allDropsData.drops.map(d => (
                                <tr key={d.item_id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "8px" }}>{d.item_name}</td>
                                    <td style={{ padding: "8px", textAlign: "right" }}>{d.base_drop_percent}%</td>
                                    <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: "#2563eb" }}>
                                        {d.p_final_percent.toFixed(4)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="row">
                <div className="card">
                    <h3>Modificadores Gerais</h3>
                    <label>Rate do Servidor:
                        <select id="ratePreset" onChange={recalculateDrops}>
                            {Object.keys(RATE_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>VIP:
                        <select id="vipPreset" onChange={recalculateDrops}>
                            {Object.keys(VIP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Pet:
                        <select id="petPreset" onChange={recalculateDrops}>
                            {Object.keys(PET_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>PK Mode:
                        <select id="pkPreset" onChange={recalculateDrops}>
                            <option value="0">Não</option>
                            <option value="1">Sim</option>
                        </select>
                    </label>
                    <label>Membro da Equipe (Villa?):
                        <select id="memberPreset" onChange={recalculateDrops}>
                            <option value="0">Não</option>
                            <option value="1">Sim</option>
                        </select>
                    </label>
                    <label>Reputação Bio 5:
                        <select id="bioReputationPreset" onChange={recalculateDrops}>
                            {Object.keys(BIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Reputação Cheffênia:
                        <select id="cheffeniaReputationPreset" onChange={recalculateDrops}>
                            {Object.keys(BIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reputação Selada:
                        <select id="sealedReputationPreset" onChange={recalculateDrops}>
                            {Object.keys(SEA_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Excelência Domínio:
                        <select id="dominioReputationPreset" onChange={recalculateDrops}>
                            {Object.keys(DOMINIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Domínio Coleta (Mineração/Pesca/Herbologia):
                        <select id="domainCollectPreset" onChange={recalculateDrops}>
                            {Object.keys(DOMINIO_COLLECT_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Temporada:
                        <select id="temporadaPreset" onChange={recalculateDrops}>
                            {Object.keys(TEMP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                </div>

                <div className="card">
                    <h3>Modificadores Finais</h3>

                    <label>Pet Acessório (Refino):
                        <select id="petAccessoryPreset" onChange={recalculateDrops}>
                            {Object.keys(PET_ACCESSORY_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Pet Pingente (Refino):
                        <select id="petAccessoryPPreset" onChange={recalculateDrops}>
                            {Object.keys(PET_ACCESSORYP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Quest Fenda (Nível):
                        <select id="questPreset" onChange={recalculateDrops}>
                            {Object.keys(FENDA_QUEST_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reputação Casamento:
                        <select id="casReputationPreset" onChange={recalculateDrops}>
                            {Object.keys(CAS_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Guild Ranking (Posição):
                        <select id="guildRankingPreset" onChange={recalculateDrops}>
                            {Object.keys(GUILD_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Ranking Categoria (Posição):
                        <select id="categRankingPreset" onChange={recalculateDrops}>
                            {Object.keys(CATEG_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Trial Ranking (Posição):
                        <select id="trialRankingPreset" onChange={recalculateDrops}>
                            {Object.keys(TRIAL_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Runas GvG:
                        <select id="runasPreset" onChange={recalculateDrops}>
                            {Object.keys(RUNAS_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Runas Black Friday:
                        <select id="runasBlackFridayPreset" onChange={recalculateDrops}>
                            {Object.keys(RUNAS_BLACK_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reborn Charge:
                        <select id="rebornCPreset" onChange={recalculateDrops}>
                            {Object.keys(REBORNC_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Maestria Aventureiro
                        <select value={advMastery} onChange={e => setAdvMastery(e.target.value)}>
                            <option value="none">Nenhum</option>
                            <option value="adv_1">Nível 1 (+1%)</option>
                            <option value="adv_2">Nível 2 (+3%)</option>
                            <option value="adv_3">Nível 3 (+5%)</option>
                            <option value="adv_4">Nível 4 (+8%)</option>
                        </select>
                    </label>

                    <label>Maestria Aniversário
                        <select value={birthMastery} onChange={e => setBirthMastery(e.target.value)}>
                            <option value="none">Nenhum</option>
                            <option value="birth_1">Nível 1 (+1%)</option>
                            <option value="birth_2">Nível 2 (+2%)</option>
                            <option value="birth_3">Nível 3 (+3%)</option>
                            <option value="birth_4">Nível 4 (+5%)</option>
                        </select>
                    </label>

                    <label>Maestria Reborn Kafra
                        <select value={rebornMastery} onChange={e => setRebornMastery(e.target.value)}>
                            <option value="none">Nenhum</option>
                            <option value="reborn_1">Nível 1 (+1%)</option>
                            <option value="reborn_2">Nível 2 (+2%)</option>
                            <option value="reborn_3">Nível 3 (+3%)</option>
                            <option value="reborn_4">Nível 4 (+5%)</option>
                            <option value="reborn_5">Nível 5 (+8%)</option>
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


        </Layout>
    );
}

export default App;
