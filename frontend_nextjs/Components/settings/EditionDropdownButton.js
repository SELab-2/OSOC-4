import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";

export default function EditionDropdownButton() {
    const [editionList, setEditionList] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(["", ""])

    useEffect(() => {
        if (editionList.length === 0) {
            getJson("/editions").then(async res => {
                log("load editions")
                log(res)
                //TODO sort edition list
                for(let e of res.data){
                    log("NIETVEELZIEN")
                    getJson(e.id).then(async edition => {
                        log(edition.data)
                        log("wtf")
                        if(edition.data){
                            await setEditionList(prevState => [...prevState, edition.data])
                        }
                    })
                }
            })
        }
    })

    const ChangeSelectedVersion = async (item) => {
        log("change edition dropdown")
        log(item)
        //todo add this in backend? or cookie or other form of local storage?
        await setCurrentVersion([item.id, item.name]);
    }

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                Current versions name: {currentVersion[1]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {(editionList.length) ? (editionList.map((item, index) => (
                    //TODO show selected version in menu and make onClick clean or use other method
                    <Dropdown.Item  onClick={() => ChangeSelectedVersion(item)} key={index} value={item.id}>{item.name}</Dropdown.Item>
                ))) : null}
            </Dropdown.Menu>
        </Dropdown>
    )
}