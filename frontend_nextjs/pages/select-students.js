import StudentListelement from "../Components/StudentListelement";
import { useEffect, useState } from "react";
import { getStudentsPath } from "../routes";
import { getJson } from "../utils/json-requests";
import TempStudentListelement from "../Components/TempStudentElement";

export default function SelectStudents(props) {

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState([]);

    // This function inserts the data in the variables
    useEffect(() => {

        getJson(getStudentsPath()).then(res => {
            setStudents(res);
        })

    }, [])

    return (
        <div>
            <h1>Students</h1>
            {students.map(student => <TempStudentListelement key={student} id={student.id} />)}
        </div>
    )
}