import React, { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import Image from 'next/image'
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import matchIcon from "/public/assets/arrow-right-svgrepo-com.svg"
import AddStudentModal from "../Components/projects/AddStudentModal";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import Hint from "../Components/Hint";

/**
 * The page corresponding with the 'projects' tab
 * @returns {JSX.Element}
 * @constructor
 */
export default function Projects() {

    const [selectedProject, setSelectedProject] = useState(undefined);
    const [selectedStudent, setSelectedStudent] = useState(undefined);
    const [showAddStudent, setShowAddStudent] = useState(false)
    const { height, width } = useWindowDimensions();

    return (
        <>
            <Row className="remaining_height fill_width">
                {
                    ((width > 1500)) &&
                    <StudentsFilters />
                }
                <StudentListAndFilters setSelectedStudent={setSelectedStudent} selectedStudent={selectedStudent} studentsTab={false} />
                <Col md="auto" style={{ marginLeft: "0" }}>
                    <div style={{ paddingTop: "40vh" }} className="fill_height">
                        <div className="button-match-student-project">
                            <Hint message="Add the selected student(s) to the selected project" placement="top">
                                <Image onClick={() => setShowAddStudent(true)} src={matchIcon} alt="match student to project" width={80} />
                            </Hint>
                            <AddStudentModal selectedProject={selectedProject} selectedStudent={selectedStudent} setShowAddStudent={setShowAddStudent} showAddStudent={showAddStudent} />
                        </div>
                    </div>
                </Col>
                <ProjectsList selectedStudent={selectedStudent} setSelectedProject={setSelectedProject} selectedProject={selectedProject} />
            </Row>
        </>
    )
}
