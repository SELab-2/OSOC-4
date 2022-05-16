import React, {useEffect, useState} from "react";
import {Accordion, Dropdown, Table, Spinner} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import AccordionBody from "react-bootstrap/AccordionBody";
import QuestionTags from "./QuestionTags";
import CreateEdition from "./CreateEdition";
import LoadingPage from "../LoadingPage";
import Hint from "../Hint";
import { Form, Button, Row} from "react-bootstrap";

/**
 * This component displays a settings-screen for all settings regarding editions.
 * @returns {JSX.Element}
 */
export default function EditionSettings() {
    const [loading, setLoading] = useState(true);
    const [edition, setEdition] = useState(undefined);
    const [editionList, setEditionList] = useState(undefined);
    const [reloadQuestionTags, setReloadQuestionTags] = useState(0);
    const [editing, setEditing] = useState(false);
    const [newEdition, setNewEdition] = useState({"name": "", "description": "", "year": 0});
    const [failed, setFailed] = useState(false);
    const [saving, setSaving] = useState(false);

    // fetch the current edition and all the other editions
    useEffect(() => {
        async function fetch() {
            const res = await Url.fromName(api.current_edition).get()
            if (res.success) {
                await setEdition(res.data);
            }
            let resList = await Url.fromName(api.editions).get();
            if (resList.success) {
                resList = await Promise.all(resList.data.map(editionUrl => Url.fromUrl(editionUrl).get().then(r => (r.success)? r.data : null)));
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
        setEditionList([edition, ...editionList]);
    }

    async function handleSaved(event) {
        event.preventDefault();
        setSaving(true);
        Url.fromName(api.current_edition).setBody(newEdition).patch().then(res =>{
            if(res.success){
                let newEdition2 = {...edition};
                newEdition2["name"] = newEdition.name;
                newEdition2["description"] = newEdition.description;
                setEdition(newEdition2);
                setSaving(false);
                setEditing(false);
            } else {
                setSaving(false);
                setFailed(true);
            }
        })
    }

    const editClicked = (event) => {
        setNewEdition({"name": "", "description": "", "year": edition.year});
        setFailed(false);
        setEditing(true);
    }

    const handleTryAgain = (event) => {
        setFailed(false)
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
            <Table>
                <tbody>
                    <tr>
                        <td >
                            {(! editing) ? (
                                <div>
                                    <h1>{(edition.name) ? edition.name : "No name available"}</h1>
                                    <p>{(edition.description) ? edition.description : "No description available"}</p>
                                </div>
                            ) : ( 
                                <div>
                                    <Form className="form-edition-detail">
                                        <Form.Group className="mb-3">
                                            <Form.Control type="text" name="name" disabled={saving || failed} placeholder="Enter new name" value={newEdition.name} onChange={(ev => setNewEdition({...newEdition, ["name"]: ev.target.value}))}/>
                                        </Form.Group>
                                        <Form.Group className="mb-3" >
                                            <Form.Control type="text" name="description" disabled={saving || failed} placeholder="Enter new description" value={newEdition.description} onChange={(ev => setNewEdition({...newEdition, ["description"]: ev.target.value}))}/>
                                        </Form.Group>               
                                    </Form>
                                    {saving &&
                                        <Button variant="primary" disabled>
                                            Saving...
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        </Button>}
                                    {failed && 
                                        <div>
                                            <Form.Label>Something went wrong, please try again</Form.Label>
                                            <br/>
                                            <Button variant={"primary"} onClick={handleTryAgain} className="button-edition-detail">Try again</Button>
                                            <Button variant="secondary" onClick={(ev) => {
                                                setEditing(false);
                                            }} >
                                                Cancel
                                            </Button>
                                        </div>}
                                    {!saving && !failed &&
                                        <div>
                                            <Button variant="primary" onClick={handleSaved} className="button-edition-detail">Save</Button>
                                            <Button variant="secondary" onClick={(ev) => {
                                                setEditing(false);
                                            }} >
                                                Cancel
                                            </Button>
                                        </div>    
                                    }
                                </div>
                            )}
                        </td>
                        <td className="form-column">
                            {!editing && (
                                <Hint message="Edit edition">
                                    <Button onClick={editClicked}>
                                        Edit
                                    </Button>
                                </Hint>
                            )}
                            
                        </td>
                    </tr>
                </tbody>
            </Table>
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
                                <Dropdown.Toggle variant="primary" id="dropdown-basic">
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
                        <h3>Question-tags</h3>
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