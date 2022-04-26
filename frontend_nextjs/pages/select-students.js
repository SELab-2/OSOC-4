import React from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { useSession } from "next-auth/react";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/select_students/StudentsFilters";


/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();
    const { height, width } = useWindowDimensions();

    return (
        <Row>
            {
                ((width > 1500) || (width > 1000 && !router.query.studentId)) &&
                <StudentsFilters />
            }
            <StudentListAndFilters studentsTab={true} />
            {
                (router.query.studentId) &&
                (<Col>
                    <StudentDetails />
                </Col>)
            }
        </Row >
    )

}