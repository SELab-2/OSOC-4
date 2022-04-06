import {Col, Container, Row} from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import {useEffect, useState} from "react";
import Scrollbar from "bootstrap/js/src/util/scrollbar";
import StudentList from "./StudentList";

export default function StudentDetails(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState({});

  // This function inserts the data in the variables
  useEffect( () => {
    if (!Object.keys(student).length) {
      setStudent(props.student)
    }
  })

  return(
    <Col className="fill_height scroll-overflow student_details">
      <Row>
        <Col md="auto">
          <Row>
            {student["name"]}
          </Row>
          <Row>VIDEO EDITOR</Row>
        </Col>
      </Row>
    </Col>
  )
}