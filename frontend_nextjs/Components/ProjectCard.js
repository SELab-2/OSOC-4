import {Card, Col, Row} from "react-bootstrap";
import {log} from "../utils/logger";
import {useRouter} from "next/router";

export default function ProjectCard(props) {

    const router = useRouter()

    const handleProjectClick = () => {
        log("navigate to new project")
        // currently hacky way to get id will be changed with updated api
        let list_id = props.project.id.split("/")
        let id = list_id[list_id.length - 1]

        router.push("/project/" + id)
    }

    return(
        <div  className="align-content-center">
            <Card onClick={handleProjectClick}  className="card">
                <Card.Title> {props.project.name}</Card.Title>
                {/*todo make this clickable with link to partner?*/}
                <Card.Subtitle>{props.project.partner.name}</Card.Subtitle>
                <Card.Body>
                    <Row>
                        <Col className={"border-right"}>
                            <h5>Needed</h5>
                            { (props.project.required_skills.length) ? (props.project.required_skills.map(item => (<div>{item.number}</div>))) : null}
                        </Col>
                        <Col>
                            <h5>The team</h5>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    )
}