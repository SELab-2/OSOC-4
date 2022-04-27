import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";
import AdminCard from "../../Components/projects/AdminCard";
import SkillCard from "../../Components/projects/SkillCard";
import ParticipationCard from "../../Components/projects/ParticipationCard";
import Image from 'next/image'
import back from "/public/assets/back.svg"
import edit from "/public/assets/edit.svg"
import delete_image from "/public/assets/delete.svg"

const Project = () => {
    const router = useRouter()
    const { project_id } = router.query
    const [loaded, setLoaded] = useState(false)
    const [project, setProject] = useState(undefined)
    const [showDelete, setShowDelete] = useState(false);
    const [skills, setSkills] = useState([])
    const [showEdit, setShowEdit] = useState(false)

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
    }, [])

    //TODO make this delete project
    async function deleteProject(){

    }

    return (
        <div className="remaining_height fill_width">
            { loaded ? (
                <div>
                    <Row className={"project-top-bar"}>
                        <Col xs="auto" >
                            <Image alt={"back button"} onClick={() => router.back()} src={back} width={100} height={33}/>
                        </Col>
                        <Col>
                            <div className={"project-details-project-title"}>{project.name}</div>
                        </Col>
                        <Col xs="auto" >
                            <Image alt={"edit button"} onClick={() => setShowEdit(prevState => ! prevState)} src={edit} width={33} height={33}/>
                            {/*TODO make this actually turn edit on*/}
                        </Col>
                        <Col xs="auto" >
                            <Image alt={"delete button"} src={delete_image} width={33} height={33} onClick={() => setShowDelete(true)}/>
                            <Modal show={showDelete} onHide={() => setShowDelete(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Delete project?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Are you sure you want to delete this project? Doing so will not be reversible. </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                                        Keep project
                                    </Button>
                                    <Button variant="primary" onClick={() => {
                                        setShowDelete(false)
                                        deleteProject()
                                        router.push("/projects")
                                    }}>
                                        Delete project
                                    </Button>

                                </Modal.Footer>
                            </Modal>
                        </Col>
                    </Row>
                    <div className={"project-details-page"} >
                        <div className={"project-details-title"} >Project by: {project.partner_name}</div>
                        <div className={"project-details-subtitle"}>{project.partner_description}</div>

                        <div className={"project-details-title"}>About the project</div>
                        <div className={"project-details-subtitle"}>{project.description}</div>

                        <div>
                            <div className={"project-details-title"}>Assigned staff</div>
                            {(project.users.length) ? project.users.map(item => (<AdminCard key={item} user={item}/>)) : <div className={"project-empty-list"}>Currently there are no assigned staff</div> }
                        </div>
                        <br/>
                        <Row>
                            <Col>
                                <div>
                                    <div className={"project-card-title"}>Required skills</div>
                                    { (skills.length) ? (skills.map(skill =>
                                        (<SkillCard key={`${skill.amount}${skill.name}`} name={skill.name} amount={skill.amount} />))): <div className={"project-empty-list"}>Currently there are no required skills</div>}
                                </div>
                            </Col>
                            <Col>
                                <div>
                                    <div className={"project-card-title"}>Assigned students</div>
                                    {(project.participations.length) ?
                                        project.participations.map(participation => (<ParticipationCard key={participation.student} participation={participation} project={project}/>)) :
                                        <div className={"project-empty-list"}>Currently there are no assigned students</div>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>

                </div>) : null}
        </div>

    )
}

export default Project;