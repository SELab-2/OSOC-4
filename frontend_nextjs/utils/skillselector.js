/**
 * This function converts a list of strings to a list of options in the skill selector.
 * @param stringList The list of skills als a string.
 * @returns {*} A list of objects representing items in the skill selector.
 * @constructor
 */
export function StringListToOptionsList(stringList){
    return stringList.map(value => ({"label": value, "value": value}))
}

/**
 * This function converts a list of options of the skill selector to a list of strings.
 * @param optionsList A list of objects representing the items in the skill selector.
 * @returns {*} A list of strings.
 * @constructor
 */
export function OptionListToStringList(optionsList){
    return optionsList.map(value => value.value)
}