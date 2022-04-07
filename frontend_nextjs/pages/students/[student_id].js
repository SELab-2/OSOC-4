import {useEffect, useState} from "react";
import {Row, Col} from "react-bootstrap";
import {router} from "next/client";
import {getJson} from "../../utils/json-requests";
import {getStudentsPath} from "../../routes";
import StudentList from "../../Components/select_students/StudentList";
import StudentDetails from "../../Components/select_students/StudentDetails";


export default function Student_id(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const {student_id} = router.query;
  const [students, setStudents] = useState(undefined);

  // This function inserts the data in the variables
  useEffect( () => {
    if (! students) {
      getJson(getStudentsPath()).then(res => {
        setStudents(res);
      })
    }
  })

  // the html to display the student page
  return(
    <Row className="remaining_height fill_width">
      <Col md="auto" className="fill_height" style={{width: "35%"}}>

        <Row className="remaining-height-backbutton" style={{width: "35%"}}>
          <StudentList students={students} width="min"/>
        </Row>
      </Col>
      <StudentDetails student_id={student_id} />
    </Row>
  )

}