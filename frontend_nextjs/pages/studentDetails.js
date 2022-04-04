import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import {Container, Row, Col} from "react-bootstrap";

export default function StudentDetails(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState(undefined);

  // This function inserts the data in the variables
  useEffect( () => {
    if (!student) {
      getJson(props.student).then(res => {
        setStudent(res);
      })
    }
  })


  return(
    <Container fluid>
      <Row>
        <Col>
          {student["name"]}
        </Col>
      </Row>
    </Container>

  )

}