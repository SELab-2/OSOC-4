import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { useSession } from "next-auth/react";


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

    // These constants represent the filters
    const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.skills) ? router.query.skills.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

    /**
 * This function is called when students, router.query.sortby, router.query.search or filters is changed
 */
    // useEffect(() => {

    //     if (ws) {
    //         ws.onmessage = (event) => updateFromWebsocket(event);
    //     } else {
    //         const new_ws = new WebSocket("ws://localhost:8000/ws")
    //         new_ws.onmessage = (event) => updateFromWebsocket(event);
    //         setWs(new_ws);

    //     }

    // }, [students, updateFromWebsocket, ws, student])


    /**
     * The html that displays the overview of students
     */
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