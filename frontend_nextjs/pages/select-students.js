import React, { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Form, Row } from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import {getCsrfToken, getSession, useSession} from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";
import axios from "axios";

// The page corresponding with the 'select students' tab
export default function SelectStudents({ students }) {
    const router = useRouter();
    console.log("server students:");
    console.log(students);

    // These constants are initialized empty, the data will be inserted in useEffect
    const [visibleStudent, setVisibleStudents] = useState(undefined);
    const studentId = router.query.studentId

    // These variables are used to notice if search or filters have changed
    let [search, setSearch] = useState("");
    let [sortby, setSortby] = useState("");
    const [localFilters, setLocalFilters] = useState([0, 0, 0]);

    // These constants represent the filters
    const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.skills) ? router.query.skills.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

    // This function inserts the data in the variables
    const { data: session, status } = useSession()


    useEffect(() => {
        function filterStudentsFilters(filteredStudents) {
            return filteredStudents;
        }
        function filterStudentsSkills(filteredStudents) {
            return filteredStudents;
        }
        function filterStudentsDecision(filteredStudents) {
            let decisionNumbers = filters[2].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))
            if (filters[2].length !== 0) {
                filteredStudents = filteredStudents.filter(student => {
                    let decisions = student["suggestions"].filter(suggestion => suggestion["definitive"]);
                    let decisionNumber = (decisions.length === 0) ? -1 : decisions[0]["decision"];
                    return decisionNumbers.includes(decisionNumber);
                })
            }
            return filteredStudents;
        }
        if (session) {
            if (students &&
                (localFilters.some((filter, index) => filter !== filters[index].length))) {
                let filterFunctions = [filterStudentsFilters, filterStudentsSkills, filterStudentsDecision];
                let filteredStudents = students
                let newLocalFilters = localFilters;
                for (let i = 0; i < localFilters.length; i++) {
                    if (filters[i].length !== localFilters[i]) {
                        newLocalFilters[i] = filters[i].length;
                        filteredStudents = filterFunctions[i](filteredStudents);
                    }
                }
                setLocalFilters(newLocalFilters);
                setVisibleStudents(filteredStudents);
            }
            if (filters.every(filter => filter.length === 0)) {
                setVisibleStudents(students);
            }
        }
    }, [session, students, localFilters, filters])


    // the html that displays the overview of students
    return (
        <Row className="remaining_height fill_width">
            <Col className="fill_height">
                <Row className="fill_height">
                    {(!studentId) ? <StudentsFilters students={students}
                        filters={filters} /> : null}
                    <Col className="fill_height students-list-paddingtop">
                        <SearchSortBar />
                        <Row className="student-list-positioning">
                            <StudentList students={visibleStudent} />
                        </Row>
                    </Col>
                    {(studentId) ? <StudentDetails student_id={studentId} /> : null}
                </Row>
            </Col>
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
    students = await urlManager.getStudents(context, "2019").then(url => axios.get(url, config));
    students = students.data
    students = await Promise.all(students.map(s => axios.get(s, config).then(r => r.data)))
    console.log("got students")

    return {
        props: {
            students: students,
        },
    }
}