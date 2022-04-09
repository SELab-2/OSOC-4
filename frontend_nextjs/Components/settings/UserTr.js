import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";
import {log} from "../../utils/logger";
import {urlManager} from "../../utils/ApiClient";
import {patchEdit} from "../../utils/json-requests";

export default function UserTr(props) {
    const [statusAccount, setStatusAccount] = useState((props.user.disabled) ? 3 : ((props.user.role === 2)? 2 : 1))
    const roles = ["No role", "Coach", "Admin", "Disabled"]

    async function changeStatus(role) {
        if(props.isMe){
            return
        }

        let user_url = await urlManager.getUsers();
        let json = props.user
        json.disabled = role === 0;
        json.role = role
        log(json)
        let response = await patchEdit(user_url + "/" + props.user.id, json)
        log(response)
        if (response.success){setStatusAccount(role)}
    }

    return (
        <tr key={props.user.id}>
            <td>
                {props.user.name}
            </td>
            <td>
                {props.user.email}
            </td>
            <td>

                <Dropdown className={"dropdown-button"}>
                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                        {roles[statusAccount]}
                    </Dropdown.Toggle>
                    {props.isMe ? null :
                        <Dropdown.Menu className={"dropdown-button"} >
                            <Dropdown.Item active={statusAccount === 2} onClick={() => changeStatus(2)}>Admin</Dropdown.Item>
                            <Dropdown.Item active={statusAccount === 1} onClick={() => changeStatus(1)}>Coach</Dropdown.Item>
                            <Dropdown.Item active={statusAccount === 0} onClick={() => changeStatus(0)}>No role</Dropdown.Item>
                            <Dropdown.Item active={statusAccount === 3} onClick={() => changeStatus(2)}>Disabled</Dropdown.Item>
                        </Dropdown.Menu> }
                </Dropdown>
            </td>
        </tr>

    )
}