import React, {useState} from "react";
import {Button, Dropdown} from "react-bootstrap";
import {log} from "../../utils/logger";
import {api, Url} from "../../utils/ApiClient";

export default function UserTr(props) {
    const [statusAccount, setStatusAccount] = useState(props.user.role)
    const roles = ["No role", "Coach", "Admin", "Disabled"]
    const [active, setActive] = useState(props.user.active);
    const [approved, setApproved] = useState(props.user.approved);
    const [disabled, setDisabled] = useState(props.user.disabled);

    async function changeStatus(role) {
        if(props.isMe){
            return
        }

        let json = props.user
        json.disabled = role === 0;
        json.role = role
        let response = await Url.fromName(api.users).extend("/" + props.user.id).setBody(json).patch();
        if (response.success){setStatusAccount(role)}
    }

    async function approveUser() {
        const res = await Url.fromName(api.users).extend("/" + props.user.id + "/approve").post()
        if (res.success) {
            setApproved(true);
        }
    }

    async function deleteUser() {
        const res = await Url.fromName(api.users).extend("/" + props.user.id).delete();
        if (res.success) {
            setDisabled(true);
        }
    }

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
                    {roles[statusAccount]}
                </Dropdown.Toggle>
                {props.isMe ? null :
                    <Dropdown.Menu aria-disabled className={"dropdown-button"} >
                        <Dropdown.Item active={statusAccount === 2} onClick={() => changeStatus(2)}>Admin</Dropdown.Item>
                        <Dropdown.Item active={statusAccount === 1} onClick={() => changeStatus(1)}>Coach</Dropdown.Item>
                        <Dropdown.Item active={statusAccount === 0} onClick={() => changeStatus(0)}>No role</Dropdown.Item>
                    </Dropdown.Menu>
                }
            </Dropdown>)
    }

    if (disabled) {
        return null;
    }

    return (
        <tr key={props.user.id}>
            <td>{props.user.name}</td>

            <td>{props.user.email}</td>

            <td>
                {getStatusField()}
            </td>

            <td>
                {props.isMe ? null : <Button className="user-button-remove" onClick={deleteUser}>Revoke access</Button>}
            </td>

        </tr>

    )
}