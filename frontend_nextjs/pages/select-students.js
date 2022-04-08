import StudentListelement from "../Components/StudentListelement";

import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {get_edition, getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/StudentsFilters";
import {Container, Row, Col} from "react-bootstrap";

import TempStudentListelement from "../Components/TempStudentElement";
import {log} from "../utils/logger";


export default function SelectStudents(props) {

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState([]);

    // This function inserts the data in the variables
    useEffect(  () => {
        if (!students.length) {
            log("loading select students")
            get_edition().then(async edition => {
                log("edition loaded")
                log(edition)
                getJson(getStudentsPath(edition.year)).then(res => {
                    log("students loaded")
                    log(res)
                    if(res){
                        setStudents(res);
                    }
                })
            })
        }
    })

    // function to get a list of students
    function getStudents() {
        if (students) {
            return students.map(student =>
              // generate a list of students, each student needs 'student' as a prop
              <li key={student}>
                  <StudentListelement student={student} />
              </li>
            );
        }
        return null;
    }
     /*
     <Container fluid>
        <Row>
            <Col md="auto" className="filters">
                <StudentsFilters/>
            </Col>
        </Row>
      </Container>*/
    return(
      <Container fluid>
        <Row>
            <Col>
                <ul className="students_list">
                    {getStudents()}
                </ul>
            </Col>
        </Row>
      </Container>

    )
}