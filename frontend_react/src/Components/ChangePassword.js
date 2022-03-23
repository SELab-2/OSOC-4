import React, {useState} from "react";
import {Button, Form} from "react-bootstrap";

export default function ChangePassword(props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changedSuccess, setChangedSuccess] = useState(false);

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

    async function handleSubmitChange(event){
        event.preventDefault()
        console.log("works")
        console.log(event.target.value)
        console.log(newPassword)
    }

    return(
        <Form onSubmit={handleSubmitChange}>
            {/*<div>*/}
            {/*    <input type="text" name="name" value={currentPassword} onChange={handleChangeCurrentPassword} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <input type="text" name="name" value={newPassword} onChange={handleChangeNewPassword} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <input type="text" name="name" value={confirmPassword} onChange={handleChangeConfirmPassword} />*/}
            {/*    {(newPassword === confirmPassword) ? null : (<p>Password doesn't match!</p>)}*/}
            {/*</div>*/}

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

            </Form.Group>
            <Button variant="outline-secondary" type="submit">Change password</Button>
            {(changedSuccess)? (<label>Changed password!</label>) : null}
        </Form>
    )
}