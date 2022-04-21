
const mode = process.env.NODE_ENV || ""

export function log(msg) {if (mode ===  "development") console.log(msg);}
