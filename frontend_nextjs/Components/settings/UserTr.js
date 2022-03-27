import React, {useState} from "react";
import {Dropdown, Form} from "react-bootstrap";
import {postCreate} from "../../utils/json-requests";
import {log} from "../../utils/logger";

export default function UserTr(props) {
    const [roleAccount, setRoleAccount] = useState(props.user.role)
    const [statusUser, setStatusUser] = useState(props.user.active)

    const roles = ["No role", "Coach", "Admin"]

    async function changeRole(role) {
        log("handle change role")
        let url = "users/" + props.user.id + "/role"

        let response = await postCreate(url, {"role" : role})
        log(response)
        if (response.success) {
            setRoleAccount(role)
        }
    }

    async function changeStatusUser(event){
        event.preventDefault()
        let url = "users/" + props.user.id + "/active"

        let response = await postCreate(url, {"active": ! statusUser})
        log(response)
        if (response.success) {
            setStatusUser(prevState => ! prevState)
        }
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
                        {roles[roleAccount]}
                    </Dropdown.Toggle>
                    <Dropdown.Menu  className={"dropdown-button"}>
                        <Dropdown.Item onClick={() => changeRole(2)}>Admin</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeRole(1)}>Coach</Dropdown.Item>
                        <Dropdown.Item onClick={() => changeRole(0)}>No role</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </td>
            <td>
                <Form>
                    <Form.Check type={"checkbox"} id={"checkbox"} checked={statusUser} onChange={changeStatusUser}/>
                </Form>
            </td>
        </tr>

    )
}