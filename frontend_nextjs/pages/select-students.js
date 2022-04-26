import React from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentList from "../Components/select_students/StudentList";
import { useSession } from "next-auth/react";
import StudentListComponent from "../Components/StudentListComponent";


/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();

    return (
        <Row className="nomargin screen-content-row">
            <StudentListComponent emailStudents={false} studentsTab={true} studentId={router.query.studentId} />
            {
                (router.query.studentId) &&
                (<Col>
                    <StudentDetails />
                </Col>)
            }
        </Row >
    )

}