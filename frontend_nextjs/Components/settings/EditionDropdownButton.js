import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {get_edition, getJson} from "../../utils/json-requests";
import {log} from "../../utils/logger";
import {urlManager} from "../../utils/ApiClient";

export default function EditionDropdownButton() {
    const [editionList, setEditionList] = useState([]);
    const [currentVersion, setCurrentVersion] = useState(undefined)

    const [loadingCurrentVersion, setLoadingCurrentVersion] = useState(false)
    const [loadingEditionList, setLoadingEditionList] = useState(false)

    useEffect(() => {
        if(currentVersion === undefined && ! loadingCurrentVersion){
            setLoadingCurrentVersion(true);
            urlManager.getCurrentEdition().then(url => {
                getJson(url).then(edition => {
                    log(edition)
                    setCurrentVersion({"year": edition.year, "name": edition.name})
                    setLoadingCurrentVersion(false)
                })
            })
        }

        if (editionList.length === 0 && ! loadingEditionList) {
            setLoadingEditionList(true)
            urlManager.getEditions().then(url => {
                log("this is the url thing")
                log(url)
                getJson(url).then(async res => {
                    log("load all editions")
                    log(res)
                    for(let e of res){
                        log("load specific edition")
                        log(e)
                        getJson(e).then(async edition => {
                            if(edition){
                                await setEditionList(prevState => [...prevState, {"year": edition.year, "name": edition.name}])
                            }
                        }).then(async () => {
                            setLoadingEditionList(false)

                        })
                    }
                })
            })
        }
    }, [currentVersion, loadingEditionList, editionList.length, loadingCurrentVersion])

    const ChangeSelectedVersion = async (edition) => {
        log("change edition dropdown")
        log(edition)
        await urlManager._setCurrentEdition(edition.year)
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