import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to change a user's password.
 * @returns {JSX.Element}
 */
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

    /**
     * This function makes a patch request to the api with the new password of the user
     * @param event
     */
    async function handleSubmitChange(event){
        event.preventDefault()
        if(newPassword === confirmPassword){
            let body = {
                "current_password": currentPassword,
                "new_password": newPassword,
                "confirm_password":confirmPassword
            }

            let response = await Url.fromName(api.me).extend("/password").setBody(body).patch();
            if (response.success) { setChangedSuccess(true); }
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
                    Passwords do not match!
                </Form.Text>)}
                {(changedSuccess)? (<Form.Text className="text-muted">Changed password!</Form.Text>) : null}

            </Form.Group>
            <Button variant="outline-secondary" type="submit">Change password</Button>

        </Form>
    )
}