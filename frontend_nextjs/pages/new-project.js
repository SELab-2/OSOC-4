import {Button, Card, Col, Form, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {log} from "../utils/logger";
import {useRouter} from "next/router";
import {getJson} from "../utils/json-requests";
import SelectSearch, {fuzzySearch} from "react-select-search";


export default function NewProjects() {
    const [projectName, setProjectName] = useState()
    const [partnerName, setPartnerName] = useState()
    const [partnerBio, setPartnerBio] = useState()
    const [projectBio, setProjectBio] = useState()
    const [briefing, setBriefing] = useState()

    const [tools, setTools] = useState()
    const [codeLanguages, setCodeLanguages] = useState()

    const [students, setStudents] = useState([{"skill":"", "amount":1}])

    const [skills, setSkills] = useState([])

    const router = useRouter()


    useEffect(() => {
        if (skills.length === 0) {
            getJson("/skills").then(async res => {
                log("load skills")
                log(res)
                if(res.data){
                    // scuffed way to get unique skills (should be fixed in backend soon)
                    let uniq = [...new Set(res.data.map(skill => skill.name))];
                    let array = [];
                    uniq.map(skill => array.push({"value":skill, "name":skill}));
                    setSkills(array);
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
        // TODO make this work with backend
    }


        return(
        <div>
            {/*TODO are you sure you want to leave any changes made on this page will be lost*/}
            <Button onClick={() => router.push("/projects")}>Go back to projects</Button>
            <h1>New project</h1>
            <Form onSubmit={handleSubmitChange}>
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
