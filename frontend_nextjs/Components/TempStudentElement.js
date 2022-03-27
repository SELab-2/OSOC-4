import { useEffect, useState } from "react";
import { get_student } from "../utils/json-requests";

export default function TempStudentListelement(props) {

    const [student, setStudent] = useState({});

    // This function inserts the data in the variables
    useEffect(async () => {
        const data = await get_student(props.id);
        setStudent(data["data"]["data"]);
    }, []);


    // The html representation of a list-element
    return (
        <li>
            <h3>{student["name"]}</h3>
        </li >
    )
}