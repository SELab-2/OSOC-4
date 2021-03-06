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

    // If the screen is big enought to fit the filters, student list and details,
    // fullView is true, otherwise it is false.
    const [fullView, setFullView] = useState(false);

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [me, setMe] = useState(undefined);

    /**
     * This useEffect sets the user of the application.
     */
    useEffect(() => {
        Url.fromName(api.me).get().then(res => {
            if (res.success) {
                setMe(res.data.data);
            }
        });
    }, []);

    /**
     * This useEffect changes the fullView state variable, on change of the screen width or router.
     */
    useEffect(() => {
        setFullView(width > 1500 || (width > 1000 && !router.query.studentId));
    }, [width, router]);

    /**
     * The html that renders the students tab.
     */
    return (
        <Row style={{height: "calc(100vh - 66px)"}}>
            {
                fullView &&
                <Col className="fill_height" md="auto" key="studentFilters">
                    <StudentsFilters />
                </Col>
            }

            {(width > 800 || !router.query.studentId) &&
                <Col>
                    <Row className="nomargin">
                        <StudentListAndFilters selectedStudents={selectedStudents}
                            setSelectedStudents={setSelectedStudents} setStudents={setStudents}
                            category={showEmailBar ? "emailstudents" : "students"}
                            elementType="students" fullview={fullView} />
                    </Row>
                    {(me && me.role === 2 && students.length > 0) &&
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