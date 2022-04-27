import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import EmailBottomBar from "../Components/select_students/EmailBottomBar";
import { api, Url } from "../utils/ApiClient";


/**
 * The page corresponding with the 'select students' tab.
 * @returns {JSX.Element} A component corresponding with the 'select students' tab.
 */
export default function SelectStudents() {
    const router = useRouter();
    const { height, width } = useWindowDimensions();
    const [showEmailBar, setShowEmailBar] = useState(false);

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [me, setMe] = useState(undefined);

    useEffect(() => {
        Url.fromName(api.me).get().then(res => {
            if (res.success) {
                setMe(res.data.data);
            }
        });
    }, []);

    return (

        <Row>

            {
                ((width > 1500) || (width > 1000 && !router.query.studentId)) &&
                <Col md="auto" key="studentFilters">
                    <StudentsFilters />
                </Col>
            }


            <Col>
                <Row className="nomargin">
                    <StudentListAndFilters selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} setStudents={setStudents} category={showEmailBar ? "emailstudents" : "students"} studentsTab={true} />
                </Row>
                {(me && me.role === 2) &&
                    <EmailBottomBar selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} students={students} showEmailBar={showEmailBar} setShowEmailBar={setShowEmailBar} />
                }
            </Col>
            {
                (router.query.studentId) &&
                (<Col>
                    <StudentDetails />
                </Col>)
            }
        </Row >
    )

}