import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {log} from "../../utils/logger";
import {api, Url} from "../../utils/ApiClient";

export default function EditionDropdownButton(props) {
    const [editionList, setEditionList] = useState([]);
    const currentVersion = props.currentVersion;
    const setCurrentVersion = props.setCurrentVersion;

    const [loadingCurrentVersion, setLoadingCurrentVersion] = useState(false)
    const [loadingEditionList, setLoadingEditionList] = useState(false)

    useEffect(() => {
        if(currentVersion === undefined && ! loadingCurrentVersion){
            setLoadingCurrentVersion(true);
            Url.fromName(api.current_edition).get().then(res => {
                if (res.success) {
                    const edition = res.data;
                    setCurrentVersion({"year": edition.year, "name": edition.name})
                    setLoadingCurrentVersion(false)
                }

            })
        }

        if (editionList.length === 0 && ! loadingEditionList) {
            setLoadingEditionList(true)
            Url.fromName(api.editions).get().then(async res => {
                if (res.success) {
                    log("load all editions")
                    log(res)
                    for(let e of res.data) {
                        log("load specific edition")
                        log(e)
                        Url.fromUrl(e).get().then(async res2 => {
                            if (res2.success) {
                                const edition = res2.data;
                                if (edition) {
                                    await setEditionList(prevState => [...prevState, {
                                        "year": edition.year,
                                        "name": edition.name
                                    }])
                                }
                            }

                        }).then(async () => {
                            setLoadingEditionList(false)

                        })
                    }
                }
            })
        }
    }, [currentVersion, loadingEditionList, editionList.length, loadingCurrentVersion])

    const ChangeSelectedVersion = async (edition) => {
        await api.setCurrentEdition(edition.year)
        await setCurrentVersion({"year": edition.year, "name": edition.name});
    }

    return (
        <div>
            <p className="details-text">Changing this will affect the whole site. <br/>
                On every page where it has effect it will use the edition you select here. This only list the editions that you have access to.
            </p>
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
        </div>

    )
}