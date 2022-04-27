import {Card, Col, Row} from "react-bootstrap";
import {log} from "../../utils/logger";
import {useRouter} from "next/router";
import SkillCard from "./SkillCard";
import AdminCard from "./AdminCard";
import React, {useEffect, useState} from "react";
import ParticipationCard from "./ParticipationCard";
import Image from 'next/image'
import details from "/public/assets/details.svg"
import selected from "/public/assets/selected.svg"
import not_selected from "/public/assets/not_selected.svg"
import Hint from "../Hint";

/**
 * Card like representation of the given project
 * @param props project the project that it represents, selectedProject the currently selected project in the project tab,
 * setSelectedProject the setter for the currently selected project in the project tab.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ProjectCard(props) {

    const router = useRouter()

    const [skills, setSkills] = useState([])
    /**
     * Navigates to the detail page of props.project
     */
    const toProjectDetails = () => {
        log("navigate to new project")
        // currently hacky way to get id will be changed with updated api
        let list_id = props.project.id.split("/")
        let id = list_id[list_id.length - 1]

        router.push("/project/" + id)
    }
    /**
     * selects the props.project unless it is already selected, in that case selectedProject is set to undefined.
     */
    const selectProject = () => {
        props.setSelectedProject((props.project === props.selectedProject) ? undefined : props.project)
    }

    /**
     *
     */
    useEffect(() => {
        let temp_dict = {}
        props.project.required_skills.map(skill => {
            temp_dict[skill.skill_name] = skill.number
        })

        props.project.participations.map(participation => {
            temp_dict[participation.skill] = temp_dict[participation.skill] - 1 ;
        })
        let temp_list = []
        Object.keys(temp_dict).map(name => {
            temp_list.push({"amount": temp_dict[name], "name": name})
        })
        setSkills(temp_list)
    }, [])

    return(
        <div className={"project-card-div"}>
            <Card className={"project-card" + ((props.project === props.selectedProject) ? "-selected" : "")}>
                <Card.Body classname={"card-body"}>
                    <Row>
                        <Col>
                            <div className={"project-title"}> {props.project.name}</div>
                        </Col>
                        <Col xs={"auto"}>
                            <div className={"project-show-detail"}>
                                <Hint message="Select project" placement="top">
                                    <Image src={props.project === props.selectedProject ? selected : not_selected} height={25} width={25} onClick={selectProject}/>
                                </Hint>
                            </div>
                        </Col>
                        <Col xs={"auto"}>
                            <div className={"project-show-detail"}>
                                <Hint message="Show details" placement="top">
                                    <Image src={details} height={25} width={25} onClick={toProjectDetails}/>
                                </Hint>
                            </div>
                        </Col>
                    </Row>
                    <div className={"partner-title"} >{props.project.partner_name}</div>
                    {/*todo make this clickable with link to partner?*/}
                    <br/>

                    <Row>
                        {(props.project.users.length) ? props.project.users.map(item => (<AdminCard key={item} user={item}/>)) : null }
                    </Row>
                    <br/>
                    <Row>
                        <Col>
                            <div className={"project-title-list"}>
                                <div className={"project-card-title"}>Required skills</div>
                                { (skills.length) ? (skills.map(skill =>
                                    (<SkillCard key={`${skill.amount}${skill.name}`} name={skill.name} amount={skill.amount} />))): <div className={"project-empty-list"}>Currently there are no required skills</div>}
                            </div>
                        </Col>
                        <Col>
                            <div className={"project-title-list"}>
                                <div className={"project-card-title"}>Assigned students</div>
                                {(props.project.participations.length) ?
                                    props.project.participations.map(participation => (<ParticipationCard key={participation.student} participation={participation}/>)) :
                                    <div className={"project-empty-list"}>Currently there are no assigned students</div>
                                }
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}