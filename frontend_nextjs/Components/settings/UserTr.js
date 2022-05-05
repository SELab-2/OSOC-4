import React, { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { api, Url } from "../../utils/ApiClient";

/**
 * This component displays a row of the ManageUsers settings-screen, this component represents a single user in the list
 * @returns {JSX.Element}
 */
export default function UserTr(props) {
    const [role, setRole] = useState(props.user.role);
    const roles = ["Coach", "Admin"];
    const [active, setActive] = useState(props.user.active);
    const [approved, setApproved] = useState(props.user.approved);
    const [disabled, setDisabled] = useState(props.user.disabled);

    /**
     * Changes the role of a user, api does patch request
     * @param role
     */
    async function changeRole(role) {
        if (props.isMe) {
            return
        }
        let response = await Url.fromName(api.users).extend("/" + props.user.id).setBody({"role": role}).patch();
        if (response.success) { setRole(role); }
    }

    /**
     * Approves a user, makes a post request to users/id/approve
     * @returns {Promise<void>}
     */
    async function approveUser() {
        const res = await Url.fromName(api.users).extend("/" + props.user.id + "/approve").post()
        if (res.success) {
            setApproved(true);
        }
    }

    /**
     * Deletes a user, makes a delete request to the user's url
     * @returns {Promise<void>}
     */
    async function deleteUser() {
        const res = await Url.fromName(api.users).extend("/" + props.user.id).delete();
        if (res.success) {
            setDisabled(true);
        }
    }

    /**
     * This function returns a:
     * - message-display "not yet active" when the user has not yet activated his/her account
     * - button "approve" which approves the user when clicked on, the user has to be active and not approved
     * - dropdown showing the current user role, and you can select another role for the user
     * @returns {JSX.Element}
     */
    function getStatusField() {
        if (!active) {
            return (<Button disabled className="user-button-inactive">Not yet active</Button>);
        }
        if (!approved) {
            return (<Button className="user-button-unapproved" onClick={approveUser}>Approve user</Button>)
        }
        return (
            <Dropdown className={"dropdown-button"}>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                    {(role == 2)? "Admin" : "Coach"}
                </Dropdown.Toggle>
                {props.isMe ? null :
                    <Dropdown.Menu aria-disabled className={"dropdown-button"} >
                        <Dropdown.Item active={role === 2} onClick={() => changeRole(2)}>Admin</Dropdown.Item>
                        <Dropdown.Item active={role === 1} onClick={() => changeRole(1)}>Coach</Dropdown.Item>
                    </Dropdown.Menu>
                }
            </Dropdown>)
    }

    // if the user is disabled, we don't show him at all
    if (disabled) {
        return null;
    }

    return (
        <tr key={props.user.id}>
            <td>{props.user.name}</td>
            <td>{props.user.email}</td>
            <td>{getStatusField()}</td>
            <td>{props.isMe ? null : <Button className="user-button-remove" onClick={deleteUser}>Revoke access</Button>}</td>
        </tr>

    )
}