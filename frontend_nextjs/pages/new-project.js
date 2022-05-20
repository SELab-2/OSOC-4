import {Button, Form, Modal, Row, Col, Alert} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {api, Url} from "../utils/ApiClient";
import RequiredSkillSelector from "../Components/projects/RequiredSkillSelector";
import back from "/public/assets/back.svg";
import Hint from "../Components/Hint";
import Image from 'next/image';
import plus from "/public/assets/plus.svg";
import { checkProjectBody} from "../utils/inputchecker"
import { ToastContainer, toast } from 'react-toastify';


export default function NewProjects() {
    const [projectName, setProjectName] = useState("")
    const [partnerName, setPartnerName] = useState("")
    const [partnerDescription, setPartnerDescription] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [requiredSkills, setRequiredSkills] = useState([{"skill_name":"", "number":1}])
    const [skills, setSkills] = useState([])
    const [show, setShow] = useState(false);
    const [availableSkills, setAvailableSkills] = useState([])

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


    function addRequiredSkill(){
        event.preventDefault()
        setRequiredSkills(prevState => [...prevState, {"number": 1, "skill_name": ""}])
    }

    function changeRequiredSkill(value, index){
        if(requiredSkills[index].label !== ""){
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label)), requiredSkills[index].label])
        } else {
            setAvailableSkills(prevState => [...(prevState.filter(skill => skill !== value.label))])
        }
        let newArray = [...requiredSkills]
        newArray[index]["skill_name"] = value.value
        setRequiredSkills(newArray)
    }

    async function handleSubmitChange(event){
        event.preventDefault()
        let body = {
            "name":projectName,
            "description":projectDescription,
            "required_skills": requiredSkills,
            "partner_name":partnerName,
            "partner_description": partnerDescription,
            "edition": api.getYear()
        }
        let response = checkProjectBody(body)
        if(response.correct){
            let res = await Url.fromName(api.projects).extend("/create").setBody(body).post();
            if(res.success){
                router.push("/projects")
                toast.done("Project created succesfully!")
            } else {
                toast.error("Could not create new project")
            }
        }  else {
            toast.error("You have given an incorrect " + response.problem)
        }

    }


        return(
        <div className={"add-project-body"}>
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
                    <h5 className={"add-project-label"}>Project name:</h5>
                    <Form.Control type="text" value={projectName} placeholder={"Project name"} onChange={e => setProjectName(e.target.value)} />

                    <h5 className={"add-project-label"}>Partner name:</h5>
                    <Form.Control type="text" value={partnerName} placeholder={"Partner name"} onChange={e => setPartnerName(e.target.value)} />

                    <h5 className={"add-project-label"}>About partner:</h5>
                    <Form.Control as="textarea" rows={3} value={partnerDescription} placeholder={"Short bio about the partner, website, ..."} onChange={e => setPartnerDescription(e.target.value)} />

                    <h5 className={"add-project-label"}>About project:</h5>
                    <Form.Control as="textarea" rows={3} value={projectDescription} placeholder={"Short explanation about the project, what it does, how it works, ..."} onChange={e => setProjectDescription(e.target.value)} />
                    <Row>
                        <Col>
                            <h5 className={"add-project-label"}>Required skills:</h5>

                            {(requiredSkills.length) ? (requiredSkills.map((requiredSkill, index) => (
                                <RequiredSkillSelector className={"add-project-required-skill-selector-row"}
                                                       availableSkills={availableSkills} setAvailableSkills={setAvailableSkills}
                                                       changeRequiredSkill={changeRequiredSkill} key={index}
                                                       index={index} skills={skills} requiredSkill={requiredSkill}
                                                       setRequiredSkills={setRequiredSkills} requiredSkills={requiredSkills}
                                />
                            ))) : null}

                            <Hint message={"Add new required skill"} placement="top">
                                <div className={"project-details-plus-skill"} >
                                    <Image width={33} height={33} alt={"Add new coach / admin to the project"} src={plus} onClick={(e) => addRequiredSkill(e)} />
                                </div>
                            </Hint>
                        </Col>
                    </Row>


                    <div>
                        <Button type="submit">Create new project</Button>

                    </div>
                </Form>
            </div>
            <ToastContainer />
        </div>
    )
}
