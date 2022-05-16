


export function StringListToOptionsList(stringList){
    return stringList.map(value => ({"label": value, "value": value}))
}

export function OptionListToStringList(optionsList){
    return optionsList.map(value => value.value)
}