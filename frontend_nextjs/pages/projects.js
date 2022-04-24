import React, {useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import Image from 'next/image'
import ProjectsList from "../Components/projects/ProjectsList";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";
import matchIcon from "/public/assets/arrow-right-svgrepo-com.svg"

export default function Projects() {

  const [students, setStudents] = useState([])

  return(
      <>
          <Row className="remaining_height fill_width">
              <StudentListAndFilters students={students} setStudents={setStudents} studentsTab={false} studentId={undefined}/>
              <Col md="auto" style={{ marginLeft: "0" }}>
                  <div style={{paddingTop: "40vh"}} className="fill_height">
                      <div className="button-match-student-project">
                          <Image src={matchIcon} alt="match student to project" width={80}/>
                      </div>
                  </div>
              </Col>
              <ProjectsList/>
          </Row>
      </>
  )
}
//                           <Image src={matchIcon} alt="match student to project" width={60}/>
//                          <h4 style={{color: "green", fontWeight: "bold"}}>Match</h4>