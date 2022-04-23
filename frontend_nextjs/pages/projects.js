import React, {useState} from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";

export default function Projects() {

  const [students, setStudents] = useState([])

  return(
    <Row className="remaining_height fill_width">
      <StudentListAndFilters students={students} setStudents={setStudents} studentsTab={false} studentId={undefined}/>

      <Col className="fill_height">
        <ProjectsList/>
      </Col>
    </Row>
    // Url.fromName(api.edition_projects)
  )
}