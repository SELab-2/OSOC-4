import React, {useState} from "react";
import {Col, Row, Button} from "react-bootstrap";
import Image from 'next/image'
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/students/StudentListAndFilters";
import matchIcon from "/public/assets/arrow-right-svgrepo-com.svg"
import AddStudentModal from "../Components/projects/AddStudentModal";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/students/StudentsFilters";
import Hint from "../Components/Hint";
import {useEffect} from "react";

/**
 * The page corresponding with the 'projects' tab
 * @returns {JSX.Element} the component that renders the 'projects' tab.
 * @constructor
 */
export default function Projects() {

    const [selectedProject, setSelectedProject] = useState(undefined);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showAddStudent, setShowAddStudent] = useState(false)
    const [fullView, setFullView] = useState(false);
    const [showProject, setShowProject] = useState(false);

    const {height, width} = useWindowDimensions();

    /**
     * This useEffect sets the fullView state variable depending on the screens width.
     */
    useEffect(() => {
        setFullView(width > 1500);
    }, [width]);

    /**
     * Return the html of the projects page.
     */
    return (
        <>
            {width <= 800 ?
            <>
                <div className="project-top-bar-responsive">
                    <Row className="nomargin">
                        <Button className="filter-btn" onClick={() => setShowProject(prevstate => !prevstate)}>
                            {showProject ? 
                                <span>Show Students</span>
                                :
                                <span>Show Projects</span>
                            }
                        </Button>
                    </Row>
                    <div className="center-content">
                        <Hint message="Add the selected student(s) to the selected project">
                            <Image onClick={() => setShowAddStudent(true)} src={matchIcon} alt="match student to project"
                                width={60} height={60}/>
                        </Hint>
                        <AddStudentModal selectedProject={selectedProject} selectedStudent={selectedStudents[0]}
                                        setShowAddStudent={setShowAddStudent} showAddStudent={showAddStudent}/>
                    </div>
                </div>
                <Row className="fill_height fill_width remaining_height">
                    <Col>
                    {showProject ?
                            <ProjectsList selectedStudent={selectedStudents[0]} setSelectedProject={setSelectedProject}
                                        selectedProject={selectedProject} fullview={fullView}/>
                            :
                            <StudentListAndFilters setSelectedStudents={setSelectedStudents} selectedStudents={selectedStudents}
                                                elementType="projects" fullview={fullView}/>                            
                    }
                    </Col>
                </Row>
            </>
                :
            <Row className="fill_height fill_width remaining_height">
                {fullView? <StudentsFilters/> : null}
                <Col>
                    <StudentListAndFilters setSelectedStudents={setSelectedStudents} selectedStudents={selectedStudents}
                                           elementType="projects" fullview={fullView}/>
                </Col>
                <Col className="center-content" md="auto" style={{marginLeft: "0", maxWidth: "60"}}>
                    <div>
                        <Hint message="Add the selected student(s) to the selected project">
                            <Image onClick={() => setShowAddStudent(true)} src={matchIcon} alt="match student to project"
                                   width={60}/>
                        </Hint>
                        <AddStudentModal selectedProject={selectedProject} selectedStudent={selectedStudents[0]}
                                         setShowAddStudent={setShowAddStudent} showAddStudent={showAddStudent}/>
                    </div>
                </Col>
                <ProjectsList selectedStudent={selectedStudents[0]} setSelectedProject={setSelectedProject}
                              selectedProject={selectedProject} fullview={fullView}/>
            </Row>}
        </>

    )
}
