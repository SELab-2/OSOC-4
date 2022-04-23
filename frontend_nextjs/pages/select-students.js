import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";

// This function filters the list of students, it is also used in email-students
export function filterStudents(filterFunctions, students, localFilters, filters, setLocalFilters, setVisibleStudents) {
    let filteredStudents = students
    let newLocalFilters = localFilters;
    for (let i = 0; i < localFilters.length; i++) {
        newLocalFilters[i] = filters[i].length;
        filteredStudents = filterFunctions[i](filteredStudents);
    }
    setLocalFilters(newLocalFilters);
    setVisibleStudents(filteredStudents);
}

/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState([]);

    const studentId = router.query.studentId


    function getStudentById() {
        if (students) {
            return students.find((o, i) => {
                if (o["id_int"] === studentId) {
                    return o;
                }
            });
        }
        return undefined;
    }


    /**
     * The html that displays the overview of students
     */
    return (
        <Row>
            <StudentListAndFilters students={students} setStudents={setStudents} studentsTab={true} studentId={studentId} />
            {
                (studentId) &&
                <Col>
                    <StudentDetails student={getStudentById()} student_id={studentId} />
                </Col>
            }
        </Row >
    )

}