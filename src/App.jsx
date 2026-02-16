import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MonsterTable from './components/MonsterTable';
import CalcTable from './components/CalcTable';
import SimTable from './components/SimTable';
import DonationCard from './components/DonationCard';
import CommunityTooltipWrapper from './components/CommunityTooltipWrapper';
import FarmRegistrationModal from './components/FarmRegistrationModal';
import { supabase } from './lib/supabaseClient';

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
    const PET_ACCESSORYP_PRESETS = { "Nenhum": 0, "+1": 1, "+5": 2, "+9": 3, "+13": 4, "+15": 5 };
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
    const SEA_REPUTATION_PRESETS = { "0 Bolinhas": 0, "1 Bolinha": 1, "2 Bolinhas": 2, "3 Bolinhas": 3, "4 Bolinhas": 4, "5 Bolinhas": 5 };
    const TEMP_PRESETS = { "Nenhum": 0, "5 Feitos": 2, "10 Feitos": 4, "14 Feitos": 6, "18 Feitos": 8 };

    const ADV_MASTER_MAP = { none: 0, adv_1: 1, adv_2: 3, adv_3: 5, adv_4: 8 };
    const BIRTH_MASTER_MAP = { none: 0, birth_1: 1, birth_2: 2, birth_3: 3, birth_4: 5 };
    const REBORN_KAFRA_MAP = { none: 0, reborn_1: 1, reborn_2: 2, reborn_3: 3, reborn_4: 5, reborn_5: 8 };

    // consumíveis iniciais (checkbox state)
    const [consumables, setConsumables] = useState({
        calice: true,
        drop_pot: true,
        ativador: true,
        lata: true,
        fusion: true,
        carnavalesco: true,
        chicle: true,
        revitalizadora: true,
        doador: true,
        black: true,
        champs: true
    });
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
    const [advMastery, setAdvMastery] = useState("adv_4");     // aventureiro
    const [birthMastery, setBirthMastery] = useState("birth_4"); // aniversário
    const [rebornMastery, setRebornMastery] = useState("reborn_5"); // Reborn Kafra

    // resultados
    const [calcResult, setCalcResult] = useState(null);
    const [simResult, setSimResult] = useState(null);
    const [connectionError, setConnectionError] = useState(null);

    // Farm Registration State
    const [farmRecords, setFarmRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ contentId: '', levelId: '' });

    const handleRegisterFarm = (contentId, levelId, availableDrops = []) => {
        setModalContext({ contentId, levelId, availableDrops });
        setIsModalOpen(true);
    };

    const handleSaveFarm = async (record) => {
        if (!supabase) {
            console.error('Supabase client not initialized.');
            alert('Não foi possível salvar: Supabase não está configurado corretamente no arquivo .env');
            return;
        }
        try {
            const { error } = await supabase
                .from('farm_records')
                .insert([{
                    content_id: record.content_id,
                    level_id: record.level_id,
                    data: record
                }]);

            if (error) throw error;

            setFarmRecords(prev => [record, ...prev]);
            console.log('Novo registro salvo no Supabase:', record);
        } catch (err) {
            console.error('Erro ao salvar no Supabase:', err);
            alert('Erro ao salvar registro no Supabase. Verifique suas credenciais no arquivo .env');
        }
    };

    // modifiers state (controlled inputs)
    const [modifiers, setModifiers] = useState({
        ratePreset: "1x Temporada 260",
        vipPreset: "VIP 1+2",
        petPreset: "Pet 90% + Grade A + Fantasia",
        pkPreset: "1",
        memberPreset: "Não",
        bioReputationPreset: "5 Bolinhas",
        cheffeniaReputationPreset: "5 Bolinhas",
        sealedReputationPreset: "4 Bolinhas",
        dominioReputationPreset: "10 Bolinhas",
        domainCollectPreset: "Três completas",
        temporadaPreset: "18 Feitos",

        petAccessoryPreset: "+10",
        petAccessoryPPreset: "+1",
        questPreset: "Ultimate",
        casReputationPreset: "Nenhum",
        guildRankingPreset: "Nenhum",
        categRankingPreset: "Nenhum",
        trialRankingPreset: "Top Trial",
        runasPreset: "Nenhum",
        runasBlackFridayPreset: "+15",
        rebornCPreset: "Feito"


    });

    const handleModifierChange = (e) => {
        const { id, value } = e.target;
        setModifiers(prev => ({ ...prev, [id]: value }));
    };

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
                setConnectionError(null);
            })
            .catch(err => {
                console.error("Erro ao carregar conteúdos:", err);
                setConnectionError("Erro de conexão: Verifique se o backend está rodando.");
            });
    }, []);

    // Carrega registros do Supabase ao montar
    useEffect(() => {
        if (!supabase) return;

        const fetchRecords = async () => {
            try {
                const { data, error } = await supabase
                    .from('farm_records')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setFarmRecords(data.map(r => r.data));
                }
            } catch (err) {
                console.error('Erro ao buscar registros do Supabase:', err);
            }
        };
        fetchRecords();
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

        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const pkBonus = PK_PRESETS[modifiers.pkPreset] || 0;
        const memberBonus = MEMBER_PRESETS[modifiers.memberPreset] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[modifiers.petAccessoryPreset] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[modifiers.petAccessoryPPreset] || 0;
        const questBonus = FENDA_QUEST_PRESETS[modifiers.questPreset] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[modifiers.cheffeniaReputationPreset] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[modifiers.casReputationPreset] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[modifiers.dominioReputationPreset] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[modifiers.domainCollectPreset] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[modifiers.guildRankingPreset] || 0;
        const categBonus = CATEG_RANKING_PRESETS[modifiers.categRankingPreset] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[modifiers.trialRankingPreset] || 0;
        const runasBonus = RUNAS_PRESETS[modifiers.runasPreset] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[modifiers.runasBlackFridayPreset] || 0;
        const rebornCBonus = REBORNC_PRESETS[modifiers.rebornCPreset] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[modifiers.sealedReputationPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

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
            .then(res => {
                if (!res.ok) throw new Error("API Indisponível (404/500)");
                return res.json();
            })
            .then(data => {
                setAllDropsData(data);
                setConnectionError(null);
            })
            .catch(err => {
                // Silencioso no console, erro mostrado na UI
                setConnectionError("Modo Normal indisponível no servidor remoto. Use o Backend Local.");
            });
    };

    // Função para carregar drops de monster table
    const loadMonsterTable = () => {
        if (!selectedContent || !selectedLevel) return;

        // Primeiro verifica se é monster_table
        const currentContent = contents.find(c => c.content_id === selectedContent);
        if (!currentContent || currentContent.type !== 'monster_table') {
            return;
        }

        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const pkBonus = PK_PRESETS[modifiers.pkPreset] || 0;
        const memberBonus = MEMBER_PRESETS[modifiers.memberPreset] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[modifiers.petAccessoryPreset] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[modifiers.petAccessoryPPreset] || 0;
        const questBonus = FENDA_QUEST_PRESETS[modifiers.questPreset] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[modifiers.cheffeniaReputationPreset] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[modifiers.dominioReputationPreset] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[modifiers.casReputationPreset] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[modifiers.domainCollectPreset] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[modifiers.guildRankingPreset] || 0;
        const categBonus = CATEG_RANKING_PRESETS[modifiers.categRankingPreset] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[modifiers.trialRankingPreset] || 0;
        const runasBonus = RUNAS_PRESETS[modifiers.runasPreset] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[modifiers.runasBlackFridayPreset] || 0;
        const rebornCBonus = REBORNC_PRESETS[modifiers.rebornCPreset] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[modifiers.sealedReputationPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

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
            .then(res => {
                if (!res.ok) throw new Error("Conteúdo não suportado neste servidor");
                return res.json();
            })
            .then(data => {
                setMonsterTableData(data);
                setConnectionError(null);
            })
            .catch(err => {
                // Silencioso no console
                setConnectionError("A Tabela de Monstros requer o Backend Local rodando.");
            });
    };

    // Recalcula quando qualquer dependencia muda (level, consumiveis, modificadores)
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
    }, [selectedLevel, selectedContent, consumables, modifiers, advMastery, birthMastery, rebornMastery]);

    function handleConsumableChange(key) {
        setConsumables(prev => {
            const newVal = { ...prev, [key]: !prev[key] };
            // O effect já vai recalcular
            return newVal;
        });
    }

    async function handleCalc() {
        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const pkBonus = PK_PRESETS[modifiers.pkPreset] || 0;
        const memberBonus = MEMBER_PRESETS[modifiers.memberPreset] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[modifiers.petAccessoryPreset] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[modifiers.petAccessoryPPreset] || 0;
        const questBonus = FENDA_QUEST_PRESETS[modifiers.questPreset] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[modifiers.cheffeniaReputationPreset] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[modifiers.casReputationPreset] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[modifiers.dominioReputationPreset] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[modifiers.domainCollectPreset] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[modifiers.guildRankingPreset] || 0;
        const categBonus = CATEG_RANKING_PRESETS[modifiers.categRankingPreset] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[modifiers.trialRankingPreset] || 0;
        const runasBonus = RUNAS_PRESETS[modifiers.runasPreset] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[modifiers.runasBlackFridayPreset] || 0;
        const rebornCBonus = REBORNC_PRESETS[modifiers.rebornCPreset] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[modifiers.sealedReputationPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

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
        const rateBonus = RATE_PRESETS[modifiers.ratePreset] || 0;
        const vipBonus = VIP_PRESETS[modifiers.vipPreset] || 0;
        const petBonus = PET_PRESETS[modifiers.petPreset] || 0;
        const pkBonus = PK_PRESETS[modifiers.pkPreset] || 0;
        const memberBonus = MEMBER_PRESETS[modifiers.memberPreset] || 0;
        const accBonus = PET_ACCESSORY_PRESETS[modifiers.petAccessoryPreset] || 0;
        const accBonusP = PET_ACCESSORYP_PRESETS[modifiers.petAccessoryPPreset] || 0;
        const questBonus = FENDA_QUEST_PRESETS[modifiers.questPreset] || 0;
        const bioBonus = BIO_REPUTATION_PRESETS[modifiers.bioReputationPreset] || 0;
        const chefBonus = BIO_REPUTATION_PRESETS[modifiers.cheffeniaReputationPreset] || 0;
        const casBonus = CAS_REPUTATION_PRESETS[modifiers.casReputationPreset] || 0;
        const dominioBonus = DOMINIO_REPUTATION_PRESETS[modifiers.dominioReputationPreset] || 0;
        const domainBonus = DOMINIO_COLLECT_PRESETS[modifiers.domainCollectPreset] || 0;
        const guildBonus = GUILD_RANKING_PRESETS[modifiers.guildRankingPreset] || 0;
        const categBonus = CATEG_RANKING_PRESETS[modifiers.categRankingPreset] || 0;
        const trialBonus = TRIAL_RANKING_PRESETS[modifiers.trialRankingPreset] || 0;
        const runasBonus = RUNAS_PRESETS[modifiers.runasPreset] || 0;
        const runasblackBonus = RUNAS_BLACK_PRESETS[modifiers.runasBlackFridayPreset] || 0;
        const rebornCBonus = REBORNC_PRESETS[modifiers.rebornCPreset] || 0;
        const sealedBonus = SEA_REPUTATION_PRESETS[modifiers.sealedReputationPreset] || 0;
        const tempBonus = TEMP_PRESETS[modifiers.temporadaPreset] || 0;

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
                            <strong style={{ color: "#ef4444", display: "block", marginBottom: "4px" }}>⚠️ BACKEND DESLIGADO</strong>
                            {connectionError}
                            <hr style={{ margin: "8px 0", borderColor: "rgba(239, 68, 68, 0.2)" }} />
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                1. Instale o Python (winget)<br />
                                2. `cd simulador-backend`<br />
                                3. `python -m uvicorn main:app --reload`
                            </div>
                        </div>
                    )}
                </>
            }
        >
            <div className="card header-card">
                <div className="header-info">
                    <h2>History Drop Simulator</h2>
                    <h4>O último doador terá suas informações como padrão até o próximo valor superior ou 30 dias corridos: Envie discord junto a doação!</h4>
                    <p>Último doador: KENAI~ || Valor: R$6,25 / 50k Rops dividido por 8000 || Data de vencimento: 13/03/2026 </p>
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
                    farmRecords={farmRecords}
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
                                </span>
                                {(selectedContent === 'villa_of_zenys' || selectedContent === 'fenda_maior' || selectedContent === 'fenda_dimensional' || selectedContent === 'trial' || selectedContent === 'glast_heim_extreme' || selectedContent === 'dominio') && (
                                    <button
                                        className="btn-registrar"
                                        onClick={() => handleRegisterFarm(selectedContent, selectedLevel, allDropsData.drops)}
                                    >
                                        + Registrar Farm
                                    </button>
                                )}
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
                                        <td style={{ padding: "8px", color: "#e4e7eb" }}>{d.item_name}</td>
                                        <td style={{ padding: "8px", textAlign: "right", color: "#9ca3af" }}>{d.base_drop_percent}%</td>
                                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold", color: "#00d9ff" }}>
                                            <CommunityTooltipWrapper
                                                contentId={selectedContent}
                                                levelId={selectedLevel}
                                                mode="normal"
                                                itemKey={d.item_id}
                                            >
                                                {d.p_final_percent.toFixed(4)}%
                                            </CommunityTooltipWrapper>
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
                    <label>Reputação Bio 5 (Extreme):
                        <select id="bioReputationPreset" value={modifiers.bioReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(BIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Reputação Cheffênia (Extreme):
                        <select id="cheffeniaReputationPreset" value={modifiers.cheffeniaReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(BIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reputação Selada:
                        <select id="sealedReputationPreset" value={modifiers.sealedReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(SEA_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Excelência Domínio:
                        <select id="dominioReputationPreset" value={modifiers.dominioReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(DOMINIO_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Domínio Coleta (Mineração/Pesca/Herbologia):
                        <select id="domainCollectPreset" value={modifiers.domainCollectPreset} onChange={handleModifierChange}>
                            {Object.keys(DOMINIO_COLLECT_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Temporada:
                        <select id="temporadaPreset" value={modifiers.temporadaPreset} onChange={handleModifierChange}>
                            {Object.keys(TEMP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                </div>

                <div className="card">
                    <h3>Modificadores Finais</h3>

                    <label>Pet Acessório (Refino):
                        <select id="petAccessoryPreset" value={modifiers.petAccessoryPreset} onChange={handleModifierChange}>
                            {Object.keys(PET_ACCESSORY_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Pet Pingente (Refino):
                        <select id="petAccessoryPPreset" value={modifiers.petAccessoryPPreset} onChange={handleModifierChange}>
                            {Object.keys(PET_ACCESSORYP_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Quest Fenda (Nível):
                        <select id="questPreset" value={modifiers.questPreset} onChange={handleModifierChange}>
                            {Object.keys(FENDA_QUEST_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reputação Casamento:
                        <select id="casReputationPreset" value={modifiers.casReputationPreset} onChange={handleModifierChange}>
                            {Object.keys(CAS_REPUTATION_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Guild Ranking (Posição):
                        <select id="guildRankingPreset" value={modifiers.guildRankingPreset} onChange={handleModifierChange}>
                            {Object.keys(GUILD_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Ranking Categoria (Posição):
                        <select id="categRankingPreset" value={modifiers.categRankingPreset} onChange={handleModifierChange}>
                            {Object.keys(CATEG_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Trial Ranking (Posição):
                        <select id="trialRankingPreset" value={modifiers.trialRankingPreset} onChange={handleModifierChange}>
                            {Object.keys(TRIAL_RANKING_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>
                    <label>Runas GvG:
                        <select id="runasPreset" value={modifiers.runasPreset} onChange={handleModifierChange}>
                            {Object.keys(RUNAS_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Runas Black Friday:
                        <select id="runasBlackFridayPreset" value={modifiers.runasBlackFridayPreset} onChange={handleModifierChange}>
                            {Object.keys(RUNAS_BLACK_PRESETS).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </label>

                    <label>Reborn Charge:
                        <select id="rebornCPreset" value={modifiers.rebornCPreset} onChange={handleModifierChange}>
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

            <FarmRegistrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFarm}
                contentId={modalContext.contentId}
                levelId={modalContext.levelId}
                availableDrops={modalContext.availableDrops}
                farmRecords={farmRecords}
            />
        </Layout>
    );
}

export default App;
