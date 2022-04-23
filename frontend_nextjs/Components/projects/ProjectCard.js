import {Card, Col, Row} from "react-bootstrap";
import {log} from "../../utils/logger";
import {useRouter} from "next/router";
import SkillCard from "./SkillCard";
import AdminCard from "./AdminCard";
import {useEffect, useState} from "react";
import ParticipationCard from "./ParticipationCard";
import Image from 'next/image'
import details from "/public/assets/details.svg"


export default function ProjectCard(props) {

    const router = useRouter()

    const [skills, setSkills] = useState([])

    const handleProjectClick = () => {
        log("navigate to new project")
        // currently hacky way to get id will be changed with updated api
        let list_id = props.project.id.split("/")
        let id = list_id[list_id.length - 1]

        router.push("/project/" + id)
    }

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
            // setSkills(prevState => [...prevState, {"amount": temp_dict[name], "name": name}])
        })
        setSkills(temp_list)
    }, [])

    return(
        <div className="project-card-div">
            <Card className="project-card">
                <Card.Body classname={"card-body"}>
                    <Row>
                        <Col>
                            <div className={"project-title"}> {props.project.name}</div>
                        </Col>
                        <Col xs={"auto"}>
                            <div className={"project-show-detail"}>
                                <Image src={details} height={25} width={25} onClick={handleProjectClick}/>
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
                                <div className={"project-card-title"} >Needed</div>
                                { (skills.length) ? (skills.map(skill =>
                                    (<SkillCard key={name} name={skill.name} amount={skill.amount} />))): null}
                            </div>
                        </Col>
                        <Col>
                            <div className={"project-title-list"}>
                                <div className={"project-card-title"} >The team</div>
                                {(props.project.participations.length) ?
                                    props.project.participations.map(participation => (<ParticipationCard key={participation} participation={participation}/>)) :
                                    null
                                }
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}