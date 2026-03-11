const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args) => isDev && console.log('[HeroSim]', ...args),
    info: (...args) => isDev && console.info('[HeroSim]', ...args),
    warn: (...args) => isDev && console.warn('[HeroSim]', ...args),
    error: (...args) => isDev && console.error('[HeroSim]', ...args),
    debug: (...args) => isDev && console.debug('[HeroSim]', ...args),
};
