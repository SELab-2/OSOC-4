import React, {useState} from "react";
import {Button, Col, Row} from "react-bootstrap";
import Image from 'next/image'
import ProjectsList from "../Components/projects/ProjectsList";
import StudentList from "../Components/select_students/StudentList";
import matchIcon from "/public/assets/arrow-right-svgrepo-com.svg"
import StudentListComponent from "../Components/StudentListComponent";

export default function Projects() {

  const [students, setStudents] = useState([])

  return(
      <>
          <Row className="remaining_height fill_width">
              <StudentListComponent students={students} emailStudents={false} setStudents={setStudents}
                                    studentsTab={false} studentId={undefined}/>
              <Col md="auto" className="nomargin">
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
