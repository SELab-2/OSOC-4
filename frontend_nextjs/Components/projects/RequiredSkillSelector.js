import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import Image from 'next/image'
import Select from "react-select";
import red_cross from "../../public/assets/wrong.svg";
import {log} from "../../utils/logger";


/**
 * Searchable skill dropdown menu with a amount selector and remove button
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function RequiredSkillSelector(props){

    /**
     * removes the RequiredSkillSelector
     * @returns {Promise<void>}
     * @constructor
     */
    async function DeleteRequiredSkill() {
        if (props.requiredSkills.length > 1) {
            await props.setRequiredSkills(props.requiredSkills.filter((_, i) => i !== props.index))
        }
    }

    // /**
    //  * changes the value of the selected dropdown menu
    //  * @param value
    //  */
    // function changeRequiredSkill(value){
    //     let newArr = [...props.requiredSkills]
    //     newArr[props.index].skill_name = value
    //     props.setRequiredSkills(newArr)
    // }



    /**
     * changes the amount
     * @param amount
     * @constructor
     */
    function ChangeAmountRequiredSkill(amount){
        if (0 < amount && amount < 100){
            let newArr = [...props.requiredSkills]
            newArr[props.index]["number"] = amount
            props.setRequiredSkills(newArr)
        }
    }


    const filterOption = (candidate, input) => {
        return props.availableSkills.includes(candidate.label) && (input === undefined || candidate.label.includes(input))
    };

    return(
            <Row className={"required-skill-selector-row"}>
                <Col>
                    <Select classNamePrefix="select-search"
                            defaultValue={props.requiredSkills[props.index].skill_name !== "" ?
                                {"label": props.requiredSkills[props.index].skill_name, "value": props.requiredSkills[props.index].skill_name}
                            :
                                {"label": "no skill selected", "value":"no skill selected"}
                            }
                            onChange={async (value) => {
                                log(value)
                                await props.changeRequiredSkill(value, props.index)
                            }}
                            filterOption={filterOption}
                            noOptionsMessage={() => "No more options"}
                            options={props.skills}
                    />

                </Col>
                <Col xs="auto">
                    <Form.Control className={"required-skill-amount"} type="number" min={1} value={props.requiredSkill.number} onChange={e => ChangeAmountRequiredSkill(e.target.value)} />
                </Col>
                <Col xs="auto" className={"delete-cross"}>
                    <Image  alt={"delete student"} onClick={() => DeleteRequiredSkill()} src={red_cross} width={25} height={25}/>
                </Col>
            </Row>
    )
}