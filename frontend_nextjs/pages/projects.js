import React, {useState} from "react";
import {Col, Row} from "react-bootstrap";
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
        <Row className="fill_height fill_width remaining_height">
            {fullView && <StudentsFilters/>}
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
                          selectedProject={selectedProject}/>
        </Row>
    )
}
