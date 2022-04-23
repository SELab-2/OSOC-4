import React, {useState} from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";

export default function Projects() {

  const [students, setStudents] = useState([]);
  const [selectedProject, setSelectedProject] = useState(undefined)

  return(
    <Row className="remaining_height fill_width">
      <StudentListAndFilters students={students} setStudents={setStudents} studentsTab={false} studentId={undefined}/>
      <Col className="fill_height fill_width">
        <ProjectsList setSelectedProject={setSelectedProject} selectedProject={selectedProject}/>
      </Col>
    </Row>
  )
}
