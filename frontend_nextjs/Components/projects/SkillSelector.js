import React, {useEffect, useState} from "react";
import {log} from "../../utils/logger";
import Select from "react-select";
import {StringListToOptionsList} from "../../utils/skillselector";

/**
 * dropdown select menu with search, that allows you to select a skill
 * @param props skills the available to select skills, setSelectedSkill function to update the selectedskill state,
 * selectedSkill the currently selected skill
 * @returns {JSX.Element}
 * @constructor
 */
export default function SkillSelector(props){

    const [options, setOptions] = useState([{"value": "None", "label": "None"},
        {"label": "Student skills", "options":[]}, {"label": "Project needed skills", "options": []},
        {"label": "other skills", "value": []}]
    )

    useEffect(() => {
        let tempArray = [...options]
        // log(props.studentSkills)
        tempArray[1] = {"label": "Student skills", "options":StringListToOptionsList(props.studentSkills)}
        log("TEST DING IN studentskills")
        log(tempArray)
        setOptions(tempArray)
    }, [props.studentSkills])

    useEffect(() => {
        let tempArray = [...options]
        tempArray[2] = {"label": "Student skills", "options":StringListToOptionsList(props.projectNeededSkills)}
        setOptions(tempArray)
    }, [props.projectNeededSkills])

    useEffect(() => {
        let tempArray = [...options]
        tempArray[3] = {"label": "Student skills", "options": StringListToOptionsList(props.skillsLeft)}
        setOptions(tempArray)
    }, [props.skillsLeft])

    useEffect(() => {
        log("option logger")
        log(options)
    }, [options])

    const filterOption = (candidate, input) => {
        return input === undefined || candidate.label.includes(input)
    };

    return(
        <div>
            <Select classNamePrefix="select-search"
                    defaultValue={props.selectedSkill}
                    onChange={async (value) => {
                        log(value)
                        await props.setSelectedSkill(value)
                    }}
                    filterOption={filterOption}
                    noOptionsMessage={() => "No more options"}
                    options={options}
            />
            {/*{props.skills.length ?*/}
            {/*    <SelectSearch*/}
            {/*        options={props.skills}*/}
            {/*        value={props.selectedSkill === undefined ? "" : props.selectedSkill.name}*/}
            {/*        search*/}
            {/*        filterOptions={fuzzySearch}*/}
            {/*        autoComplete={true}*/}
            {/*        onChange={value => props.setSelectedSkill(value)}*/}
            {/*        emptyMessage={() => <div style={"skill-not-found"}>Skill not found</div>}/> :*/}
            {/*    <div>*/}
            {/*        The selected student does not seem to have any needed skills for the selected project*/}
            {/*    </div>}*/}
        </div>
    )
}