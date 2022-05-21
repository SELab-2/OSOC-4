import React, {useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to create a new edition.
 * @returns {JSX.Element}
 */
 export default function CreateEdition(props) {
    const [editionYear, setEditionYear] = useState("");
    const [editionName, setEditionName] = useState("");
    const [editionDescription, setEditionDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChangeEditionYear = (event) => {
        event.preventDefault()
        setEditionYear(event.target.value);
    }

    const handleChangeEditionName = (event) => {
        event.preventDefault()
        setEditionName(event.target.value);
    }

    const handleChangeEditionDescription = (event) => {
        event.preventDefault()
        setEditionDescription(event.target.value);
    }

    /**
     * This function makes a post request to the api to create a new edition
     * @param event
     */
    async function handleSubmitChange(event){
        setSaving(true);
        event.preventDefault()
        let body = {
            "year": editionYear,
            "name": editionName,
            "description":editionDescription
        }

        let response = await Url.fromName(api.editions).extend("/create").setBody(body).post();
        if (response.success) {
            props.addToEditionList(body);
            toast.success("Created new edition");
        } else {
            toast.error("Something went wrong, please try again");
        }
        setSaving(false);
        setEditionYear("");
        setEditionName("");
        setEditionDescription("");
    }

    return(
        <div>
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
                {saving ?
                <Button variant="primary" disabled>
                Creating new edition...
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
                </Button> 
                :<Button variant="primary" type="submit">Create edition</Button>}
            </Form>
            <ToastContainer autoClose={4000}/>
        </div>
    )
}