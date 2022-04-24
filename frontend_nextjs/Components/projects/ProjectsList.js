import React, {useEffect, useState} from "react";
import {log} from "../../utils/logger";
import {Button, Col, Container, Form, Row, Table} from "react-bootstrap";
import {useRouter} from "next/router";
import {api, Url} from "../../utils/ApiClient";
import ProjectCard from "./ProjectCard";
import ConflictCard from "./ConflictCard";
import InfiniteScroll from "react-infinite-scroll-component";
import AddStudentModal from "./AddStudentModal";

export default function ProjectsList(props) {
    const [allProjects, setAllProjects] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [search, handleSearch] = useState("");
    const [peopleNeeded, setPeopleNeeded] = useState(false);
    const [visibleProjects, setVisibleProjects] = useState([]);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const router = useRouter()

    useEffect(() => {
        if (! allProjects.length && ! loaded) {
            Url.fromName(api.edition_projects).get().then(res => {
                if (res.success) {
                    const projects = res.data;
                    for (let p of projects) {
                        Url.fromUrl(p).get().then(async project => {
                            if (project.success) {
                                log(project.data)
                                if (project.data) {
                                    log(project.data.users)
                                    await setAllProjects(prevState => [...prevState, project.data]);
                                    // TODO clean this up (currently only works if updated here
                                    await setVisibleProjects(prevState => [...prevState, project.data]);
                                }
                            }
                        });
                    }
                    setLoaded(true);
                }
            })
        }
    }, [])

    async function handleSearchSubmit(event) {
        event.preventDefault();
        setVisibleProjects(allProjects.filter((project) => project.name.includes(search)))
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
        <div className={"project-top-bar"}>
            <Row className="nomargin">
                <Col>
                    {/*todo error als er geen selected student en of project is of als de student geen skills heeft*/}
                    <Button onClick={() => setShowAddStudent(true)}> Add student to project</Button>
                    <AddStudentModal selectedProject={props.selectedProject} selectedStudent={props.selectedStudent} setShowAddStudent={setShowAddStudent} showAddStudent={showAddStudent} />
                </Col>
                <Col xs="auto" >
                    <ConflictCard/>
                </Col>
                <Col xs="auto" >
                    <Button className={"center"} onClick={handleNewProject}>New project</Button>
                </Col>
            </Row>
            <br/>
            <Row className="nomargin">
                <Col>
                    <Form onSubmit={handleSearchSubmit}>
                        <Form.Group controlId="searchProjects">
                            <Form.Control type="text" value={search} placeholder={"Search project by name"} onChange={e => handleSearch(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col xs="auto" className={"project-people-needed"}>
                    <Form>
                        <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded}/>
                    </Form>
                </Col >
            </Row>
            <Row>
                    {
                        visibleProjects.length ? (visibleProjects.map((project, index) => (<ProjectCard selectedProject={props.selectedProject} setSelectedProject={props.setSelectedProject} key={index} project={project}/>))) : null
                    }
            </Row>
        </div>
    )
}
