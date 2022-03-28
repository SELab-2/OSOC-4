import StudentListelement from "../Components/StudentListelement";
import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";
import StudentsFilters from "../Components/StudentsFilters";

export default function SelectStudents(props) {

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState(undefined);

    // This function inserts the data in the variables
    useEffect( () => {
        if (!students) {
            getJson(getStudentsPath()).then(res => {
                setStudents(res.data);
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
      <div>
        <StudentsFilters className="filters" style={{display: "inline-block"}}/>
        <div style={{width:"800px"}}>
            <ul className="students_list">
                {getStudents()}
            </ul>
        </div>
      </div>
    )
}
