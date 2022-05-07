import {Button, Card, Col, Form, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {api, Url} from "../utils/ApiClient";
import {log} from "../utils/logger";
import RequiredSkillSelector from "../Components/projects/RequiredSkillSelector";


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


    const router = useRouter()


    useEffect(() => {
        if (skills.length === 0) {
            Url.fromName(api.skills).get().then(async res => {
                if (res.success) {
                    res = res.data;
                    if(res){
                        // scuffed way to get unique skills (should be fixed in backend soon)
                        let array = [];
                        res.map(skill => array.push({"value":skill, "name":skill}));
                        setSkills(array);
                    }
                }
            })

        }
    }, [])



    function AddStudent(){
        // can't have more different type of students then amount of skills
        if (requiredSkills.length <= skills.length){
            setRequiredSkills(prevState => [...prevState, {"skill_name": "", "number": 1}])
        }
    }

    async function handleSubmitChange(event){
        event.preventDefault()
        // TODO check forms
        let body = {
            "name":projectName,
            "description":projectDescription,
            "required_skills": [],
            "partner_name":partnerName,
            "partner_description": partnerDescription,
            "edition": api.year,
            "users": []
        }
        log(body)
        // TODO add skills to project
        await Url.fromName(api.projects).extend("/create").setBody(body).post();
    }


        return(
        <div>
            <Button onClick={() => setShow(true)}>Go back to projects</Button>

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

            <h1>New project</h1>
            <Form onSubmit={handleSubmitChange}>
                <Form.Label>Project name:</Form.Label>
                <Form.Control type="text" value={projectName} placeholder={"Project name"} onChange={e => setProjectName(e.target.value)} />

                <Form.Label>Partner name:</Form.Label>
                <Form.Control type="text" value={partnerName} placeholder={"Partner name"} onChange={e => setPartnerName(e.target.value)} />

                <Form.Label>About partner:</Form.Label>
                <Form.Control as="textarea" rows={3} value={partnerDescription} placeholder={"Short bio about the partner, website, ..."} onChange={e => setPartnerDescription(e.target.value)} />

                <Form.Label>About project:</Form.Label>
                <Form.Control as="textarea" rows={3} value={projectDescription} placeholder={"Short explanation about the project, what it does, how it works, ..."} onChange={e => setProjectDescription(e.target.value)} />

                <Form.Label>Briefing:</Form.Label>
                <Form.Control as="textarea" rows={3} value={briefing} placeholder={"Link to the project page"} onChange={e => setBriefing(e.target.value)} />

                <h3>Resources</h3>

                <Form.Label>Tooling:</Form.Label>
                <Form.Control type="text" value={tools} placeholder={"What tools will be used in the project"} onChange={e => setTools(e.target.value)} />

                <Form.Label>Code languages:</Form.Label>
                <Form.Control type="text" value={codeLanguages} placeholder={"What code languages will be used in the project"} onChange={e => setCodeLanguages(e.target.value)} />

                <Form.Label>Required skills:</Form.Label>

                {(requiredSkills.length) ? (requiredSkills.map((requiredSkill,index) => (
                    <RequiredSkillSelector className={"required-skill-selector-row"} key={index} requiredSkill={requiredSkill} setRequiredSkills={setRequiredSkills} index={index} requiredSkills={requiredSkills} skills={skills}/>
                ))) : null}

                <Button onClick={AddStudent}> Add extra student role</Button>
                <Button type="submit">Create new project</Button>
            </Form>

        </div>
    )
}
