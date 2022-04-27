
const mode = process.env.NODE_ENV || ""

/**
 * Logs a message when the mode is development
 *      for example when the mode is production, this won't log the message
 * @param msg: the message you want to log
 */
export function log(msg) {if (mode ===  "development") console.log(msg);}
