import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {log} from "../../utils/logger";
import {patchEdit, postCreate} from "../../utils/json-requests";
import {useSession} from "next-auth/react";

export default function ChangeName(props) {

    const [savedSuccess, setSavedSuccess] = useState(false)
    const [name, setName] = useState(props.name)


    const handleChangeName = (event) => {
        event.preventDefault()
        setName(event.target.value)
    }

    async function handleSubmitChange(event) {
        log("handle submit change name");
        event.preventDefault();

        let body = {
            "name": name,
            "role": props.user.role,
            "active": props.user.active,
            "approved": props.user.approved,
            "disabled": props.user.disabled
        }

        let response = await patchEdit(props.userid, body);
        if (response.success) {
            setSavedSuccess(true);
            setName(name);
        }
    }

    return (
        <div>
            <p>Current name: <span className={"details-info"}>{props.name}</span></p>
            <Form onSubmit={handleSubmitChange}>
                <Form.Group className="mb-3" controlId="newName">
                    <Form.Label>Change name to:</Form.Label>
                    <Form.Control type="text" value={name} onChange={handleChangeName} />
                </Form.Group>
                {savedSuccess ? (<p>Changed name successfully</p>): null}
                <Button variant={"outline-secondary"} type="submit">Change name</Button>
            </Form>
        </div>
    )
}