import {Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import Image from 'next/image'
import Select from "react-select";
import red_cross from "../../public/assets/wrong.svg";
import {log} from "../../utils/logger";


/**
 * Searchable skill dropdown menu with an amount selector and remove button
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
      if (props.requiredSkills[props.index].skill_name !== "") {
        props.setAvailableSkills(prevState => [...prevState, props.requiredSkills[props.index].skill_name])
      }
      // console.log(props.index)
      // log(props.requiredSkills.filter((_, i) => i !== props.index))
      // log(props.requiredSkills[props.index])
      if (props.requiredSkills.length > 1) {
        await props.setRequiredSkills(props.requiredSkills.filter((_, i) => i !== props.index))
      }
    }

    /**
     * changes the amount of the required skill
     * @param amount the new amount of the required skill.
     * @constructor
     */
    function ChangeAmountRequiredSkill(amount){
        if (0 < amount && amount < 100){
            let newArr = [...props.requiredSkills]
            newArr[props.index]["number"] = parseInt(amount)
            props.setRequiredSkills(newArr)
        }
    }

  /**
   * This function is used to filter skills with text search.
   * @param candidate The canditate skill.
   * @param input The input of the text field.
   * @returns {*|boolean} True if the candidate should be shown with te given input text, false otherwise.
   */
    const filterOption = (candidate, input) => {
        return props.availableSkills.includes(candidate.label) && (input === undefined || candidate.label.includes(input))
    };

    /**
     * Return the html of the RequiredSkillSelector.
     */
    return(
        <Row className={"required-skill-selector-row"}>
            <Col>
                <Select classNamePrefix="select-search"
                        value={props.requiredSkills[props.index].skill_name !== "" ?
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