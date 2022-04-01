import React, {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import {log} from "../utils/logger";
import ProjectCard from "../Components/ProjectCard";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {router} from "next/client";
import {useRouter} from "next/router";

export default function Projects(props) {
    const [projects, setProjects] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [search, handleSearch] = useState("")
    const [peopleNeeded, setPeopleNeeded] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (!projects.length) {
            getJson("/projects").then(res => {
                log("load project")
                log(res)
                for (let p of res.data) {
                    getJson(p.id).then(async project => {
                        if (project.data) {await setProjects(prevState => [...prevState, project.data]);}
                    })
                }
                setLoaded(true)
            });
        }
    })

    async function handleSearchSubmit(event) {
        event.preventDefault();
    }

    async function changePeopleNeeded(event){
        event.preventDefault()
        log(peopleNeeded)
        setPeopleNeeded(prevState => ! prevState)
    }

    const handleNewProject = () => {
        log("navigate to new project")
        router.push("/new-project")
    }

    return(
        <div>
            <Row>
                <Col>
                    <Form onSubmit={handleSearchSubmit}>
                        <Form.Group controlId="searchProjects">
                            <Form.Control type="text" value={search} placeholder={"Search project by name"} onChange={handleSearch} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col>
                    <Card>
                        2 conflicts
                    </Card>
                </Col>
                <Col>
                    <Button onClick={handleNewProject}>New project</Button>
                </Col>
                <Col>
                    <Form>
                        <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded}/>
                    </Form>
                </Col>
            </Row>
            <div>
                {
                    loaded ? (projects.map((project, index) => (<ProjectCard key={index} project={project}/>))) : null
                }
            </div>
        </div>
    )
}
