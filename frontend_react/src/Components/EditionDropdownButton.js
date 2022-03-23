import {DropdownButton} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getJson, isStillAuthenticated} from "../utils/json-requests";

export default function EditionDropdownButton(props) {
    const [editionList, setEditionList] = useState([]);

    useEffect(() => {
        if (!editionList.length) {
            getJson("/editions").then(async res => {
                console.log("load editions")
                console.log(res)
                for (let edition of res.data) {
                    //cleanup
                    await setEditionList(prevState => [...prevState, edition.data])
                }
            });
        }
    })
    return (
        <DropdownButton id="dropdown-basic-button" title="Choose shown edition">
            {editionList}
        </DropdownButton>
    )
}


