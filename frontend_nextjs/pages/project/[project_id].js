import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";
import {Button, Col, Row} from "react-bootstrap";

const Project = () => {
    const router = useRouter()
    const { project_id } = router.query
    const [loaded, setLoaded] = useState(false)
    const [project, setProject] = useState(undefined)

    useEffect(() => {
        if (! loaded) {
            getJson("/projects" + "/" + project_id).then(res => {
                log("load project")
                log(res)
                setProject(res.data)
                setLoaded(true)
            });
        }
    })

    return (
        <div>
            { loaded ? (
                <div>
                    <Row>
                        <Col>
                            <Button onClick={() => router.back()}>Go back</Button>
                        </Col>
                        <Col>
                            <h1>{project.name}</h1>
                        </Col>
                        <Col>
                            <Button>Edit</Button>
                        </Col>
                        <Col>
                            <Button>Delete</Button>
                        </Col>
                    </Row>
                    <h2>Project by: {project.partner.name}</h2>
                    <p>{project.partner.about}</p>
                    <br/>
                    <h2>About the project</h2>
                    <p>{project.description}</p>

                    <h2>Goals</h2>
                    {project.goals.map((goal, index) => (<p key={index}>- {goal}</p>))}
                    {/*TODO nog iets met user?*/}
                </div>) : null}
        </div>

    )
}

export default Project;