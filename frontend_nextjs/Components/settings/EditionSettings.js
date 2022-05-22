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
import { Form, Button} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';

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
    const [saving, setSaving] = useState(false);

    /**
     * fetch the current edition and all the other editions
     */
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

    /**
     * Handle the event of pressing the save button. The edition is patched to the database.
     * @param event The event of pressing the save button.
     * @returns {Promise<void>}
     */
    async function handleSaved(event) {
        event.preventDefault();
        setSaving(true);
        Url.fromName(api.current_edition).setBody(newEdition).patch().then(res =>{
            if(res.success){
                let newEdition2 = {...edition};
                newEdition2["name"] = newEdition.name;
                newEdition2["description"] = newEdition.description;
                toast.success("Edited edition successfully");
                setEdition(newEdition2);
                setSaving(false);
                setEditing(false);
            } else {
                toast.errory("Something went wrong, please try again");
                setSaving(false);
                setEditing(false);
            }
        })
    }

    /**
     * Called when pushing the 'edit' button. It changes the state variables so that the edition fields are editable.
     * @param event
     */
    const editClicked = (event) => {
        setNewEdition({"name": edition.name, "description": edition.description, "year": edition.year});
        setEditing(true);
    }

    /**
     * Changes the current edition
     * @param edition the edition (dictionary with at least the name and the year) to change to
     */
    async function changeSelectedVersion(edition) {
        await api.setCurrentEdition(edition.year)
        await setEdition({"year": edition.year, "name": edition.name});
    }

    /**
     * If the page is loading, return the loading animation.
     */
    if (loading) {
        return (<LoadingPage/>);
    }

    /**
     * Return the html of the EditionSettings component.
     */
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
                                            <Form.Control type="text" name="name" disabled={saving} placeholder="Enter new name" value={newEdition.name} onChange={(ev => setNewEdition({...newEdition, ["name"]: ev.target.value}))}/>
                                        </Form.Group>
                                        <Form.Group className="mb-3" >
                                            <Form.Control type="text" name="description" disabled={saving} placeholder="Enter new description" value={newEdition.description} onChange={(ev => setNewEdition({...newEdition, ["description"]: ev.target.value}))}/>
                                        </Form.Group>               
                                    </Form>
                                    {saving ?
                                        <Button variant="primary" disabled>
                                            Saving...
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        </Button> 
                                        :
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
                        <h3>Choose a different edition</h3>
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
                            <QuestionTags reload={reloadQuestionTags} setReload={setReloadQuestionTags}/>
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
            <ToastContainer autoClose={4000}/>
        </div>
    );
}