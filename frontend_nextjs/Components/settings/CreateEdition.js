import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to create a new edition.
 * @returns {JSX.Element}
 */
 export default function CreateEdition(props) {
    const [editionYear, setEditionYear] = useState("");
    const [editionName, setEditionName] = useState("");
    const [editionDescription, setEditionDescription] = useState("");
    const [changedSuccess, setChangedSuccess] = useState(false);

    /**
     * This function the change of the edition year text field.
     * @param event the event of changing the edition year text field.
     */
    const handleChangeEditionYear = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setEditionYear(event.target.value);
    }

  /**
   * This function the change of the edition name text field.
   * @param event the event of changing the edition name text field.
   */
    const handleChangeEditionName = (event) => {
      event.preventDefault()
      setChangedSuccess(false)
      setEditionName(event.target.value);
    }

    /**
     * This function the change of the edition description text field.
     * @param event the event of changing the edition description text field.
     */
    const handleChangeEditionDescription = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setEditionDescription(event.target.value);
    }

    /**
     * This function makes a post request to the api to create a new edition
     * @param event the event of pressing the submit button.
     */
    async function handleSubmitChange(event){
        event.preventDefault()
        let body = {
            "year": editionYear,
            "name": editionName,
            "description":editionDescription
        }

        let response = await Url.fromName(api.editions).extend("/create").setBody(body).post();
        if (response.success) { setChangedSuccess(true); props.addToEditionList(body)}
    }

    /**
     * Return the html of the CreateEdition component.
     */
    return(
        <Form onSubmit={handleSubmitChange}>
            <Form.Group className="mb-3" controlId="editionYear">
                <Form.Label>Year</Form.Label>
                <Form.Control type="text" placeholder="Year" value={editionYear} onChange={handleChangeEditionYear} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editionName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Name" value={editionName} onChange={handleChangeEditionName} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editionDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" placeholder="Description" value={editionDescription} onChange={handleChangeEditionDescription}/>
            </Form.Group>
            <Button variant="primary" type="submit">Create edition</Button>
            <Form.Group>
                {(changedSuccess)? (<Form.Text className="text-muted">Edition created!</Form.Text>) : null}
            </Form.Group>
        </Form>
    )
}