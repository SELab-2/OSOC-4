import {Button, Card, Col, Form, Modal, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {log} from "../utils/logger";
import {useRouter} from "next/router";
import SelectSearch, {fuzzySearch} from "react-select-search";
import {api, Url} from "../utils/ApiClient";


export default function NewProjects() {
    const [projectName, setProjectName] = useState("")
    const [partnerName, setPartnerName] = useState("")
    const [partnerDescription, setPartnerDescription] = useState("")
    const [projectDescription, setProjectDescription] = useState("")
    const [briefing, setBriefing] = useState("")

    const [tools, setTools] = useState("")
    const [codeLanguages, setCodeLanguages] = useState("")

    const [students, setStudents] = useState([{"skill":"", "amount":1}])

    const [skills, setSkills] = useState([])
    const [show, setShow] = useState(false);


    const router = useRouter()


    useEffect(() => {
        if (skills.length === 0) {
            Url.fromName(api.skills).get().then(async res => {
                if (res.success) {
                    res = res.data;
                    log("load skills")
                    log(res)
                    if(res){
                        // scuffed way to get unique skills (should be fixed in backend soon)
                        let array = [];
                        res.map(skill => array.push({"value":skill, "name":skill}));
                        setSkills(array);
                    }
                }
            })

        }
    })

    async function DeleteStudent(index) {
        log("delete student")
        if (students.length > 1) {
            await setStudents(students.filter((_, i) => i !== index))
        }
        log(students)
    }

    function changeSkillStudent(index, value){
        let newArr = [...students]
        newArr[index].skill = value
        setStudents(newArr)
    }

    function AddToStudent(index, amount){
        if (0 < (students[index].amount + amount) &&  (students[index].amount + amount) < 100){
            let newArr = [...students]
            newArr[index]["amount"] += amount
            setStudents(newArr)
        }
    }

    function AddStudent(){
        // can't have more different type of students then amount of skills
        if (students.length <= skills.length){
            setStudents(prevState => [...prevState, {"skill": "", "amount": 1}])
        }
    }

    async function handleSubmitChange(event){
        event.preventDefault()
        log("Creating new project")
        let edition = await api.getCurrentYear();
        // TODO check forms
        let body = {
            "name":projectName,
            "description":projectDescription,
            "partner_name":partnerName,
            "partner_description": partnerDescription,
            "goals": "",
            "edition": edition
        }
        // TODO add skills to project
        await Url.fromName(api.edition_projects).extend("projects/create").setBody(body).post();
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

                <Form.Label>Students:</Form.Label>

                {(students.length) ? (students.map((student,index) => (
                    <Row key={index}>
                        <Col>

                            <SelectSearch
                                options={skills}
                                value={student.skill}
                                search
                                filterOptions={fuzzySearch}
                                onChange={value => changeSkillStudent(index, value)}
                                emptyMessage={() => <div style={{ textAlign: 'center', fontSize: '0.8em' }}>Skill not found</div>}
                                placeholder="Select the required skill"
                            />

                        </Col>
                        <Col>
                            <Card>
                                <Row>
                                    <Col>
                                        {student.amount}
                                    </Col>
                                    <Col>
                                        <p onClick={() => AddToStudent(index, 1)}>+</p>
                                        <p onClick={() => AddToStudent(index, -1)}>-</p>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col>
                            <Button onClick={() => DeleteStudent(index)}>Remove student role</Button>
                        </Col>
                    </Row>
                ))) : null}

                <Button onClick={AddStudent}> Add extra student role</Button>
                <Button type="submit">Create new project</Button>
            </Form>

        </div>
    )
}
