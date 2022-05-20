import React, {useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";
import {log} from "../../utils/logger";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to change a user's name.
 * @returns {JSX.Element}
 */
export default function ChangeName(props) {

    const [savedSuccess, setSavedSuccess] = useState(false)
    const [name, setName] = useState(props.user.name)
    const [changeName, setChangeName] = useState(props.user.name)
    const [saving, setSaving] = useState(false);
    const [fail, setFail] = useState(false);

    const handleChangeName = (event) => {
        event.preventDefault()
        setChangeName(event.target.value)
    }

    /**
     * This function makes a patch request to the api with the new name of the user
     * @param event
     */
    async function handleSubmitChange(event) {
        log("handle submit change name");
        event.preventDefault();
        setSavedSuccess(false);
        setFail(false);
        setSaving(true);
        let response = await Url.fromName(api.myself).setBody({"name": changeName}).patch();
        if (response.success) {
            setSaving(false);
            setSavedSuccess(true);
            setName(changeName);
        } else {
            setSaving(false);
            setFail(true);
        }
    }

    return (
        <div>
            <p>Current name: <span className={"details-info"}>{name}</span></p>
            <Form onSubmit={handleSubmitChange}>
                <Form.Group className="mb-3" controlId="newName">
                    <Form.Label>Change name to:</Form.Label>
                    <Form.Control type="text" value={changeName} onChange={handleChangeName} />
                </Form.Group>
                {savedSuccess &&<p>Changed name successfully</p>}
                {fail && <p>Something went wrong, please try again</p>}
                {!saving &&<Button variant={"primary"} type="submit">Change name</Button>}
                {saving && 
                <Button variant="primary" disabled>
                  Saving changes...
                  <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                  />
                </Button>}
            </Form>
        </div>
    )
}