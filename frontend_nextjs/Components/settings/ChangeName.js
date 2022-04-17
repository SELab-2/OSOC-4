import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {log} from "../../utils/logger";
import {api, Url} from "../../utils/ApiClient";

export default function ChangeName(props) {

    const [savedSuccess, setSavedSuccess] = useState(false)
    const [name, setName] = useState(props.user.name)
    const [changeName, setChangeName] = useState(props.user.name)

    const handleChangeName = (event) => {
        event.preventDefault()
        setChangeName(event.target.value)
    }

    async function handleSubmitChange(event) {
        log("handle submit change name");
        event.preventDefault();

        let response = await Url.fromName(api.users).extend("/me").setBody({"name": changeName}).patch();
        if (response.success) {
            setSavedSuccess(true);
            setName(changeName);
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
                {savedSuccess ? (<p>Changed name successfully</p>): null}
                <Button variant={"outline-secondary"} type="submit">Change name</Button>
            </Form>
        </div>
    )
}