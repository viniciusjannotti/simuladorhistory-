const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args) => isDev && console.log('[HistorySim]', ...args),
    info: (...args) => isDev && console.info('[HistorySim]', ...args),
    warn: (...args) => isDev && console.warn('[HistorySim]', ...args),
    error: (...args) => isDev && console.error('[HistorySim]', ...args),
    debug: (...args) => isDev && console.debug('[HistorySim]', ...args),
};
