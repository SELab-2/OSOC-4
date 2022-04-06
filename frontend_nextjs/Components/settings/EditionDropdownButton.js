import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";
import {useSession} from "next-auth/react";

export default function EditionDropdownButton() {
    const [editionList, setEditionList] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(["", ""])
    const { data: session, status } = useSession()


    useEffect(() => {
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

    const ChangeSelectedVersion = async (item) => {
        log("change edition dropdown")
        log(item)
        log(item.year)
        localStorage.setItem("edition", item.year)
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
                    <Dropdown.Item  onClick={() => ChangeSelectedVersion(item)} key={index} value={item.uri}>{item.name}</Dropdown.Item>
                ))) : null}
            </Dropdown.Menu>
        </Dropdown>
    )
}