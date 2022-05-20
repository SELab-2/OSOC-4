import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Modal, Row } from "react-bootstrap";
import { api, Url } from "../../utils/ApiClient";
import AdminCard from "../../Components/projects/AdminCard";
import SkillCard from "../../Components/projects/SkillCard";
import ParticipationCard from "../../Components/projects/ParticipationCard";
import Image from 'next/image'
import back from "/public/assets/back.svg"
import edit from "/public/assets/edit.svg"
import save_image from "/public/assets/save.svg"
import delete_image from "/public/assets/delete.svg"
import Hint from "../../Components/Hint";
import RequiredSkillSelector from "../../Components/projects/RequiredSkillSelector";
import red_cross from "/public/assets/wrong.svg"
import { getID } from "../../utils/string";
import PropTypes from "prop-types";
import EditableDiv from "../../Components/projects/EditableDiv";
import plus from "/public/assets/plus.svg"
import { log } from "../../utils/logger";
import { useWebsocketContext } from "../../Components/WebsocketProvider";

import { checkProjectBody } from "../../utils/inputchecker";
function Input(props) {
    return null;
}

Input.propTypes = { children: PropTypes.node };
/**
 * this page corresponds with the projects/id tab
 * @returns {JSX.Element}
 * @constructor
 */
const Project = () => {
    const router = useRouter();
    const { project_id } = router.query;
    const [loaded, setLoaded] = useState(false);
    const [project, setProject] = useState(undefined);
    const [showDelete, setShowDelete] = useState(false);
    const [skills, setSkills] = useState([]);
    const [requiredSkills, setRequiredSkills] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [partnerDescription, setPartnerDescription] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [partnerName, setPartnerName] = useState("");
    const [projectName, setProjectName] = useState("")
    const [stillRequiredSkills, setStillRequiredSkills] = useState([]);
    const [users, setUsers] = useState([]);
    const [showError, setShowError] = useState(false);
    const [showBackExit, setShowBackExit] = useState(false);
    const [showStopEditing, setShowStopEditing] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([])

    const { websocketConn } = useWebsocketContext();

    useEffect(() => {
        if (!loaded) {
            api.invalidate();
            Url.fromName(api.projects).extend(`/${project_id}`).get().then(async res => {
                if (res.success) {
                    setProject(res.data)
                    setEditFields(res.data)

                    setLoaded(true)
                    let temp_dict = {}

                    res.data.required_skills.map(skill => {
                        temp_dict[skill.skill_name] = skill.number
                    })

                    setRequiredSkills(Object.keys(temp_dict).map(name => ({ "number": temp_dict[name], "skill_name": name })))

                    Object.values(res.data.participations).map(participation => {
                        temp_dict[participation.skill] = temp_dict[participation.skill] - 1;
                    })

                    setStillRequiredSkills(Object.keys(temp_dict).map(name => ({ "number": temp_dict[name], "skill_name": name })))
                }
            });
        }

    }, [])

    useEffect(() => {
        Url.fromName(api.skills).get().then(async res => {
            if (res.success) {
                res = res.data;
                if (res) {
                    // scuffed way to get unique skills (should be fixed in backend soon)
                    let array = [];
                    res.map(skill => array.push({ "value": skill, "label": skill }));
                    setSkills(array);
                }
            }
        })
    }, [])

    /**
     * Initalize the value of available skills after mounting the component
     */
    useEffect(() => {
        if (availableSkills.length === 0 && skills.length !== 0 && requiredSkills.length !== 0) {
            let skillNames = requiredSkills.map(skill => skill.skill_name);
            setAvailableSkills(skills.filter(skill => !skillNames.includes(skill.value)).map(skill => skill.value))
        }
    }, [requiredSkills, skills])

    useEffect(() => {

        if (websocketConn) {
            websocketConn.addEventListener("message", updateDetailsFromWebsocket)

            return () => {
                websocketConn.removeEventListener('message', updateDetailsFromWebsocket)
            }
        }

    }, [websocketConn, project, router.query])

    const updateDetailsFromWebsocket = (event) => {
        let data = JSON.parse(event.data)
        const studentid = parseInt(data["studentId"])
        const projectid = parseInt(data["projectId"])

        if (projectid === project.id_int) {
            if ("participation" in data) {
                let new_project = project;
                new_project.participations[studentid] = data["participation"];
                setProject({ ...new_project });
            } else if ("deleted_participation" in data) {
                let new_project = project;
                delete new_project.participations[studentid];
                setProject({ ...new_project });
            }
        }

    }

    async function deleteProject() {
        Url.fromUrl(project.id)
            .delete().then(res => {
                if (res.success) {
                    setShowDelete(false);
                    router.push('/projects')
                } else {
                    alert("Error: the project '" + project.name + "' couldn't be deleted.");
                }
            })
    }

    /**
     * Add new empty value in dropdown menu
     */
    function addRequiredSkill() {
        setRequiredSkills(prevState => [...prevState, { "number": 1, "skill_name": "" }])
    }

    function changeRequiredSkill(value, index){
        if(requiredSkills[index].label !== ""){
            log([...(availableSkills.filter(skill => skill !== value.label)), requiredSkills[index].label])
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label)), requiredSkills[index].label])
        } else {
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label))])
        }
        let newArray = [...requiredSkills]
        newArray[index] = value
        setRequiredSkills(newArray)
    }
    /**
     * Gets called after successfully removing a user from a project.
     * @param index
     * @returns {Promise<void>}
     */
    async function deleteUser(index) {
        await setUsers(users.filter((_, i) => i !== index))
    }

    //TODO make this add user to project
    function addUser() {
    }

    /**
     * sets the edit fields with the current values of the project
     * @param original
     */
    function setEditFields(original) {
        setProjectName(original.name)

        setPartnerName(original.partner_name)
        setProjectDescription(original.description)

        setPartnerDescription(original.partner_description)

        setUsers(original.users)
    }

    /**
     * sets the project with the current values of the edit fields
     * @param body
     */
    function setFields(body) {
        // in body users only consists of its ids, not the full links so we have to use the "users" state
        setProject(prevState => ({ ...prevState, ...body, "users": users }))
    }

    /**
     * check if body if the given body is correct, if not show error message
     * @param body
     */
    function checkBody(body) {
        if (body.required_skills.some(skill => skill.skill_name === "")) {
            setShowError(true)
            return false
        }
        let names_list = body.required_skills.map(skill => skill.skill_name)
        if (names_list.some((skill_name, index) => names_list.indexOf(skill_name) !== index)) {
            setShowError(true)
            return false
        }

        return true
    }

    /**
     * make patch request to change project
     * @returns {Promise<void>}
     */
    async function changeProject() {
        let body = {
            "name": projectName,
            "description": projectDescription,
            "required_skills": requiredSkills,
            "partner_name": partnerName,
            "partner_description": partnerDescription,
            "edition": api.year,
            "users": users.map(url => getID(url))
        }
        if (checkProjectBody(body)) {
            let res = await Url.fromName(api.projects).extend(`/${project_id}`).setBody(body).patch();
            if (res.success) {
                setFields(body)
                setShowEdit(false)
            } else {
                setShowError(true)
            }
        }
    }

    return (
        <div>
            {showError ?
                <Alert variant={"warning"} onClose={() => setShowError(false)} dismissible>
                    Error could not save changes to project
                </Alert> : null
            }
            <Row>
                {loaded ? (<div>
                    <Row className={"project-top-bar nomargin"}>
                        <Col xs="auto" >
                            <Hint message="Go back">
                                <Image alt={"back button"} onClick={() => {
                                    if (showEdit) {
                                        setShowBackExit(true)
                                    } else {
                                        router.back()
                                    }
                                }} src={back} width={100} height={33} />
                            </Hint>
                            <Modal show={showBackExit} onHide={() => setShowBackExit(false)}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Leave page while editing</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Are you sure you want to leave this page while editing it? Doing so will lose your current changes. </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                                        Keep editing
                                    </Button>
                                    <Button variant="primary" onClick={() => {
                                        setShowBackExit(true)
                                        router.back()
                                    }}>
                                        Leave page
                                    </Button>

                                </Modal.Footer>
                            </Modal>
                        </Col>
                        <Col>
                            <EditableDiv cssClass={"project-details-project-title"} showEdit={showEdit} value={project.name} changeValue={projectName} setChangeValue={setProjectName} />
                        </Col>
                        <Col xs="auto" >
                            {showEdit ?
                                <Hint message="Save changes">
                                    <Image alt={"save button"} src={save_image} onClick={() => {
                                        changeProject()
                                    }} width={33} height={33} />
                                </Hint>
                                :
                                <Hint message="Edit project">
                                    <Image alt={"edit button"} onClick={() => {
                                        setEditFields(project)
                                        setShowEdit(true)
                                    }} src={edit} width={33} height={33} />
                                </Hint>
                            }
                        </Col>
                        <Col xs="auto" >
                            {showEdit ?
                                <>
                                    <Hint message="Cancel edit">
                                        <Image alt={"cancel edit button"} src={red_cross} width={33} height={33} onClick={() => setShowStopEditing(true)} />
                                    </Hint>
                                    <Modal show={showStopEditing} onHide={() => setShowStopEditing(false)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Stop editing</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>Are you sure you want to stop editing? Doing so will lose your current changes.</Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={() => setShowStopEditing(false)}>
                                                Keep editing
                                            </Button>
                                            <Button variant="primary" onClick={() => {
                                                setShowStopEditing(false)
                                                setShowEdit(false)
                                            }}>
                                                Stop editing
                                            </Button>

                                        </Modal.Footer>
                                    </Modal>
                                </>

                                :
                                <div>
                                    <Hint message="Delete project">
                                        <Image alt={"delete button"} src={delete_image} width={33} height={33} onClick={() => setShowDelete(true)} />
                                    </Hint>
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
                                </div>
                            }

                        </Col>
                    </Row>
                    <div className={"project-details-page"} >
                        <div className={"project-details-edit-field-width"}>
                            <Row className={"nomargin"}>
                                <Col xs={"auto"}>
                                    <div className={"project-details-title-info"} >Project by: </div>
                                </Col>
                                <Col>
                                    <EditableDiv isTextArea={false} showEdit={showEdit} value={project.partner_name} changeValue={partnerName} setChangeValue={setPartnerName} cssClass={"project-details-title"} />
                                </Col>
                            </Row>

                            <EditableDiv isTextArea={false} showEdit={showEdit} value={project.partner_description} changeValue={partnerDescription} setChangeValue={setPartnerDescription} cssClass={"project-details-subtitle"} />
                            <div className={"project-details-title-info"}>About the project</div>
                            <EditableDiv isTextArea={true} cssClass={"project-details-big-subtitle"} showEdit={showEdit} value={project.description} changeValue={projectDescription} setChangeValue={setProjectDescription} />

                        </div>

                        <div className={"project-details-title-info"}>Assigned staff</div>
                        <div className={"project-details-user-div" + (showEdit ? "-edit" : "")}>
                            {(users.length) ?
                                users.map((item, index) => (<AdminCard key={item} showEdit={showEdit} index={index} deleteUser={deleteUser} user={item} />))
                                :
                                <div className={"project-empty-list"}>Currently there are no assigned staff</div>}
                        </div>
                        {showEdit ?
                            // TODO make this pop up a selection tool for users
                            <Hint message="Add new coach / admin to the project">
                                <div className={"project-details-plus-user"}>
                                    <Image width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={() => addUser()} />
                                </div>
                            </Hint>
                            : null}
                        <Row>
                            <Col>
                                <div>
                                    <div className={"project-card-title"}>All required skills</div>
                                    {(requiredSkills.length) ? (requiredSkills.map((requiredSkill, index) => {
                                        if (showEdit) {
                                            return <RequiredSkillSelector className={"required-skill-selector-row"}
                                                                          availableSkills={availableSkills} changeRequiredSkill={changeRequiredSkill}
                                                                          setAvailableSkills={setAvailableSkills}
                                                                          key={index} index={index} skills={skills} requiredSkill={requiredSkill}
                                                                          setRequiredSkills={setRequiredSkills} requiredSkills={requiredSkills} />
                                        }
                                        return <SkillCard key={index} skill_name={requiredSkill.skill_name} number={requiredSkill.number} />
                                    })) : <div className={"project-empty-list-col"}>Currently there are no required skills</div>
                                    }
                                </div>
                                {showEdit ?
                                    <Hint message="Add new required skill">
                                        <div className={"project-details-plus-skill"} >
                                            <Image width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={() => addRequiredSkill()} />
                                        </div>
                                    </Hint>
                                    : null}
                            </Col>
                            <Col>
                                <div>
                                    <div className={"project-card-title"}>Still required skills</div>
                                    {(stillRequiredSkills.length) ? (stillRequiredSkills.map((requiredSkill, index) => {
                                        if (requiredSkill.number > 0) {
                                            return <SkillCard key={index} skill_name={requiredSkill.skill_name} number={requiredSkill.number} />
                                        }
                                        return null
                                    }))
                                        :
                                        <div className={"project-empty-list-col"}>Currently there are no required skills</div>
                                    }
                                </div>
                            </Col>
                            <Col>
                                <div>
                                    <div className={"project-card-title"}>Assigned students</div>
                                    {(Object.values(project.participations).length) ?
                                        Object.values(project.participations).map(participation => (<ParticipationCard key={participation.student} participation={participation} project={project} />)) :
                                        <div className={"project-empty-list-col"}>Currently there are no assigned students</div>
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>

                </div>) : null}
            </Row>
        </div>
    )
}

export default Project;