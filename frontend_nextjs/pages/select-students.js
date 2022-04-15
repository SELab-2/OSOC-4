import React, { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Row } from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import { useSession } from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";

/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);
    const [visibleStudent, setVisibleStudents] = useState(undefined);
    const studentId = router.query.studentId

    // These variables are used to notice if search or filters have changed, they will have the values of search,
    // sortby and filters that we filtered for most recently.
    let [search, setSearch] = useState("");
    let [sortby, setSortby] = useState("");
    const [localFilters, setLocalFilters] = useState([0, 0, 0]);

    // These constants represent the filters
    const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.skills) ? router.query.skills.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

    /**
     * This function inserts the data in the variables
     */
    const { data: session, status } = useSession()
    useEffect(() => {
        if (session) {

            // Check if the search or sortby variable has changed from the search/sortby in the url. If so, update the
            // variables and update the students list. If the list is updated, we change the local filters. This will
            // provoke the second part of useEffect to filter the students again.
            if ((!students) || (router.query.search !== search) || (router.query.sortby !== sortby)) {
                setSearch(router.query.search);
                setSortby(router.query.sortby);

                // the urlManager returns the url for the list of students
                urlManager.getStudents().then(url => getJson(url, { search: router.query.search || "", orderby: router.query.sortby || "" }).then(res => {
                    Promise.all(res.map(studentUrl =>
                        getJson(studentUrl).then(res => res)
                    )).then(students => {
                        setStudents(students);
                        setLocalFilters([0, 0, 0]);
                    })
                })
                );
            }

            // Check if the real filters have changed from the local filters. If so, update the local filters and
            // filter the students.
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
    })

    async function retrieveStudents() {

    }

    /**
     * This function filters the students for the general filters (the filters in filters[0]).
     * @param filteredStudents The list of students that need to be filtered.
     * @returns {*} The list of students that are allowed by the general filters.
     */
    function filterStudentsFilters(filteredStudents) {
        return filteredStudents;
    }

    /**
     * This function filters the students for the skills filters (the filters in filters[1]).
     * @param filteredStudents The list of students that need to be filtered.
     * @returns {*} The list of students that are allowed by the skills filters.
     */
    function filterStudentsSkills(filteredStudents) {
        return filteredStudents;
    }

    /**
     * This function filters the students for the decision filters (the filters in filters[2]).
     * @param filteredStudents The list of students that need to be filtered.
     * @returns {*} The list of students that are allowed by the decision filters.
     */
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

    /**
     * The html that displays the overview of students
     */
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