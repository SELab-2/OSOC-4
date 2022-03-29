import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {log} from "../../utils/logger";
import {postCreate} from "../../utils/json-requests";

export default function ChangePassword(props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changedSuccess, setChangedSuccess] = useState(false);

    const handleChangeCurrentPassword = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setCurrentPassword(event.target.value);
    }

    const handleChangeNewPassword = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setNewPassword(event.target.value);
    }

    const handleChangeConfirmPassword = (event) => {
        event.preventDefault()
        setChangedSuccess(false)
        setConfirmPassword(event.target.value);
    }

    async function handleSubmitChange(event){
        event.preventDefault()

        if(newPassword === confirmPassword){
            let body = {"current_password": currentPassword, "new_password": newPassword, "confirmation_password":confirmPassword}
            let url = props.userid + "/change-password"
            log(url)
            let response = await postCreate(url, body)
            log(response)
            if (response.success) { setChangedSuccess(true); }
            log(newPassword)
        }
    }

    return(
        <Form onSubmit={handleSubmitChange}>
            <Form.Group className="mb-3" controlId="currentPassword">
                <Form.Label>Current password</Form.Label>
                <Form.Control type="password" placeholder="Current password" value={currentPassword} onChange={handleChangeCurrentPassword} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New password</Form.Label>
                <Form.Control type="password" placeholder="New password" value={newPassword} onChange={handleChangeNewPassword}/>
            </Form.Group>
            <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Repeat new password</Form.Label>
                <Form.Control type="password" placeholder="Confirm password" value={confirmPassword} onChange={handleChangeConfirmPassword}/>
                {(newPassword === confirmPassword) ? null : (<Form.Text className="text-muted">
                    Passwords don't match!
                </Form.Text>)}
                {(changedSuccess)? (<Form.Text className="text-muted">Changed password!</Form.Text>) : null}

            </Form.Group>
            <Button variant="outline-secondary" type="submit">Change password</Button>

        </Form>
    )
}