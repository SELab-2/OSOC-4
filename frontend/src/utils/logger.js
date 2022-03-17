const FRONTEND_LOGS = (!import.meta.env.PROD) || false;

export function log(msg) {if (FRONTEND_LOGS) console.log(msg);}
