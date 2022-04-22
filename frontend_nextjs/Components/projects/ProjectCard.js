import {Card, Col, Row} from "react-bootstrap";
import {log} from "../../utils/logger";
import {useRouter} from "next/router";
import SkillCard from "./SkillCard";
import AdminCard from "./AdminCard";
import {useEffect, useState} from "react";
import ParticipationCard from "./ParticipationCard";

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
        console.log(temp_dict)

        props.project.participations.map(participation => {
            temp_dict[participation.skill] = temp_dict[participation.skill] - 1 ;
        })
        console.log(temp_dict)
        let temp_list = []
        Object.keys(temp_dict).map(name => {
            temp_list.push({"amount": temp_dict[name], "name": name})
            // setSkills(prevState => [...prevState, {"amount": temp_dict[name], "name": name}])
        })
        console.log(temp_list)
        setSkills(temp_list)
        console.log(skills)
    }, [])

    return(
        <div className="align-content-center">
            <Card onClick={handleProjectClick}  className="card">
                <Card.Title> {props.project.name}</Card.Title>
                {/*todo make this clickable with link to partner?*/}
                <Card.Subtitle>{props.project.partner_name}</Card.Subtitle>
                <Card.Body>
                    <Row>
                        {(props.project.users.length) ? props.project.users.map(item => (<AdminCard key={item} user={item}/>)) : null }
                    </Row>
                    <Row>
                        <Col className={"border-right"}>
                            <h5>Needed</h5>
                            { (skills.length) ? (skills.map(skill =>
                                (<SkillCard key={name} name={skill.name} amount={skill.amount} />))): null}
                        </Col>
                        <Col>
                            <h5>The team</h5>
                            {(props.project.participations.length) ?
                                props.project.participations.map(participation => (<ParticipationCard key={participation} participation={participation}/>)) :
                                null
                            }
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}