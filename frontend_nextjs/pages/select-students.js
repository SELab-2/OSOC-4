import StudentListelement from "../Components/select_students/StudentListelement";
import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Container, Row, Col} from "react-bootstrap";

import TempStudentListelement from "../Components/select_students/TempStudentElement";


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

    // function to get a list of students
    function getStudents() {
        if (students) {
            return students.map(student =>
              // generate a list of students, each student needs 'student' as a prop
              <li key={student.id}>
                  <StudentListelement student={student} />
              </li>
            );
        }
        return null;
    }

    return(
      <Container fluid>
        <Row>
            <Col md="auto" className="filters">
                <StudentsFilters/>
            </Col>
            <Col>
                <ul className="students_list">
                    {getStudents()}
                </ul>
            </Col>
        </Row>
      </Container>

    )
    
}