import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";
import AdminCard from "../../Components/projects/AdminCard";
import SkillCard from "../../Components/projects/SkillCard";
import ParticipationCard from "../../Components/projects/ParticipationCard";

const Project = () => {
    const router = useRouter()
    const { project_id } = router.query
    const [loaded, setLoaded] = useState(false)
    const [project, setProject] = useState(undefined)
    const [showDelete, setShowDelete] = useState(false);
    const [skills, setSkills] = useState([])

    useEffect(() => {
        if (! loaded) {
            api.invalidate();
            Url.fromName(api.projects).extend(`/${project_id}`).get().then(res => {
                if (res.success) {
                    setProject(res.data)
                    setLoaded(true)
                    let temp_dict = {}

                    res.data.required_skills.map(skill => {
                        temp_dict[skill.skill_name] = skill.number
                    })

                    res.data.participations.map(participation => {
                        temp_dict[participation.skill] = temp_dict[participation.skill] - 1;
                    })
                    // let temp_list = []
                    Object.keys(temp_dict).map(async name => {
                        await setSkills(prevState => [...prevState, {"amount": temp_dict[name], "name": name}])
                    })
                    // setSkills(temp_list)
                }
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

                    <br/>
                    <h3>Assigned staff</h3>
                    {(project.users.length) ? project.users.map(item => (<AdminCard key={item} user={item}/>)) : null }
                    <Row>
                        <Col>
                            <h3>Still needed skills:</h3>
                            { (skills.length) ? (skills.map(skill =>
                                (<SkillCard key={name} name={skill.name} amount={skill.amount} />))): null}
                        </Col>
                        <Col>
                            <h3>Assigned students</h3>
                            {(project.participations.length) ?
                                project.participations.map(participation => (<ParticipationCard key={participation} participation={participation}/>)) :
                                null
                            }
                        </Col>
                    </Row>
                    {/*TODO nog iets met user?*/}
                </div>) : null}
        </div>

    )
}

export default Project;