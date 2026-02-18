import React, { useState } from 'react';

const RO_CLASSES = [
    "RK", "WL", "Sorc", "Monk", "Imperial Guard", "Wind Hawk", "Bardo/Musa", "Meister", "Biolo",
    "Shadow Cross", "Abyss Chaser", "Cardinal", "Super Noviço", "MTK", "SA", "Shinkiro/Shiranui", "NW", "Gatim"
];

const SELADA_AVAILABLE_ITEMS = [
    { id: 'cartas_mvp_direto', name: 'Cartas MVP Direto' },
    { id: 'album_ilusao', name: 'Álbum de Cartas Ilusão Selada' },
    { id: 'album_seladas', name: 'Álbum de Cartas Seladas' }
];

export default function FarmRegistrationModal({ isOpen, onClose, onSave, contentId, levelId, communityStats, availableDrops = [] }) {
    const [formData, setFormData] = useState({
        mode: 'normal',
        quest_count: '0',
        first_fatigue_minutes: '',
        user_class: '',
        start_time: '',
        florzinha: '',
        farm_time_minutes: '',
        runs_completed: '25',
        bags_dropped: '0',
        mobs_killed: ''
    });
    const [droppedItems, setDroppedItems] = useState([{ item_id: '', quantity: 1 }]);
    const [error, setError] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    // Dynamic Items selection
    const getAvailableItemList = () => {
        if (contentId === 'fenda_maior' || contentId === 'fenda_dimensional' || contentId === 'trial' || contentId === 'glast_heim_extreme' || contentId === 'dominio') {
            // Use drops from API, excluding florzinha
            return availableDrops
                .filter(d => d.item_id !== 'florzinha')
                .map(d => ({ id: d.item_id, name: d.name || d.item_id }));
        }
        if (contentId === 'moedas' && levelId === '2') {
            return SELADA_AVAILABLE_ITEMS;
        }
        return [];
    };

    const MODAL_AVAILABLE_ITEMS = getAvailableItemList();

    const isMoedas = contentId === 'moedas' && levelId === '1';
    const isSelada = contentId === 'moedas' && levelId === '2';
    const isVilla = contentId === 'villa_of_zenys';
    const isFenda = contentId === 'fenda_maior';
    const isFendaDimensional = contentId === 'fenda_dimensional';
    const isTrial = contentId === 'trial';
    const isGlast = contentId === 'glast_heim_extreme';
    const isDominio = contentId === 'dominio';

    // Reset form when contentId changes or modal closes
    React.useEffect(() => {
        if (!isOpen && !isClosing) {
            setFormData({
                mode: 'normal',
                quest_count: '0',
                first_fatigue_minutes: '',
                user_class: '',
                start_time: '',
                florzinha: '',
                farm_time_minutes: '',
                runs_completed: contentId === 'fenda_maior' ? '7' : (contentId === 'fenda_dimensional' || contentId === 'trial' ? '30' : '25'),
                bags_dropped: '0',
                mobs_killed: ''
            });
            setDroppedItems([{ item_id: '', quantity: 1 }]);
            setError('');
        }
    }, [isOpen, isClosing, contentId]); // Added contentId to dependencies

    // Sync isClosing state when modal is opened/closed from outside
    React.useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
        } else {
            // When parent says it's closed, ensure we're not in closing state anymore
            // so we can actually return null and unmount
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleStartClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200); // Match CSS animation duration
    };

    if (!isOpen && !isClosing) return null;

    const addItemRow = () => {
        if (droppedItems.length < MODAL_AVAILABLE_ITEMS.length) {
            setDroppedItems([...droppedItems, { item_id: '', quantity: 1 }]);
        }
    };

    const removeItemRow = (index) => {
        const res = droppedItems.filter((_, i) => i !== index);
        setDroppedItems(res.length ? res : [{ item_id: '', quantity: 1 }]);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...droppedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setDroppedItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        if (isMoedas) {
            const fatigueTime = parseInt(formData.first_fatigue_minutes);
            const florValue = parseFloat(formData.florzinha);

            // Required fields check: Mode, Quest count, Fatigue time, Florzinha
            if (!formData.mode || formData.quest_count === '' || !formData.first_fatigue_minutes || formData.florzinha === '') {
                setError('Modo, Quantidade de Quests, Tempo de Fadiga e Florzinha são obrigatórios.');
                return;
            }

            // Numeric validation for Fatigue Time
            if (isNaN(fatigueTime) || fatigueTime < 5) {
                setError('O tempo mínimo permitido para fadiga é 5 minutos.');
                return;
            }

            // Numeric validation for Florzinha
            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }



            const record = {
                content_id: contentId,
                level_id: levelId,
                mode: formData.mode,
                quest_count: parseInt(formData.quest_count),
                first_fatigue_minutes: fatigueTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                user_class: formData.user_class,
                start_time: formData.start_time,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isSelada) {
            const farmTime = parseInt(formData.farm_time_minutes);
            const mobsKilled = parseInt(formData.mobs_killed);

            if (!formData.farm_time_minutes || isNaN(farmTime) || farmTime < 5) {
                setError('Tempo de Farm é obrigatório e deve ter no mínimo 5 minutos.');
                return;
            }

            if (!formData.mobs_killed || isNaN(mobsKilled) || mobsKilled < 1) {
                setError('Número de Mobs Mortos é obrigatório e deve ser maior que 0.');
                return;
            }



            // Calculate total items dropped
            const totalItemsDropped = droppedItems
                .filter(item => item.item_id !== '')
                .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

            const record = {
                content_id: contentId,
                level_id: levelId,
                mobs_killed: mobsKilled,
                total_items_dropped: totalItemsDropped,
                time_minutes: farmTime,
                items: droppedItems.filter(item => item.item_id !== '').map(item => ({
                    item_id: item.item_id,
                    quantity: parseInt(item.quantity) || 0
                })),
                user_class: formData.user_class,
                start_time: formData.start_time,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isVilla) {
            const runs = parseInt(formData.runs_completed);
            const bags = parseInt(formData.bags_dropped);
            const farmTime = parseInt(formData.farm_time_minutes);
            const florValue = parseFloat(formData.florzinha);

            if (isNaN(runs) || runs < 1 || runs > 25) {
                setError('Quantidade de Runs deve ser entre 1 e 25.');
                return;
            }

            if (isNaN(bags) || bags < 0 || bags > runs) {
                setError('Quantidade de Bolsas deve ser entre 0 e a quantidade de Runs.');
                return;
            }

            if (isNaN(farmTime) || farmTime < 5) {
                setError('Tempo de Farm deve ser de no mínimo 5 minutos.');
                return;
            }

            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }



            const record = {
                content_id: contentId,
                level_id: levelId,
                runs_completed: runs,
                bags_dropped: bags,
                farm_time_minutes: farmTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                user_class: formData.user_class,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isFenda) {
            const runs = parseInt(formData.runs_completed);
            const farmTime = parseInt(formData.farm_time_minutes);
            const florValue = parseFloat(formData.florzinha);

            if (isNaN(runs) || runs < 1 || runs > 7) {
                setError('Quantidade de Runs deve ser entre 1 e 7.');
                return;
            }

            if (isNaN(farmTime) || farmTime < 5) {
                setError('Tempo de Farm deve ser de no mínimo 5 minutos.');
                return;
            }

            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }



            const record = {
                content_id: contentId,
                level_id: levelId,
                runs_completed: runs,
                farm_time_minutes: farmTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                items: droppedItems.filter(item => item.item_id !== '').map(item => ({
                    item_id: item.item_id,
                    quantity: parseInt(item.quantity) || 0
                })),
                user_class: formData.user_class,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isFendaDimensional) {
            const runs = parseInt(formData.runs_completed);
            const farmTime = parseInt(formData.farm_time_minutes);
            const florValue = parseFloat(formData.florzinha);

            if (isNaN(runs) || runs < 1 || runs > 30) {
                setError('Quantidade de Runs deve ser entre 1 e 30.');
                return;
            }

            if (isNaN(farmTime) || farmTime < 5) {
                setError('Tempo de Farm deve ser de no mínimo 5 minutos.');
                return;
            }

            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }



            const record = {
                content_id: contentId,
                level_id: levelId,
                runs_completed: runs,
                farm_time_minutes: farmTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                items: droppedItems.filter(item => item.item_id !== '').map(item => ({
                    item_id: item.item_id,
                    quantity: parseInt(item.quantity) || 0
                })),
                user_class: formData.user_class,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isTrial) {
            const runs = parseInt(formData.runs_completed);
            const farmTime = parseInt(formData.farm_time_minutes);
            const florValue = parseFloat(formData.florzinha);

            if (isNaN(runs) || runs < 1 || runs > 30) {
                setError('Quantidade de Runs deve ser entre 1 e 30.');
                return;
            }

            if (isNaN(farmTime) || farmTime < 5) {
                setError('Tempo de Farm deve ser de no mínimo 5 minutos.');
                return;
            }

            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }



            const record = {
                content_id: contentId,
                level_id: levelId,
                runs_completed: runs,
                farm_time_minutes: farmTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                items: droppedItems.filter(item => item.item_id !== '').map(item => ({
                    item_id: item.item_id,
                    quantity: parseInt(item.quantity) || 0
                })),
                user_class: formData.user_class,
                timestamp: now.toISOString()
            };
            onSave(record);
        } else if (isGlast || isDominio) {
            const farmTime = parseInt(formData.farm_time_minutes);
            const florValue = parseFloat(formData.florzinha);
            const mobsKilled = parseInt(formData.mobs_killed);

            if (isNaN(farmTime) || farmTime < 5 || farmTime > 240) {
                setError('Tempo de Farm deve ser entre 5 e 240 minutos (4 horas).');
                return;
            }

            if (isNaN(florValue) || florValue < 0) {
                setError('Informe um valor válido para Florzinha (ex: 18.63).');
                return;
            }

            if (!formData.mobs_killed || isNaN(mobsKilled) || mobsKilled < 1) {
                setError('Número de Mobs Mortos é obrigatório e deve ser maior que 0.');
                return;
            }



            // Calculate total items dropped
            const totalItemsDropped = droppedItems
                .filter(item => item.item_id !== '')
                .reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

            const record = {
                content_id: contentId,
                level_id: levelId,
                mobs_killed: mobsKilled,
                total_items_dropped: totalItemsDropped,
                time_minutes: farmTime,
                florzinha: parseFloat(florValue.toFixed(2)),
                items: droppedItems.filter(item => item.item_id !== '').map(item => ({
                    item_id: item.item_id,
                    quantity: parseInt(item.quantity) || 0
                })),
                user_class: formData.user_class,
                start_time: formData.start_time,
                timestamp: now.toISOString()
            };
            onSave(record);
        }

        handleStartClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleStartClose}>
            <div className={`modal-content card ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #2a3142', paddingBottom: '12px' }}>
                    <h2 style={{ margin: 0, color: '#00d9ff' }}>Registrar Farm</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    {contentId === 'moedas' && levelId === '1' && (
                        <>
                            <div className="form-group">
                                <label>Modo*</label>
                                <select name="mode" value={formData.mode} onChange={handleChange}>
                                    <option value="normal">Normal</option>
                                    <option value="hard">Hard</option>
                                    <option value="extreme">Extreme</option>
                                    <option value="savage">Savage</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Quantidade de Quests*</label>
                                <select name="quest_count" value={formData.quest_count} onChange={handleChange}>
                                    <option value="0">0</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Fadiga (min)*</label>
                                    <input
                                        type="number"
                                        name="first_fatigue_minutes"
                                        value={formData.first_fatigue_minutes}
                                        onChange={handleChange}
                                        placeholder="Mín: 5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Florzinha*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="florzinha"
                                        value={formData.florzinha}
                                        onChange={handleChange}
                                        placeholder="Ex: 18.63"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {contentId === 'moedas' && levelId === '2' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Tempo de Farm (minutos)*</label>
                                    <input type="number" name="farm_time_minutes" value={formData.farm_time_minutes} onChange={handleChange} placeholder="Mín: 5" />
                                </div>
                                <div className="form-group">
                                    <label>Mobs Mortos*</label>
                                    <input type="number" name="mobs_killed" value={formData.mobs_killed} onChange={handleChange} placeholder="Ex: 150" min="1" />
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px', borderBottom: '1px solid #2a3142', paddingBottom: '4px' }}>Itens Dropados</label>
                                {droppedItems.map((item, index) => {
                                    const usedItemIds = droppedItems.filter((_, i) => i !== index).map(di => di.item_id);
                                    const options = MODAL_AVAILABLE_ITEMS.filter(ai => !usedItemIds.includes(ai.id));

                                    return (
                                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 2 }}>
                                                <select value={item.item_id} onChange={(e) => handleItemChange(index, 'item_id', e.target.value)} style={{ marginBottom: 0 }}>
                                                    <option value="">Nenhum item</option>
                                                    {options.map(opt => (
                                                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="Qtd" style={{ marginBottom: 0 }} />
                                            </div>
                                            <button type="button" onClick={() => removeItemRow(index)} className="btn-secondary" style={{ padding: '8px', minWidth: '40px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '0' }}>×</button>
                                        </div>
                                    );
                                })}
                                {droppedItems.length < MODAL_AVAILABLE_ITEMS.length && (
                                    <button type="button" onClick={addItemRow} className="btn-secondary" style={{ fontSize: '12px', width: '100%', marginTop: '4px' }}>+ Adicionar outro item</button>
                                )}
                            </div>
                        </>
                    )}

                    {contentId === 'villa_of_zenys' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Runs Completadas*</label>
                                    <input type="number" name="runs_completed" value={formData.runs_completed} onChange={handleChange} min="1" max="25" />
                                </div>
                                <div className="form-group">
                                    <label>Bolsas Dropadas*</label>
                                    <input type="number" name="bags_dropped" value={formData.bags_dropped} onChange={handleChange} min="0" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Tempo de Farm (min)*</label>
                                    <input type="number" name="farm_time_minutes" value={formData.farm_time_minutes} onChange={handleChange} placeholder="Mín: 5" />
                                </div>
                                <div className="form-group">
                                    <label>Florzinha*</label>
                                    <input type="number" step="0.01" name="florzinha" value={formData.florzinha} onChange={handleChange} placeholder="Ex: 18.63" />
                                </div>
                            </div>
                        </>
                    )}

                    {(isFenda || isFendaDimensional || isTrial || isGlast || isDominio) && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {(isFenda || isFendaDimensional || isTrial) && (
                                    <div className="form-group">
                                        <label>Runs Completadas (1-{isFenda ? '7' : '30'})*</label>
                                        <input type="number" name="runs_completed" value={formData.runs_completed} onChange={handleChange} min="1" max={isFenda ? "7" : "30"} />
                                    </div>
                                )}
                                <div className="form-group" style={{ gridColumn: (isGlast || isDominio) ? 'span 2' : 'auto' }}>
                                    <label>Tempo de Farm (min){(isGlast || isDominio) ? ' (Máx: 240)' : ''}*</label>
                                    <input type="number" name="farm_time_minutes" value={formData.farm_time_minutes} onChange={handleChange} placeholder={(isGlast || isDominio) ? "Máx: 240" : "Mín: 5"} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Florzinha*</label>
                                    <input type="number" step="0.01" name="florzinha" value={formData.florzinha} onChange={handleChange} placeholder="Ex: 12.34" />
                                </div>
                                {(isGlast || isDominio) && (
                                    <div className="form-group">
                                        <label>Mobs Mortos*</label>
                                        <input type="number" name="mobs_killed" value={formData.mobs_killed} onChange={handleChange} placeholder="Ex: 200" min="1" />
                                    </div>
                                )}
                            </div>

                            <div className="form-items-section" style={{ borderTop: '1px solid #2d3748', marginTop: '16px', paddingTop: '16px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#a0aec0' }}>Itens Dropados</h4>
                                {droppedItems.map((item, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '8px', marginBottom: '8px' }}>
                                        <select
                                            value={item.item_id}
                                            onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
                                        >
                                            <option value="">Selecione um item</option>
                                            {MODAL_AVAILABLE_ITEMS
                                                .filter(available => !droppedItems.some((di, i) => i !== index && di.item_id === available.id))
                                                .map(available => (
                                                    <option key={available.id} value={available.id}>{available.name}</option>
                                                ))
                                            }
                                        </select>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            min="0"
                                            placeholder="Qtd"
                                        />
                                        <button
                                            type="button"
                                            className="btn-remove-item"
                                            onClick={() => removeItemRow(index)}
                                            style={{ background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {droppedItems.length < MODAL_AVAILABLE_ITEMS.length && (
                                    <button
                                        type="button"
                                        onClick={addItemRow}
                                        style={{ width: '100%', background: '#2d3748', color: '#a0aec0', padding: '8px', border: '1px dashed #4a5568', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        + Adicionar outro item
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {(isMoedas || isSelada || isGlast || isDominio) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group">
                                <label>Início (opcional)</label>
                                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Classe (opcional)</label>
                                <select name="user_class" value={formData.user_class} onChange={handleChange}>
                                    <option value="">Selecione</option>
                                    {RO_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {(isVilla || isFenda || isFendaDimensional || isTrial) && (
                        <div className="form-group">
                            <label>Classe (opcional)</label>
                            <select name="user_class" value={formData.user_class} onChange={handleChange}>
                                <option value="">Selecione</option>
                                {RO_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                            </select>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar Farm</button>
                        <button type="button" onClick={handleStartClose} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
