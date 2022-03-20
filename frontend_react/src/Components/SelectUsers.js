import StudentListelement from "./StudentListelement";
import {useEffect, useState} from "react";

export default function SelectUsers(props) {

  const [students, setStudents] = useState(undefined);

  useEffect(
    if (!students) {
      getJson(props.)
    }
  )

    return(
        <div className="students-list">
            <StudentListelement student={}/>
        </div>
    )
}
