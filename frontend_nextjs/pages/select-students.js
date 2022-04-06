import StudentListelement from "../Components/select_students/StudentListelement";
import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Container, Row, Col} from "react-bootstrap";

import TempStudentListelement from "../Components/select_students/TempStudentElement";
import StudentList from "../Components/select_students/StudentList";


export default function SelectStudents(props) {

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);

    // This function inserts the data in the variables
    useEffect( () => {
        if (!students) {
            getJson(getStudentsPath()).then(res => {
                setStudents(res);
            })
        }
    })

    return(
      <Row>
          <Col md="auto" className="filters">
              <StudentsFilters/>
          </Col>
          <StudentList students={students} />
      </Row>
    )
    
}