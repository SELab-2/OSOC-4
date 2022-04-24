import {Dropdown} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to change the current edition,
 *      a link to the current edition will also be visible.
 * @returns {JSX.Element}
 */
export default function EditionDropdownButton(props) {
    const [editionList, setEditionList] = useState([]);
    const currentEdition = props.currentVersion;
    const setCurrentEdition = props.setCurrentVersion;

    const [loadingCurrentVersion, setLoadingCurrentVersion] = useState(false)
    const [loadingEditionList, setLoadingEditionList] = useState(false)

    // fetch the current edition and all the other editions
    useEffect(() => {
        if(currentEdition === undefined && ! loadingCurrentVersion){
            setLoadingCurrentVersion(true);
            Url.fromName(api.current_edition).get().then(res => {
                if (res.success) {
                    const edition = res.data;
                    setCurrentEdition({"year": edition.year, "name": edition.name})
                    setLoadingCurrentVersion(false)
                }

            })
        }

        if (editionList.length === 0 && ! loadingEditionList) {
            setLoadingEditionList(true)
            Url.fromName(api.editions).get().then(async res => {
                if (res.success) {
                    for(let e of res.data) {
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
    }, [currentEdition, loadingEditionList, editionList.length, loadingCurrentVersion, setCurrentEdition])

    /**
     * Changes the current edition
     * @param edition the edition (dictionary with at least the name and the year) to change to
     */
    async function changeSelectedVersion(edition) {
        await api.setCurrentEdition(edition.year)
        await setCurrentEdition({"year": edition.year, "name": edition.name});
    }

    return (
        <div>
            <p className="details-text">Changing this will affect the whole site.
            </p>
            <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                    {(currentEdition) ? currentEdition.name : null}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {(editionList.length) ? (editionList.map((item, index) => (
                        //TODO show selected version in menu and make onClick clean or use other method
                        <Dropdown.Item onClick={() => changeSelectedVersion(item)} key={index} value={item.uri}>{item.name}</Dropdown.Item>
                    ))) : null}
                </Dropdown.Menu>
            </Dropdown>
        </div>

    )
}