import { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Row } from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import {getCsrfToken, getSession} from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import {useRouter} from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import Login from "./login";
import axios from "axios";

// The page corresponding with the 'select students' tab
export default function SelectStudents({ students }) {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const studentId = router.query.studentId;

    console.log("SELECT STUDENTS");
    console.log(students);

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


export async function getServerSideProps(context) {
    const session = await getSession(context);
    const csrfToken = await getCsrfToken(context);
    console.log("server side props")
    console.log(session)
    let students;
    let config = {"headers": {
            "Authorization": `Bearer ${session.accessToken}`,
            "X-CSRF-TOKEN": csrfToken}}
    students = await axios.get(urlManager.baseUrl + "/editions/2022/students",
        config
    )
    students = students.data;
    students = await Promise.all(students.map(s => axios.get(s, config).then(r => r.data)))
    console.log("students")
    console.log(students)

    return {
        props: {
            students,
        },
    }
}