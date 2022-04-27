import React, {useEffect, useState} from "react";
import {log} from "../../utils/logger";
import {Button, Col, Container, Form, Row, Table} from "react-bootstrap";
import {useRouter} from "next/router";
import {api, Url} from "../../utils/ApiClient";
import ProjectCard from "./ProjectCard";
import ConflictCard from "./ConflictCard";
import InfiniteScroll from "react-infinite-scroll-component";

/**
 * Lists all of the projects that a user is allowed to view.
 * @param props selectedProject the currently selected project in the project tab,
 * setSelectedProject the setter for the currently selected project in the project tab.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ProjectsList(props) {
    const [allProjects, setAllProjects] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [search, handleSearch] = useState("")
    const [peopleNeeded, setPeopleNeeded] = useState(false)
    const [visibleProjects, setVisibleProjects] = useState([])
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
                                    await setVisibleProjects(prevState => [...prevState, project.data])
                                }
                            }
                        });
                    }
                    changeVisibleProjects()
                    setLoaded(true);
                }
            })


        }
    }, [])

    /**
     * Applies the search filter and "people needed" (only projects who have required skills)
     */
    function changeVisibleProjects(){
        log("change projects")
        log(peopleNeeded)
        setVisibleProjects(allProjects.filter(project => {
            let sum = 0;
            if(! peopleNeeded){
                project.required_skills.forEach(skill => {
                    log(skill);
                    sum += skill.number});
            }
            return project.name.includes(search)
                && ((peopleNeeded) || sum > project.participations.length);
        }))
    }

    /**
     * changes the current search value
     * @param event
     * @returns {Promise<void>}
     */
    async function handleSearchSubmit(event) {
        event.preventDefault();
        changeVisibleProjects()
    }

    /**
     * changes the value of peopleNeeded
     * @param event
     * @returns {Promise<void>}
     */
    async function changePeopleNeeded(event){
        setPeopleNeeded(event.target.checked)
        changeVisibleProjects()
    }

    /**
     * navigate to the new-project tab
     */
    const handleNewProject = () => {
        log("navigate to new project")
        router.push("/new-project")
    }

    return(
        <Col className="fill_height scroll-overflow fill_width">
            <div className={"project-top-bar"}>
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
                        <Col xs="auto" >
                            <ConflictCard />
                        </Col>
                        <Col xs="auto" >
                            <Button className={"center"} onClick={handleNewProject}>New project</Button>
                        </Col>
                    </Row>
                    <Row className="nomargin">
                            {
                                visibleProjects.length ? (visibleProjects.map((project, index) => (<ProjectCard key={index} project={project} selectedProject={props.selectedProject} setSelectedProject={props.setSelectedProject}/>))) : null
                            }
                    </Row>
                </div>
        </Col>
    )
}
