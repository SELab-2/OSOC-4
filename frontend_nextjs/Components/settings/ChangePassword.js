import React, {useState} from "react";
import {Button, Form, Spinner} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen to change a user's password.
 * @returns {JSX.Element}
 */
export default function ChangePassword(props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const handleChangeCurrentPassword = (event) => {
        event.preventDefault()
        setCurrentPassword(event.target.value);
    }

    const handleChangeNewPassword = (event) => {
        event.preventDefault()
        setNewPassword(event.target.value);
    }

    const handleChangeConfirmPassword = (event) => {
        event.preventDefault()
        setConfirmPassword(event.target.value);
    }

    /**
     * This function makes a patch request to the api with the new password of the user
     * @param event
     */
    async function handleSubmitChange(event){
        event.preventDefault()
        if (newPassword.length <= 11) { toast.error("Password should be at least 12 characters long!"); return; }
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match!"); return; }
        setSaving(true);
        let body = {
            "current_password": currentPassword,
            "new_password": newPassword,
            "confirm_password":confirmPassword
        }

        let response = await Url.fromName(api.myself).extend("/password").setBody(body).patch();
        if (response.success) { 
            setSaving(false);
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            toast.error("Something went wrong, please try again");
            setSaving(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    }

    return(
        <div>
            <Form onSubmit={handleSubmitChange}>
                <Form.Group className="mb-3" controlId="currentPassword">
                    <Form.Label>Current password</Form.Label>
                    <Form.Control type="password" placeholder="Current password" value={currentPassword} onChange={handleChangeCurrentPassword} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New password</Form.Label>
                    <Form.Control type="password" placeholder="New password" value={newPassword} onChange={handleChangeNewPassword}/>
                    {newPassword.length < 11 &&<Form.Text id="passwordHelpBlock" muted>Password should be at least 12 characters long!</Form.Text>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Repeat new password</Form.Label>
                    <Form.Control type="password" placeholder="Confirm password" value={confirmPassword} onChange={handleChangeConfirmPassword}/>
                    {newPassword !== confirmPassword && <Form.Text id="passwordHelpBlock" muted>Passwords do not match!</Form.Text>}
                </Form.Group>
                {saving ?
                    <Button variant="primary" disabled>
                    Saving changes...
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    </Button> 
                    :
                    <Button variant="primary" type="submit" disabled={newPassword.length <= 11 || newPassword !== confirmPassword}>Change password</Button>}
                
            </Form>
            <ToastContainer autoClose={4000}/>
        </div>
    )
}