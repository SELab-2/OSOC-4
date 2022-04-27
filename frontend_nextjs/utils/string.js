/**
 *  Convert a string (text) to it's Titlecased variant
 * @param text
 * @returns {string}
 */
export function titlecase(text) {
    return text.charAt(0).toUpperCase() + text.substring(1, text.length).toLowerCase();
}

export function getID(url){
    let temp_list = url.split("/")
    let list = [1,2];
    return temp_list[temp_list.length - 1]
}