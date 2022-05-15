import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import StudentDetails from "../Components/students/StudentDetails";
import StudentListAndFilters from "../Components/students/StudentListAndFilters";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/students/StudentsFilters";
import EmailBottomBar from "../Components/students/EmailBottomBar";
import { api, Url } from "../utils/ApiClient";


/**
 * The page corresponding with the 'students' tab.
 * @returns {JSX.Element} A component corresponding with the 'students' tab.
 */
export default function Students() {
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

        <Row style={{height: "calc(100vh - 86px)"}}>

            {
                ((width > 1500) || (width > 1000 && !router.query.studentId)) &&
                <Col className="fill_height" md="auto" key="studentFilters">
                    <StudentsFilters />
                </Col>
            }

            {(width > 800 || !router.query.studentId) &&
                <Col>
                    <Row className="nomargin">
                        <StudentListAndFilters selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} setStudents={setStudents} category={showEmailBar ? "emailstudents" : "students"} studentsTab={true} />
                    </Row>
                    {(me && me.role === 2) &&
                        <EmailBottomBar selectedStudents={selectedStudents} setSelectedStudents={setSelectedStudents} students={students} showEmailBar={showEmailBar} setShowEmailBar={setShowEmailBar} />
                    }
                </Col>
            }
            {
                (router.query.studentId) &&
                <StudentDetails />
            }
        </Row >
    )

}