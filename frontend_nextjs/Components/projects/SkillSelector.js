import SelectSearch, {fuzzySearch} from "react-select-search";
import React, {useEffect} from "react";
import {log} from "../../utils/logger";


export default function SkillSelector(props){

    return(
        <div>
            {props.skills.length ?
                <SelectSearch
                    options={props.skills}
                    value={props.selectedSkill === undefined ? "" : props.selectedSkill.name}
                    search
                    filterOptions={fuzzySearch}
                    autoComplete={true}
                    onChange={value => props.setSelectedSkill(value)}
                    emptyMessage={() => <div style={{ textAlign: 'center', fontSize: '0.8em' }}>Skill not found</div>}/> : <div>
                    The selected student does not seem to have any needed skills for the selected project
                </div>}
        </div>
    )
}