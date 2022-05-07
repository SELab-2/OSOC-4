import {Button, Form, Modal, Row, Col} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {api, Url} from "../utils/ApiClient";
import {log} from "../utils/logger";
import RequiredSkillSelector from "../Components/projects/RequiredSkillSelector";
import back from "/public/assets/back.svg";
import Hint from "../Components/Hint";
import Image from 'next/image';
import plus from "/public/assets/plus.svg";


export default function NewProjects() {
    const [projectName, setProjectName] = useState("")
    const [partnerName, setPartnerName] = useState("")
    const [partnerDescription, setPartnerDescription] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [briefing, setBriefing] = useState("")

    const [tools, setTools] = useState("")
    const [codeLanguages, setCodeLanguages] = useState("")

    const [requiredSkills, setRequiredSkills] = useState([{"skill_name":"", "number":1}])

    const [skills, setSkills] = useState([])
    const [show, setShow] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([])
    const [users, setUsers] = useState([])


    const router = useRouter()

    useEffect(() => {
        Url.fromName(api.skills).get().then(async res => {
            if (res.success) {
                res = res.data;
                if(res){
                    // scuffed way to get unique skills (should be fixed in backend soon)
                    let array = [];
                    res.map(skill => array.push({"value":skill, "label":skill}));
                    setSkills(array);
                    setAvailableSkills(res)
                }
            }
        })
    }, [])

    /**
     * Gets called after successfully removing a user from a project.
     * @param index
     * @returns {Promise<void>}
     */
    async function deleteUser(index){
        await setUsers(users.filter((_, i) => i !== index))
    }

    function addUser(){
    }

    function addRequiredSkill(){
        setRequiredSkills(prevState => [...prevState, {"number": 1, "skill_name": ""}])
    }

    function changeRequiredSkill(value, index){
        log("change skill")
        if(requiredSkills[index].label !== ""){
            log([...(availableSkills.filter(skill => skill !== value.label)), requiredSkills[index].label])
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label)), requiredSkills[index].label])
        } else {
            log( [...(availableSkills.filter(skill => skill !== value.label))])
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label))])
        }
        let newArray = [...requiredSkills]
        newArray[index]["skill_name"] = value.value
        setRequiredSkills(newArray)
    }

    async function handleSubmitChange(event){
        event.preventDefault()
        // TODO check forms
        let body = {
            "name":projectName,
            "description":projectDescription,
            "required_skills": requiredSkills,
            "partner_name":partnerName,
            "partner_description": partnerDescription,
            "edition": api.year,
            "users": []
        }
        log(requiredSkills)
        let res = await Url.fromName(api.projects).extend("/create").setBody(body).post();
        if(res.success){
            router.push("/projects")
        }
    }


        return(
        <div>
            <Row className={"project-top-bar nomargin"}>
                <Col xs={"auto"}>
                    <Hint message="Go back" placement="top">
                        <Image alt={"back button"} onClick={() => setShow(true)} src={back} width={100} height={33}/>
                    </Hint>

                    <Modal show={show} onHide={() => setShow(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Leave page?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Doing so will lose all your current progress.</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => {
                                setShow(false)
                                router.push("/projects")
                            }}>
                                Leave page
                            </Button>
                            <Button variant="primary" onClick={() => setShow(false)}>
                                Stay on page
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>

                <Col>
                    <div className={"project-details-project-title"}>New project</div>
                </Col>
            </Row>
            <div className={"project-details-page"}>
                <Form onSubmit={handleSubmitChange}>
                    <Form.Label>Project name:</Form.Label>
                    <Form.Control type="text" value={projectName} placeholder={"Project name"} onChange={e => setProjectName(e.target.value)} />

                    <Form.Label>Partner name:</Form.Label>
                    <Form.Control type="text" value={partnerName} placeholder={"Partner name"} onChange={e => setPartnerName(e.target.value)} />

                    <Form.Label>About partner:</Form.Label>
                    <Form.Control as="textarea" rows={3} value={partnerDescription} placeholder={"Short bio about the partner, website, ..."} onChange={e => setPartnerDescription(e.target.value)} />

                    <Form.Label>About project:</Form.Label>
                    <Form.Control as="textarea" rows={3} value={projectDescription} placeholder={"Short explanation about the project, what it does, how it works, ..."} onChange={e => setProjectDescription(e.target.value)} />
                    <Row>
                        <Col>
                            <Form.Label>Required skills:</Form.Label>

                            {(requiredSkills.length) ? (requiredSkills.map((requiredSkill, index) => (
                                <RequiredSkillSelector className={"required-skill-selector-row"}
                                                       availableSkills={availableSkills} changeRequiredSkill={changeRequiredSkill}
                                                       key={index} index={index} skills={skills} requiredSkill={requiredSkill}
                                                       setRequiredSkills={setRequiredSkills} requiredSkills={requiredSkills}
                                />
                            ))) : null}

                            <Hint message={"Add new required skill"} placement="top">
                                <div className={"project-details-plus-skill"} >
                                    <Image width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={() => addRequiredSkill()} />
                                </div>
                            </Hint>
                        </Col>
                        <Col>
                            <Form.Label>Users:</Form.Label>
                            <div className={"project-details-user-div"}>
                                {(users.length) ?
                                    users.map((item, index) => (<AdminCard key={item} showEdit={showEdit} index={index} deleteUser={deleteUser} user={item}/>))
                                    :
                                    <div className={"project-empty-list"}>Currently there are no assigned staff</div> }
                            </div>
                            <Hint message={"Add new coach / admin to the project"} >
                                <div className={"project-details-plus-user"}>
                                    <Image  width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={() => addUser()} />
                                </div>
                            </Hint>
                        </Col>
                    </Row>


                    <div>
                        <Button type="submit">Create new project</Button>

                    </div>
                </Form>
            </div>
        </div>
    )
}
