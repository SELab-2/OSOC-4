import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {get_edition, getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";

export default function EditionDropdownButton() {
    const [editionList, setEditionList] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(undefined)


    useEffect(() => {
        if(currentVersion === undefined){
            get_edition().then(edition => {
                log(edition.year)
                setCurrentVersion(edition)
            })
        }

        if (editionList.length === 0) {
            getJson("/editions").then(async res => {
                log("load all editions")
                log(res)
                // TODO fix cleaner way to make sure same edition doesn't get loaded multiple times
                let temp_list = []
                for(let e of res){
                    log("load specific edition")
                    log(e)
                    getJson(e).then(async edition => {
                        log(edition)
                        if(edition){
                            temp_list.push(edition)
                        }
                    }).then(async _ => {
                        if(res.length === temp_list.length){
                            await setEditionList(temp_list)
                        }
                    })
                }
            })
        }
    })

    const ChangeSelectedVersion = async (edition) => {
        log("change edition dropdown")
        log(edition)
        localStorage.setItem("edition", JSON.stringify({"year": edition.year, "name": edition.name}))
        await setCurrentVersion({"year": edition.year, "name": edition.name});
    }

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                {(currentVersion) ? currentVersion.name : null}
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