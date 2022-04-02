import {Button, Card, Col, Dropdown, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {log} from "../utils/logger";
import {useRouter} from "next/router";
import {getJson} from "../utils/json-requests";


export default function NewProjects(props) {
    const [projectName, setProjectName] = useState()
    const [partnerName, setPartnerName] = useState()
    const [partnerBio, setPartnerBio] = useState()
    const [projectBio, setProjectBio] = useState()
    const [briefing, setBriefing] = useState()

    const [tools, setTools] = useState()
    const [codeLanguages, setCodeLanguages] = useState()

    const [students, setStudents] = useState([{"role":"Role", "amount":1}])

    const router = useRouter()

    const [skills, setSkills] = useState([])

    useEffect(() => {
        if (skills.length === 0) {
            getJson("/skills").then(async res => {
                log("load skills")
                log(res)
                if(res.data){
                    setSkills(res.data)
                }
            })
        }
    })

    // TODO get roles from backend get all possible roles
    // const skills = [{"name":"Frontend", "id": "123"}, {"name":"Backend", "id": "456"}, {"name":"Manager", "id": "789"}]

    function DeleteStudent(index){
        if(students.length > 0){
            setStudents(prevState => prevState.filter((_ , i) => i !== index))
        }
    }

    function changeRoleStudent(index, role){
        let newArr = [...students]
        log(newArr)
        log(newArr[index])
        log(index)
        newArr[index].role = role.name
        setStudents(newArr)
    }

    function AddToStudent(index, amount){
        if (0 < students[index].amount + amount < 99){
            let newArr = [...students]
            newArr[index]["amount"] += amount
            setStudents(newArr)
        }
    }

    function AddStudent(){
        setStudents(prevState => [...prevState, {"role":"Role", "amount": 1}])
    }

    return(
        <div>
            <Button onClick={() => router.push("/projects")}>Go back to projects</Button>
            <h1>New project</h1>
            <Form>
                <Form.Label>Project name:</Form.Label>
                <Form.Control type="text" value={projectName} placeholder={"Project name"} onChange={e => setProjectName(e.target.value)} />

                <Form.Label>Partner name:</Form.Label>
                <Form.Control type="text" value={partnerName} placeholder={"Partner name"} onChange={e => setPartnerName(e.target.value)} />

                <Form.Label>About partner:</Form.Label>
                <Form.Control as="textarea" rows={3} value={partnerBio} placeholder={"Short bio about the partner, website, ..."} onChange={e => setPartnerBio(e.target.value)} />

                <Form.Label>About project:</Form.Label>
                <Form.Control as="textarea" rows={3} value={projectBio} placeholder={"Short explanation about the project, what it does, how it works, ..."} onChange={e => setProjectBio(e.target.value)} />

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
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                    {student.role}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {(skills.length) ? (skills.map((role, i) => (
                                        <Dropdown.Item  onClick={() => changeRoleStudent(index, role)} key={role.id} value={role.name}>{role.name}</Dropdown.Item>
                                    ))) : null}
                                </Dropdown.Menu>
                            </Dropdown>
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
            </Form>

        </div>
    )
}
