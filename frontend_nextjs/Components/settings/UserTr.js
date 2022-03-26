import React, {useState} from "react";
import {Dropdown} from "react-bootstrap";

export default function UserTr(props) {
    const [statusAccount, setStatusAccount] = useState((props.user.active) ? ((props.user.role === 2)? 2 : 1) : 0)
    const roles = ["Disabled", "Coach", "Admin"]

    async function changeStatus(role) {
        setStatusAccount(role)
        //TODO make this change in the backend aswel
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
                    <Dropdown.Menu  className={"dropdown-button"}>
                        <Dropdown.Item onClick={() => changeStatus(2)}>Admin</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeStatus(1)}>Coach</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeStatus(0)}>Disabled</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </td>
        </tr>

    )
}