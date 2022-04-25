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

    const handleChangeEditionYear = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setEditionYear(event.target.value);
    }

    const handleChangeEditionName = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setEditionName(event.target.value);
    }

    const handleChangeEditionDescription = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setEditionDescription(event.target.value);
    }

    /**
     * This function makes a post request to the api to create a new edition
     * @param event
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
            <Button variant="outline-secondary" type="submit">Create edition</Button>
            <Form.Group>
                {(changedSuccess)? (<Form.Text className="text-muted">Edition created!</Form.Text>) : null}
            </Form.Group>
        </Form>
    )
}