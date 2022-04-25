import React, { useState } from "react";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import { Col, Row } from "react-bootstrap";

/**
 * The page corresponding with the 'email students' tab
 * @returns {JSX.Element} An element that renders the 'email students' tab
 */
export default function EmailStudents() {

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  /**
   * the html that displays the 'email students' tab
   */
  return (
    <>

      <Row >
        <StudentListAndFilters students={students} setStudents={setStudents} setSelectedStudents={setSelectedStudents} selectedStudents={selectedStudents} studentsTab={false} category="emailstudents" studentId={undefined} />
      </Row>
      <Row>
        <Col>{selectedStudents.length}/{students.length}</Col>
      </Row>

    </>
  )

}