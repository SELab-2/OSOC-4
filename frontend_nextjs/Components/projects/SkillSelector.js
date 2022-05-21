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

  /**
   * This function is used to filter skills with text search.
   * @param candidate The canditate skill.
   * @param input The input of the text field.
   * @returns {*|boolean} True if the candidate should be shown with te given input text, false otherwise.
   */
    const filterOption = (candidate, input) => {
        return input === undefined || candidate.label.toLowerCase().includes(input.toLowerCase())
    };

    /**
     * Return the html of the SkillSelector.
     */
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