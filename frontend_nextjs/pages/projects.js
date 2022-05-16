import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Image from 'next/image'
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/students/StudentListAndFilters";
import matchIcon from "/public/assets/arrow-right-svgrepo-com.svg"
import AddStudentModal from "../Components/projects/AddStudentModal";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/students/StudentsFilters";
import Hint from "../Components/Hint";

/**
 * The page corresponding with the 'projects' tab
 * @returns {JSX.Element}
 * @constructor
 */
export default function Projects() {

    const [selectedProject, setSelectedProject] = useState(undefined);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showAddStudent, setShowAddStudent] = useState(false)
    const { height, width } = useWindowDimensions();

    return (
        <>
            <Row className="fill_height fill_width remaining_height">
                {
                    ((width > 1500)) &&
                    <StudentsFilters />
                }
                <StudentListAndFilters setSelectedStudents={setSelectedStudents} selectedStudents={selectedStudents} elementType="projects" />
                <Col md="auto" style={{ marginLeft: "0" }}>
                    <div style={{ paddingTop: "40vh" }} className="fill_height">
                        <div className="button-match-student-project">
                            <Hint message="Add the selected student(s) to the selected project">
                                <Image onClick={() => setShowAddStudent(true)} src={matchIcon} alt="match student to project" width={80} />
                            </Hint>
                            <AddStudentModal selectedProject={selectedProject} selectedStudent={selectedStudents[0]} setShowAddStudent={setShowAddStudent} showAddStudent={showAddStudent} />
                        </div>
                    </div>
                </Col>
                <ProjectsList setSelectedProject={setSelectedProject} selectedProject={selectedProject} />
            </Row>
        </>
    )
}
