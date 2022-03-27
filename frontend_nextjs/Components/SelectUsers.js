import StudentListelement from "./StudentListelement";
import {useEffect, useState} from "react";
import {getStudentsPath} from "../routes";
import {getJson} from "../utils/json-requests";

export default function SelectUsers(props) {

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
          <ul className="students-list">
              {getStudents()}
          </ul>
      </div>
    )
}
