import SelectSearch, {fuzzySearch} from "react-select-search";
import React from "react";

/**
 * dropdown select menu with search, that allows you to select a skill
 * @param props skills the available to select skills, setSelectedSkill function to update the selectedskill state,
 * selectedSkill the currently selected skill
 * @returns {JSX.Element}
 * @constructor
 */
export default function SkillSelector(props){

    return(
        <div>
            {props.skills.length ?
                <SelectSearch
                    options={props.skills}
                    value={props.selectedSkill === undefined ? "" : props.selectedSkill.name}
                    search
                    filterOptions={fuzzySearch}
                    onChange={value => props.setSelectedSkill(value)}
                    emptyMessage={() => <div style={{ textAlign: 'center', fontSize: '0.8em' }}>Skill not found</div>}/> : <div>
                    The selected student does not seem to have any needed skills for the selected project
                </div>}
        </div>
    )
}