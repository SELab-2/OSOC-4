import { useEffect, useState } from "react";
import { getJson } from "../../utils/json-requests";

export default function TempStudentListelement(props) {

    const [student, setStudent] = useState({});

    // This function inserts the data in the variables
    useEffect(async () => {
        console.log("tlkqjmlkfqjq")
        console.log(props.id)
        getJson(props.id).then(res => {

            setStudent(res);
        })

    }, []);


    // The html representation of a list-element
    return (
        <li>
            <h3>{student["name"]}</h3>
        </li >
    )
}