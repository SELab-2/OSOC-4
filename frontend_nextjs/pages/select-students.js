import React from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { useSession } from "next-auth/react";


/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();

    return (
        <Row>
            <StudentListAndFilters studentsTab={true} studentId={router.query.studentId} />
            {
                (router.query.studentId) &&
                (<Col>
                    <StudentDetails />
                </Col>)
            }
        </Row >
    )

}