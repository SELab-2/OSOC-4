/**
 *  Convert a string (text) to it's Titlecased variant
 * @param text
 * @returns {string}
 */
export function titlecase(text) {
    return text.charAt(0).toUpperCase() + text.substring(1, text.length).toLowerCase();
}

/**
 *  Convert a url int the form /../../id to it's id
 * @param url
 * @returns {string}
 */
export function getID(url){
    return url.split("/").pop()
}