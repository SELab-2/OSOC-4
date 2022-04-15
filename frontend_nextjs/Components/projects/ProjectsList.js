import React, {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {useRouter} from "next/router";
import {urlManager} from "../../utils/ApiClient";
import ProjectCard from "./ProjectCard";
import ConflictCard from "./ConflictCard";

export default function ProjectsList(props) {
    const [allProjects, setAllProjects] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [search, handleSearch] = useState("")
    const [peopleNeeded, setPeopleNeeded] = useState(false)
    const [visibleProjects, setVisibleProjects] = useState([])
    const router = useRouter()

    useEffect(() => {
        if (! allProjects.length && ! loaded) {
            urlManager.getProjects().then(async projects_url => {
                let projects = await getJson(projects_url)
                log("load project")
                log(projects)
                for (let p of projects) {
                    log(p)
                    getJson(p).then(async project => {
                        log(project)
                        if (project) {
                            await setAllProjects(prevState => [...prevState, project]);
                            // TODO clean this up (currently only works if updated here
                            await setVisibleProjects(prevState => [...prevState, project]);
                        }
                    })
                }
                setLoaded(true)
            })
        }
    })

    async function handleSearchSubmit(event) {
        event.preventDefault();
        setVisibleProjects(allProjects.filter((project) => project.name.includes(search)))
        log("SUBMIT")
    }

    async function changePeopleNeeded(event){
        log(peopleNeeded)
        setPeopleNeeded(event.target.checked)
        log(peopleNeeded)

    }

    const handleNewProject = () => {
        log("navigate to new project")
        router.push("/new-project")
    }

    return(
        <Container>
            <div className={"right-div"}>
                <Row md="auto" >
                    <Col md="auto"  className={"center-component"}>
                        <ConflictCard/>
                    </Col>
                    <Col md="auto"  className={"center-component"}>
                        <Button className={"center"} onClick={handleNewProject}>New project</Button>
                    </Col>
                </Row>
            </div>
            <Row>
                <Col>
                    <Form onSubmit={handleSearchSubmit}>
                        <Form.Group controlId="searchProjects">
                            <Form.Control type="text" value={search} placeholder={"Search project by name"} onChange={e => handleSearch(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col>
                    <Form>
                        <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded}/>
                    </Form>
                </Col>
            </Row>

            <div>
                {
                    visibleProjects.length ? (visibleProjects.map((project, index) => (<ProjectCard key={index} project={project}/>))) : null
                }
            </div>
        </Container>
    )
}
