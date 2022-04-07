import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import {Row} from "react-bootstrap";

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
      <Row className="remaining_height fill_width">
        <StudentsFilters/>
        <StudentList students={students} />
      </Row>
    )
    
}