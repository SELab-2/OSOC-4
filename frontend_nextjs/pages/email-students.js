import React, { useState } from "react";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { Col, Row } from "react-bootstrap";
import useWindowDimensions from "../utils/WindowDimensions";
import StudentsFilters from "../Components/select_students/StudentsFilters";

/**
 * The page corresponding with the 'email students' tab
 * @returns {JSX.Element} An element that renders the 'email students' tab
 */
export default function EmailStudents() {

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const { height, width } = useWindowDimensions();

  const selectAll = (event) => {
    console.log("clicked")
    setSelectedStudents([...students])
  }

  /**
   * the html that displays the 'email students' tab
   */
  return (
    <>
      <Row >
        {
          ((width > 1500) || (width > 1000 && !router.query.studentId)) &&
          <StudentsFilters />
        }
        <Col>
          <StudentListAndFilters students={students} setStudents={setStudents} setSelectedStudents={setSelectedStudents} selectedStudents={selectedStudents} studentsTab={false} category="emailstudents" studentId={undefined} />
          <Row style={{ "background-color": "lightgray", "height": "55px" }}>
            <Col>{selectedStudents.length}/{students.length}</Col>
            <Col><button onClick={selectAll}>SELECT ALL</button></Col>
            <Col><button>SEND EMAILS</button></Col>
          </Row>
        </Col>
      </Row>


    </>
  )

}