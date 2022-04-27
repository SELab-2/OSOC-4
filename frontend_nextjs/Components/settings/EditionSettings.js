import React, {useEffect, useState} from "react";
import {Accordion, Dropdown} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import AccordionBody from "react-bootstrap/AccordionBody";
import QuestionTags from "./QuestionTags";
import CreateEdition from "./CreateEdition";
import LoadingPage from "../LoadingPage";

/**
 * This component displays a settings-screen for all settings regarding editions.
 * @returns {JSX.Element}
 */
export default function EditionSettings() {
    const [loading, setLoading] = useState(true);
    const [edition, setEdition] = useState(undefined);
    const [editionList, setEditionList] = useState(undefined);
    const [reloadQuestionTags, setReloadQuestionTags] = useState(0);

    // fetch the current edition and all the other editions
    useEffect(() => {
        async function fetch() {
            const res = await Url.fromName(api.current_edition).get()
            if (res.success) {
                console.log("edition")
                console.log(res.data)
                await setEdition(res.data);
            }
            let resList = await Url.fromName(api.editions).get();
            if (resList.success) {
                resList = await Promise.all(resList.data.map(editionUrl => Url.fromUrl(editionUrl).get().then(r => (r.success)? r.data : null)));
                console.log("edition list")
                console.log(resList)
                setEditionList(resList)
            }
            setLoading(false);
        }
        fetch();
    }, [])

    /**
     * Add an edition to the list of the dropdown
     * @param edition
     */
    function addToEditionList(edition) {
        console.log("create")
        console.log((edition))
        setEditionList([edition, ...editionList]);
    }

    /**
     * Changes the current edition
     * @param edition the edition (dictionary with at least the name and the year) to change to
     */
    async function changeSelectedVersion(edition) {
        await api.setCurrentEdition(edition.year)
        await setEdition({"year": edition.year, "name": edition.name});
    }


    if (loading) {
        return (<LoadingPage/>);
    }
    return (
        <div className="body-editiondetail">
            <h1>{edition.name}</h1>
            <p>{(edition.description) ? edition.description : "No description available"}</p>
            <Accordion>
                <AccordionItem eventKey="0">
                    <AccordionHeader>
                        <h3>Change edition</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div>
                            <p className="details-text">Changing this will affect the whole site.
                            </p>
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                    {(edition) ? edition.name : null}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {(editionList.length) ? (editionList.map((item, index) => (
                                        <Dropdown.Item onClick={() => changeSelectedVersion(item)} key={index} value={item.uri}>{item.name}</Dropdown.Item>
                                    ))) : null}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem eventKey="1" onClick={() => setReloadQuestionTags(p => p + 1)}>
                    <AccordionHeader>
                        <h3>Question tags</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div className="questiontags">
                            <QuestionTags reload={reloadQuestionTags}/>
                        </div>
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem eventKey="2">
                    <AccordionHeader>
                        <h3>Create new edition</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <CreateEdition addToEditionList={addToEditionList}/>
                    </AccordionBody>
                </AccordionItem>

            </Accordion>
        </div>
    );
}