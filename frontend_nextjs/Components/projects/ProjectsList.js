import React, {useEffect, useState} from "react";
import {log} from "../../utils/logger";
import {Button, Col, Container, Form, Row, Table} from "react-bootstrap";
import {useRouter} from "next/router";
import {api, Url} from "../../utils/ApiClient";
import ProjectCard from "./ProjectCard";
import ConflictCard from "./ConflictCard";

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
    const [me, setMe] = useState(undefined)
    const router = useRouter()

    /**
     * Gets called once after mounting the Component and gets all the projects
     */
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
     * Gets called once after mounting the Component and gets the currently logged in user
     */
    useEffect(() => {
        Url.fromName(api.me).get().then(res => {
            if (res.success) {
                setMe(res.data.data);
            }
        });
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
            return project.name.toLowerCase().includes(search.toLowerCase())
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
        <Col className="fill_height fill_width projects-positioning">
            <Row className="nomargin" style={{ marginBottom: "12px"}}>
                <Col>
                    <Form onSubmit={handleSearchSubmit}>
                        <Form.Group controlId="searchProjects">
                            <Form.Control type="text" value={search} placeholder={"Search projects"} onChange={e => handleSearch(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Col>
                <Col xs="auto" className={"project-people-needed"}>
                    <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded}/>
                </Col >
                <Col xs="auto" >
                    <ConflictCard />
                </Col>
                { me !== undefined && me.role === 2 ?
                    <Col xs="auto" >
                        <Button className={"center"} onClick={handleNewProject}>New project</Button>
                    </Col> : null
                }

            </Row>
            <Row className="nomargin scroll-overflow" style={{"height": "calc(100vh - 155px)"}}>
                    {
                        visibleProjects.length ? (visibleProjects.map((project, index) => (<ProjectCard key={index} project={project} selectedProject={props.selectedProject} setSelectedProject={props.setSelectedProject}/>))) : null
                    }
            </Row>
        </Col>
    )
}
