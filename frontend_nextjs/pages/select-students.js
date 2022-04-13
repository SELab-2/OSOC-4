import React, { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Col, Form, Row} from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import { useSession } from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import {useRouter} from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";

// The page corresponding with the 'select students' tab
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);
    const studentId = router.query.studentId;
    const [searchChanged, setSearchChanged] = useState(false);

    // This function inserts the data in the variables
    const { data: session, status } = useSession()
    useEffect(() => {
        if (session) {
            if ((!students) || searchChanged) {
                setSearchChanged(false);
                // the urlManager returns the url for the list of students
                urlManager.getStudents(router.query.sortby, router.query.search).then(url => getJson(url).then(res => {
                    Promise.all(res.map(studentUrl =>
                      getJson(studentUrl).then(res => res)
                    )).then(students => {
                      setStudents(students);
                    })
                })
                );
            }
        }
    })

    // the html that displays the overview of students
    return (
        <Row className="remaining_height fill_width">
            <Col className="fill_height">
                <Row className="fill_height">
                    {(! studentId) ? <StudentsFilters students={students} setStudents={setStudents}/> : null}
                    <Col className="fill_height students-list-paddingtop">
                        <SearchSortBar setSearchChanged={setSearchChanged}/>
                         <Row className="student-list-positioning">
                             <StudentList students={students}/>
                         </Row>
                    </Col>
                    {(studentId) ? <StudentDetails student_id={studentId}/> : null}
                </Row>
            </Col>
        </Row>
    )

}