import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { useSession } from "next-auth/react";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import EmailBottomBar from "../Components/select_students/EmailBottomBar";


/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();
    const { height, width } = useWindowDimensions();
    const [showEmailBar, setShowEmailBar] = useState(false);

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    return (

        <Row>

            {
                ((width > 1500) || (width > 1000 && !router.query.studentId)) &&
                <Col md="auto" key="studentFilters">
                    <StudentsFilters />
                </Col>
            }


            <Col>
                <Row className="nomargin">
                    <StudentListAndFilters selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} setStudents={setStudents} category={showEmailBar ? "emailstudents" : "students"} studentsTab={true} />
                </Row>
                <EmailBottomBar selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} students={students} showEmailBar={showEmailBar} setShowEmailBar={setShowEmailBar} />

            </Col>
            {
                (router.query.studentId) &&
                (<Col>
                    <StudentDetails />
                </Col>)
            }
        </Row >
    )

}