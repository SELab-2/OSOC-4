import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { api, Url } from "../../utils/ApiClient";
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
import PropTypes from "prop-types";
import EditableDiv from "../../Components/projects/EditableDiv";
import plus from "/public/assets/plus.svg"
import { useWebsocketContext } from "../../Components/WebsocketProvider";
import { ToastContainer, toast } from 'react-toastify';
import useWindowDimensions from "../../utils/WindowDimensions";

import { checkProjectBody } from "../../utils/inputchecker";
function Input(props) {
    return null;
}

Input.propTypes = { children: PropTypes.node };

/**
 * this page corresponds with the projects/id tab
 * @returns {JSX.Element} The component rendering the project details.
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
    const [showBackExit, setShowBackExit] = useState(false);
    const [showStopEditing, setShowStopEditing] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [fullView, setFullView] = useState(false);
    const { height, width } = useWindowDimensions();


    const { websocketConn } = useWebsocketContext();

    /**
     * This useEffect initializes the project, editfields, requiredSkills and stillRequiredSkills state variables.
     */
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

    /**
     * This useEffect initializes the skills state variable.
     */
    useEffect(() => {
        Url.fromName(api.skills).get().then(async res => {
            if (res.success) {
                res = res.data;
                if (res) {
                    let array = [];
                    res.map(skill => array.push({ "value": skill, "label": skill }));
                    setSkills(array);
                }
            }
        })
    }, [])

    /**
     * This useEffect changes the fullView state variable, on change of the screen width or router.
     */
    useEffect(() => {
        setFullView(width > 1500 || (width > 1000 && !router.query.studentId));
    }, [width]);

    /**
     * Initalize the value of available skills after mounting the component
     */
    useEffect(() => {
        if (availableSkills.length === 0 && skills.length !== 0 && requiredSkills.length !== 0) {
            let skillNames = requiredSkills.map(skill => skill.skill_name);
            setAvailableSkills(skills.filter(skill => !skillNames.includes(skill.value)).map(skill => skill.value))
        }
    }, [requiredSkills, skills])

    /**
     * This function adds an event listener to the websockets to call updateDetailsFromWebsocket when the data changes.
     */
    useEffect(() => {

        if (websocketConn) {
            websocketConn.addEventListener("message", updateDetailsFromWebsocket)

            return () => {
                websocketConn.removeEventListener('message', updateDetailsFromWebsocket)
            }
        }

    }, [websocketConn, project, router.query])

    /**
     * This function is called when the data has changed. It determines wich data has changed and changes the
     * state of the application.
     * @param event contains the data that changed.
     */
    const updateDetailsFromWebsocket = (event) => {
        let data = JSON.parse(event.data)
        const studentid = parseInt(data["studentId"])
        const projectid = parseInt(data["projectId"])

        // The current project has been changed.
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

    /**
     * Delete the current project.
     * @returns {Promise<void>}
     */
    async function deleteProject() {
        Url.fromUrl(project.id)
            .delete().then(res => {
                if (res.success) {
                    setShowDelete(false);
                    router.push('/projects')
                } else {
                    toast.error("The project '" + project.name + "' couldn't be deleted.");
                }
            })
    }

    /**
     * Add new empty value in dropdown menu
     */
    function addRequiredSkill() {
        if(requiredSkills.length < skills.length){
            setRequiredSkills(prevState => [...prevState, { "number": 1, "skill_name": "" }])
        } else {
            toast.error("Can't have more required skills than skills")
        }
    }

    /**
     * Change the required skills state variable.
     * @param value The new/changed required skill.
     * @param index The index of the required skill in the requiredSkills list.
     */
    function changeRequiredSkill(value, index){
        if(requiredSkills[index].label !== ""){
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label)), requiredSkills[index].skill_name])
        } else {
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label))])
        }
        let newArray = [...requiredSkills]
        newArray[index].skill_name = value.value
        setRequiredSkills(newArray)
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

    }

    /**
     * sets the project with the current values of the edit fields
     * @param body
     */
    function setFields(body) {
        // in body users only consists of its ids, not the full links, so we have to use the "users" state
        setProject(prevState => ({ ...prevState, ...body}))
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
            "edition": api.getYear(),
        }
        let response = checkProjectBody(body)
        if (response.correct) {
            let res = await Url.fromName(api.projects).extend(`/${project_id}`).setBody(body).patch();
            if (res.success) {
                setFields(body)
                setShowEdit(false)
                toast.done("Project changed succesfully!")
            } else {
                toast.error("Could not save changes to project")
            }
        } else {
            toast.error("You have given an incorrect " + response.problem)
        }
    }

    /**
     * Returns the html of the 'project details' page.
     */
    return (
        <div>
            <Row>
                {loaded ? (<div>
                    <Row className={"project-top-bar nomargin"}>
                        <Col style={{"max-width": 100}} >
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
                        {fullView ?
                            <Col>
                                <EditableDiv cssClass={"project-details-project-title"} showEdit={showEdit} value={project.name} changeValue={projectName} setChangeValue={setProjectName} />
                            </Col>
                        : <Col/>}

                        <Col xs="auto">
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
                        {! fullView ?
                            <EditableDiv cssClass={"project-details-project-title-small"} showEdit={showEdit} value={project.name} changeValue={projectName} setChangeValue={setProjectName} />

                        : null}
                        <div className={"project-details-edit-field-width" + (! fullView ? "-small" : "")}>
                            <Row className={"nomargin"}>
                                <Col className="nomargin nopadding" xs={"auto"}>
                                    <div className={"project-details-title-info"} >Project by: </div>
                                </Col>
                                <Col className="nomargin nopadding">
                                    <EditableDiv isTextArea={false} showEdit={showEdit} value={project.partner_name} changeValue={partnerName} setChangeValue={setPartnerName} cssClass={"project-details-title"} />
                                </Col>
                            </Row>

                            <EditableDiv isTextArea={false} showEdit={showEdit} value={project.partner_description} changeValue={partnerDescription} setChangeValue={setPartnerDescription} cssClass={"project-details-subtitle"} />
                            <div className={"project-details-title-info"}>About the project</div>
                            <EditableDiv isTextArea={true} cssClass={"project-details-big-subtitle"} showEdit={showEdit} value={project.description} changeValue={projectDescription} setChangeValue={setProjectDescription} />

                        </div>
                        <Row className="nomargin nopadding">
                            <Col className="nomargin nopadding">
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
                            { fullView ? 
                                <Col className="nomargin nopadding">
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
                                : null }
                            {fullView ? 
                                <Col className="nomargin nopadding">
                                    <div>
                                        <div className={"project-card-title"}>Assigned students</div>
                                        {(Object.values(project.participations).length) ?
                                            Object.values(project.participations).map(participation => (<ParticipationCard key={participation.student} participation={participation} project={project} />)) :
                                            <div className={"project-empty-list-col"}>Currently there are no assigned students</div>
                                        }
                                    </div>
                                </Col>
                            : null}
                        </Row>
                        {! fullView ? 
                            <Col className="nomargin nopadding">
                                <div>
                                    <div className={"project-card-title"}>Assigned students</div>
                                    {(Object.values(project.participations).length) ?
                                        Object.values(project.participations).map(participation => (<ParticipationCard key={participation.student} participation={participation} project={project} />)) :
                                        <div className={"project-empty-list-col"}>Currently there are no assigned students</div>
                                    }
                                </div>
                            </Col>
                            : null}
                    </div>
                </div>) : null}
            </Row>
            <ToastContainer />
        </div>
    )
}

export default Project;