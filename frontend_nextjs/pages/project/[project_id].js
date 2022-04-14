import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {urlManager} from "../../utils/ApiClient";

const Project = () => {
    const router = useRouter()
    const { project_id } = router.query
    const [loaded, setLoaded] = useState(false)
    const [project, setProject] = useState(undefined)
    const [showDelete, setShowDelete] = useState(false);


    useEffect(() => {
        if (! loaded) {
                getJson("projects/" + project_id).then(res => {
                    log("load project")
                    log(res)
                    setProject(res)
                    setLoaded(true)
                });
        }
    })

    //TODO make this delete project
    async function deleteProject(){

    }

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
                            {/*TODO make this go to actually edit page*/}
                            <Button>Edit</Button>
                        </Col>
                        <Col>
                            <Button onClick={() => setShowDelete(true)}>Delete</Button>
                            <Modal show={showDelete} onHide={() => setShowDelete(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Delete project?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Are you sure you want to delete this project? Doing so will not be reversible. </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => {
                                        setShowDelete(false)
                                        deleteProject()
                                        log("DELETE PROJECT")
                                        router.push("/projects")
                                    }}>
                                        Delete project
                                    </Button>
                                    <Button variant="primary" onClick={() => setShowDelete(false)}>
                                        Keep project
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </Col>
                    </Row>
                    <h2>Project by: {project.partner_name}</h2>
                    <p>{project.partner_description}</p>
                    <br/>
                    <h2>About the project</h2>
                    <p>{project.description}</p>

                    <h2>Goals</h2>
                    {project.goals.split("\n").map((goal, index) => (<p key={index}>- {goal}</p>))}
                    {/*TODO nog iets met user?*/}
                </div>) : null}
        </div>

    )
}

export default Project;