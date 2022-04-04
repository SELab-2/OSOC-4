import StudentListelement from "../Components/StudentListelement";
import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/StudentsFilters";
import {Container, Row, Col} from "react-bootstrap";

import TempStudentListelement from "../Components/TempStudentElement";


export default function SelectStudents(props) {

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState([]);

    // This function inserts the data in the variables
    useEffect(() => {

        getJson(getStudentsPath()).then(res => {
            setStudents(res);
            console.log(res)
        })
    })    
     /*
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
      </Container>*/
    return(
      <Container fluid>
        <Row>
            <Col>
              {students.map(student => <TempStudentListelement key={student} id={student} />)}
            </Col>
        </Row>
      </Container>

    )
    
}