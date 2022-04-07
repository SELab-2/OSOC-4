import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Col, Row} from "react-bootstrap";

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

    // the html that displays the overview of students
    return(
      <Row className="remaining_height fill_width">
        <StudentsFilters/>
          <Col className="fill_height scroll-overflow">
              <StudentList students={students} width="max" />
          </Col>
      </Row>
    )
    
}