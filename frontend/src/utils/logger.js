const FRONTEND_LOGS = import.meta.env.FRONTEND_LOGS || false;

function log(msg) {if (FRONTEND_LOGS) console.log(msg);}
