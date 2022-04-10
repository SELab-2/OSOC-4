import { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Row } from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import { useSession } from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import {useRouter} from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";

// The page corresponding with the 'select students' tab
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);
    const studentId = router.query.studentId;

    // This function inserts the data in the variables
    const { data: session, status } = useSession()
    useEffect(() => {
        if (session) {
            if (!students) {
                // the urlManager returns the url for the list of students
                urlManager.getStudents().then(url => getJson(url).then(res => {
                    setStudents(res);
                }));
            }
        }
    })

    // the html that displays the overview of students
    return (
        <Row className="remaining_height fill_width">
            {(! studentId) ? <StudentsFilters/> : null}
            <Col className="fill_height students-list-paddingtop">
                 <div className="fill_height">
                     <StudentList students={students}/>
                 </div>
            </Col>
            {(studentId) ? <StudentDetails student_id={studentId}/> : null}
        </Row>
    )

}