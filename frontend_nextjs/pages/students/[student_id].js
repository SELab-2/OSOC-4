import {useEffect, useState} from "react";
import {Container, Row, Col} from "react-bootstrap";
import {router} from "next/client";
import {getJson} from "../../utils/json-requests";
import {getStudentPath, getStudentsPath} from "../../routes";
import StudentList from "../../Components/select_students/StudentList";
import Scrollbar from "bootstrap/js/src/util/scrollbar";
import StudentDetails from "../../Components/select_students/StudentDetails";


export default function Student_id(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const {student_id} = router.query;
  const [student, setStudent] = useState({});
  const [students, setStudents] = useState(undefined);

  // This function inserts the data in the variables
  useEffect( () => {
    if (!Object.keys(student).length) {
      getJson(getStudentPath(student_id)).then(res => {
        setStudent(res);
      })
    }

    if (! students) {
      getJson(getStudentsPath()).then(res => {
        setStudents(res);
      })
    }
  })

  return(
    <Row className="fill_height">
      <StudentList students={students} />
      <StudentDetails student={student} />
    </Row>
  )

}