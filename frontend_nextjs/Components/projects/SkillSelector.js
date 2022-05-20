import React from "react";
import {log} from "../../utils/logger";
import Select from "react-select";

/**
 * dropdown select menu with search, that allows you to select a skill
 * @param props skills the available to select skills, setSelectedSkill function to update the selectedskill state,
 * selectedSkill the currently selected skill
 * @returns {JSX.Element}
 * @constructor
 */
export default function SkillSelector(props){

    const filterOption = (candidate, input) => {
        log(props.options)
        return input === undefined || candidate.label.includes(input)
    };

    return(
        <div>
            <Select classNamePrefix="select-search"
                    defaultValue={props.selectedSkill}
                    onChange={async (value) => {
                        await props.setSelectedSkill(value)
                    }}
                    filterOption={filterOption}
                    noOptionsMessage={() => "No more options"}
                    options={props.options}
            />
        </div>
    )
}