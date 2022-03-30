import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";

export default function EditionDropdownButton() {
    const [editionList, setEditionList] = useState([]);
    const [currentVersion, setCurrentVersion] = useState({uri:"", name:"not selected yet"})

    useEffect(() => {
        if (editionList.length === 0) {
            getJson("/editions").then( async editions => {
                log("Loading editions")
                log(editions)
                editions.data.sort((a, b) => {
                    if(a["name"] > b["name"]){
                        return -1
                    }
                    if(a["name"] < b["name"]){
                        return 1
                    }
                    return 0
                })
                setEditionList(editions.data)
            })

        }
    })

    const ChangeSelectedVersion = async (item) => {
        log("change edition dropdown")
        log(item)
        //todo add this in backend? or cookie or other form of local storage?
        await setCurrentVersion(item);
    }

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                Current versions name: {currentVersion.name}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {(editionList.length) ? (editionList.map((item, index) => (
                    //TODO show selected version in menu and make onClick clean or use other method
                    <Dropdown.Item  onClick={() => ChangeSelectedVersion(item)} key={index} value={item.uri}>{item.name}</Dropdown.Item>
                ))) : null}
            </Dropdown.Menu>
        </Dropdown>
    )
}