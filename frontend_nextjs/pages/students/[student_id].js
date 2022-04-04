import {useEffect, useState} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {router} from "next/client";
import {getJson} from "../../utils/json-requests";
import {getStudentPath, getStudentsPath} from "../../routes";
import StudentList from "../../Components/select_students/StudentList";


export default function Student_id(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const {student_id} = router.query;
  const [student, setStudent] = useState({});
  const [students, setStudents] = useState(undefined);

  // This function inserts the data in the variables
  useEffect( () => {
    getJson(getStudentPath(student_id)).then(res => {
      console.log("resultaat: " + res)
      setStudent(res);
    })


    getJson(getStudentsPath()).then(res => {
      setStudents(res);
    })

  })

  return(
    <Container fluid>
      <Row>
        <Col md="auto">
          <StudentList students={students}/>
        </Col>
      </Row>
    </Container>

  )

}