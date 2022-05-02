import {Col, Form, Row} from "react-bootstrap";
import SelectSearch, {fuzzySearch} from "react-select-search";
import React from "react";
import Image from 'next/image'
import red_cross from "../../public/assets/wrong.svg";

export default function RequiredSkillSelector(props){

    async function DeleteRequiredSkill() {
        if (props.requiredSkills.length > 1) {
            await props.setRequiredSkills(props.requiredSkills.filter((_, i) => i !== props.index))
        }
    }

    function changeRequiredSkill(value){
        let newArr = [...props.requiredSkills]
        newArr[props.index].skill_name = value
        props.setRequiredSkills(newArr)
    }

    function ChangeAmountRequiredSkill(amount){
        if (0 < amount && amount < 100){
            let newArr = [...props.requiredSkills]
            newArr[props.index]["number"] = amount
            props.setRequiredSkills(newArr)
        }
    }

    return(
            <Row className={"required-skill-selector-row"}>
                <Col md={"auto"}>
                    <SelectSearch
                        options={props.skills}
                        value={props.requiredSkill.skill_name}
                        search
                        filterOptions={fuzzySearch}
                        onChange={value => changeRequiredSkill(value)}
                        emptyMessage={() => <div style={{ textAlign: 'center', fontSize: '0.8em' }}>Skill not found</div>}
                        placeholder="Select the required skill"
                    />

                </Col>
                <Col xs="auto">
                    <Form.Control className={"required-skill-amount"} type="number" value={props.requiredSkill.number} onChange={e => ChangeAmountRequiredSkill(e.target.value)} />
                </Col>
                <Col xs="auto">
                    <Image  alt={"delete student"} onClick={() => DeleteRequiredSkill()} src={red_cross} width={25} height={25}/>
                </Col>
            </Row>
    )
}