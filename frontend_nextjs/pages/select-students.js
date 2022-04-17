import React, {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Col, Row} from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import {useSession} from "next-auth/react";
import {api} from "../utils/ApiClient";
import {useRouter} from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";

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

// The page corresponding with the 'select students' tab
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);
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

    const [ws, setWs] = useState(undefined);

    // This function inserts the data in the variables
    const { data: session, status } = useSession()

    useEffect(() => {
        if (ws) {
            ws.onmessage = (event) => updateFromWebsocket(event);
        } else {
            const new_ws = new WebSocket("ws://localhost:8000/ws")
            new_ws.onmessage = (event) => updateFromWebsocket(event);
            setWs(new_ws);

        }

    }, [students, updateFromWebsocket, ws])

    useEffect(() => {
        if (session) {
            if ((!students) || (router.query.search !== search) || (router.query.sortby !== sortby)) {
                setSearch(router.query.search);
                setSortby(router.query.sortby);

                // the urlManager returns the url for the list of students
                api.getStudents({ search: router.query.search || "", orderby: router.query.sortby || "" }).then(res => {
                    Promise.all(res.map(studentUrl =>
                        getJson(studentUrl).then(res => {
                            Object.values(res["suggestions"]).forEach((item, index) => {
                                if (item["suggested_by_id"] === session["userid"]) {
                                    res["own_suggestion"] = item;
                                }
                            });
                            console.log(res)
                            return res;
                        })
                    )).then(students => {
                        setStudents(students);
                        setLocalFilters([0, 0, 0]);
                    })
                });
            }
            if (students &&
                (localFilters.some((filter, index) => filter !== filters[index].length))) {
                let filterFunctions = [filterStudentsFilters, filterStudentsSkills, filterStudentsDecision];
                filterStudents(filterFunctions, students, localFilters, filters, setLocalFilters, setVisibleStudents);
            }
            if (filters.every(filter => filter.length === 0)) {
                setVisibleStudents(students);
            }
        }
    }, [session, students, router.query.search, router.query.sortby, search, sortby, localFilters, filters, filterStudentsDecision])

    const updateFromWebsocket = (event) => {
        let data = JSON.parse(event.data)
        console.log(students)
        students.find((o, i) => {
            if (o["id"] === data["suggestion"]["student_id"]) {
                let new_students = [...students]
                new_students[i]["suggestions"][data["id"]] = data["suggestion"];
                setStudents(new_students);
                return true; // stop searching
            }
        });
    }

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
                    {(studentId) ? <StudentDetails student={getStudentById()} student_id={studentId} /> : null}
                </Row>
            </Col>
        </Row>
    )

}