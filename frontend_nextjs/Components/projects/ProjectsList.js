import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import { api, Url } from "../../utils/ApiClient";
import ProjectCard from "./ProjectCard";
import ConflictCard from "./ConflictCard";
import { useWebsocketContext } from "../WebsocketProvider"

/**
 * Lists all the projects that a user is allowed to view.
 * @param props selectedProject the currently selected project in the project tab,
 * setSelectedProject the setter for the currently selected project in the project tab.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ProjectsList(props) {
    const [allProjects, setAllProjects] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [search, setSearch] = useState("");
    const [peopleNeeded, setPeopleNeeded] = useState(false);
    const [visibleProjects, setVisibleProjects] = useState([]);
    const [me, setMe] = useState(undefined);
    const [conflicts, setConflicts] = useState([]);

    const router = useRouter()

    const { websocketConn } = useWebsocketContext();

    /**
     * Gets called once after mounting the Component and gets all the projects
     */
    useEffect(() => {
        if (!allProjects.length && !loaded) {
            Url.fromName(api.edition_projects).get().then(res => {
                if (res.success) {
                    const projects = res.data;
                    for (let p of projects) {
                        Url.fromUrl(p).get().then(async project => {
                            if (project.success) {
                                if (project.data) {
                                    setAllProjects(prevState => [...prevState, project.data]);
                                    // TODO clean this up (currently only works if updated here
                                    setVisibleProjects(prevState => [...prevState, project.data])
                                }
                            }
                        });
                    }
                    setLoaded(true);
                }
            })


        }
    }, [])

    /**
     * Gets called once after mounting the Component and gets the currently logged-in user
     */
    useEffect(() => {
        Url.fromName(api.me).get().then(res => {
            if (res.success) {
                setMe(res.data.data);
            }
        });
    }, [])

    /**
     * It sets the conflicts state.
     */
    useEffect(() => {
        Url.fromName(api.current_edition).extend("/resolving_conflicts").get().then(res => {
            if (res.success) {
                setConflicts(res.data);
            }
        });
    }, [allProjects]);

    /**
     * This useEffect adds an eventListener in order to call updateDetailsFromWebsocket when the data has changed.
     */
    useEffect(() => {

        if (websocketConn) {
            websocketConn.addEventListener("message", updateDetailsFromWebsocket)

            return () => {
                websocketConn.removeEventListener('message', updateDetailsFromWebsocket)
            }
        }

    }, [websocketConn, visibleProjects, allProjects, router.query])

    /**
     * This function is called when the data has changed. The function will determine which type of data has changed
     * and change the state of the application accordingly.
     * @param event the event parameter contains the changed data.
     */
    const updateDetailsFromWebsocket = (event) => {
        let data = JSON.parse(event.data)

        // A participation has changed
        if ("participation" in data) {
            const studentid = parseInt(data["studentId"])
            const projectid = parseInt(data["projectId"])

            visibleProjects.find((p, i) => {
                if (p["id_int"] === projectid) {
                    let new_projects = [...visibleProjects]
                    new_projects[i]["participations"][studentid] = data["participation"]
                    new_projects[i] = { ...new_projects[i] }
                    setVisibleProjects([...new_projects])
                }
            })
            allProjects.find((p, i) => {
                if (p["id_int"] === projectid) {
                    let new_projects = [...allProjects]
                    new_projects[i]["participations"][studentid] = data["participation"]
                    new_projects[i] = { ...new_projects[i] }
                    setAllProjects([...new_projects])
                    return true; // stop searching
                }
            })

        // A participation has been deleted
        } else if ("deleted_participation" in data) {
            const studentid = parseInt(data["studentId"])
            const projectid = parseInt(data["projectId"])

            visibleProjects.find((p, i) => {
                if (p["id_int"] === projectid) {
                    let new_projects = [...visibleProjects]
                    delete new_projects[i]["participations"][studentid]
                    new_projects[i] = { ...new_projects[i] }
                    setVisibleProjects([...new_projects])
                }
            })
            allProjects.find((p, i) => {
                if (p["id_int"] === projectid) {
                    let new_projects = [...allProjects]
                    delete new_projects[i]["participations"][studentid]
                    new_projects[i] = { ...new_projects[i] }
                    setAllProjects([...new_projects])
                    return true; // stop searching
                }
            })

        // A project has been deleted.
        } else if ("deleted_project" in data) {
            const projectid = data["deleted_project"];

            let new_projects = visibleProjects.filter((p, i) => {
                return p.id !== projectid
            })
            setVisibleProjects([...new_projects])

            new_projects = allProjects.filter((p, i) => {
                return p.id !== projectid
            })
            setAllProjects([...new_projects])
        }
    }

    /**
     * Applies the search filter and "people needed" (only projects who have required skills)
     */
    function changeVisibleProjects(newPeopleNeeded, newSearch) {
        props.setSelectedProject(undefined); // clear the selected project when the list changes
        setVisibleProjects(allProjects.filter(project => {
            let showProj = true;

            if (newPeopleNeeded) { // only show projects with people needed
                let checkSkills = {} // all the required skills
                project.required_skills.forEach(s => checkSkills[s.skill_name] = s.number);
                Object.values(project.participations).forEach(part => {  // if there is a participation for that skill, diminish the required amount by one
                    checkSkills[part.skill] -= 1;
                });
                showProj = Object.values(checkSkills).filter(number => number > 0).length > 0  // the list of still required skills is greater than 0

            }
            return project.name.toLowerCase().includes(newSearch.toLowerCase())
                && (
                    (!newPeopleNeeded)                                                         // don't check people needed
                    || (newPeopleNeeded && showProj)   // check people needed
                );
        }));
    }


    /**
     * This function handles the changes to the search bar.
     * @param event The event of changing the search bar.
     * @returns {Promise<void>}
     */
    async function handleSearch(event) {
        event.preventDefault();
        setSearch(event.target.value);
        changeVisibleProjects(peopleNeeded, event.target.value);
    }

    /**
     * changes the value of peopleNeeded
     * @param event The event of the change of the peopleNeeded checkbox.
     * @returns {Promise<void>}
     */
    async function changePeopleNeeded(event) {
        setPeopleNeeded(event.target.checked);
        changeVisibleProjects(event.target.checked, search);
    }

    /**
     * navigate to the new-project tab
     */
    const handleNewProject = () => {
        router.push("/new-project")
    }

    /**
     * The html of the ProjectList component.
     */
    return (
        <Col className="fill_height fill_width">
            {props.fullView ?
            <Row className="center-content projects-controls">
                <Col className="search-project">
                    <input type="text" value={search}
                        placeholder={"Search projects"}
                        onChange={e => handleSearch(e)} />

                </Col>
                <Col xs="auto">
                    <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded} />
                </Col >
                <Col xs="auto" >
                    <ConflictCard conflicts={conflicts} />
                </Col>
                {me !== undefined && me.role === 2 ?
                    <Col xs="auto" >
                        <Button className={"center"} onClick={handleNewProject}>New project</Button>
                    </Col> : null
                }

            </Row>
             :
            <div className="projectlist-top-bar-repsonsive">
                <Row className="center-content projects-controls">
                    <Col className="search-project" >
                        <input className="search-project"  type="text" value={search}
                            placeholder={"Search projects"}
                            onChange={e => handleSearch(e)} />

                    </Col>
                </Row>
                <div className="center-content">
                    <Form.Check type={"checkbox"} label={"People needed"} id={"checkbox"} checked={peopleNeeded} onChange={changePeopleNeeded} />
                </div>
                
                <Row className="center-content">
                    <Col xs="auto" >
                        <ConflictCard conflicts={conflicts} />
                    </Col>
                    {me !== undefined && me.role === 2 ?
                        <Col xs="auto" >
                            <Button className={"center"} onClick={handleNewProject}>New project</Button>
                        </Col> : null
                    }

                </Row>
            </div>
             }
            
            

            <Row className="nomargin scroll-overflow" style={{ "height": "calc(100vh - 137px)" }}>
                {
                    visibleProjects.length ? (visibleProjects.map((project, index) => (<ProjectCard project={project} selectedProject={props.selectedProject} setSelectedProject={props.setSelectedProject} />))) : null
                }
            </Row>
        </Col>
    )
}
