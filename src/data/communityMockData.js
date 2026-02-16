export const communityMockData = {
    moedas: {
        "1": { // Cheffenia/Bio
            normal: {
                florzinha: { avg_per_hour: 38, samples: 24 },
                "0_quests": { avg_per_hour: 42, samples: 18 },
                "2_quests": { avg_per_hour: 50, samples: 12 },
                "3_quests": { avg_per_hour: 58, samples: 7 }
            },
            hard: {
                florzinha: { avg_per_hour: 34, samples: 15 },
                "0_quests": { avg_per_hour: 39, samples: 10 },
                "2_quests": { avg_per_hour: 47, samples: 6 },
                "3_quests": { avg_per_hour: 54, samples: 4 }
            },
            extreme: {
                florzinha: { avg_per_hour: 29, samples: 8 },
                "0_quests": { avg_per_hour: 33, samples: 5 },
                "2_quests": { avg_per_hour: 41, samples: 3 },
                "3_quests": { avg_per_hour: 49, samples: 2 }
            },
            savage: {
                florzinha: { avg_per_hour: 25, samples: 6 },
                "0_quests": { avg_per_hour: 28, samples: 3 },
                "2_quests": { avg_per_hour: 35, samples: 2 },
                "3_quests": { avg_per_hour: 44, samples: 1 }
            }
        }
    }
    // Adicionar outros conteúdos conforme necessário seguindo a estrutura:
    // [content_id]: { [level_id]: { [mode]: { [item_key]: { avg_per_hour: X, samples: Y } } } }
};
