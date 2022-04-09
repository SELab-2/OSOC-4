import React, { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import UserTr from "./UserTr";
import { getJson, postCreate } from "../../utils/json-requests";
import { log } from "../../utils/logger";
import {urlManager} from "../../utils/ApiClient";

export default function ManageUsers(props) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [shownUsers, setShownUsers] = useState([])
    const [toInvite, setToInvite] = useState("");
    const [loading, setLoading] = useState(false)

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        if (!users.length && ! loading) {
            setLoading(true)
            urlManager.getUsers().then(url => getJson(url).then(res => {
                log("manage users:")
                log(res)
                for (let u of res) {
                    getJson(u.id).then(async user => {
                        if (user.data) {
                            await setUsers(prevState => [...prevState, user.data]);
                            await setShownUsers(prevState => [...prevState, user.data]);
                        }
                    }).then(() => setLoading(false))
                }
            }));
        }
    }, [users.length, loading])

    const handleChangeToInvite = (event) => {
        event.preventDefault();
        setToInvite(event.target.value)
    }

    async function handleSubmitInvite(event) {
        log("handle submit invite");
        event.preventDefault();
        const emails = toInvite.trim().split("\n").map(a => a.trim());
        emails.forEach(e => {
            // post to create
            postCreate("users/create", { "email": e }).then(resp => {
                log(resp.data.data)
                if (resp.data.data.id) {
                    postCreate(resp.data.data.id + "/invite", {}, false);
                }
            })
            // post to invite
        })
        log("submit invites");
        log(toInvite);
    }

    async function handleSearchSubmit(event) {
        event.preventDefault();
        log("LOL")
        setShownUsers(users.filter(user => user.name.includes(search)))
        //TODO, does changing userlist happend here or at handleSearch?
    }

    return (
        <div>
            <h4>Invite new users</h4>

            <Form id="invite-users" onSubmit={handleSubmitInvite}>
                <Form.Group controlId="inviteUserTextarea">
                    <Form.Label>List of e-mailadres(ess) of users you want to invite </Form.Label>
                    <Form.Control as="textarea" value={toInvite} onChange={handleChangeToInvite} rows={3} />
                </Form.Group>
                <br />
                <Button variant={"outline-secondary"} type="submit"> Invite users</Button>
            </Form>
            <br />
            <h4>Manage users</h4>
            <Table className={"table-manage-users"}>
                <thead>
                    <tr>
                        <th>
                            <Form onSubmit={handleSearchSubmit}>
                                <Form.Group controlId="searchTable">
                                    <Form.Control type="text" value={search} placeholder={"Search names"} onChange={handleSearch} />
                                </Form.Group>
                            </Form>
                        </th>
                        <th>
                            <p>
                                e-mailadres
                            </p>
                        </th>
                        <th>
                            <p>
                                account status
                            </p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(shownUsers.length) ? (shownUsers.map((item, index) => (<UserTr isMe={item.email === props.me.email} key={item.id} user={item} />))) : null}
                </tbody>
            </Table>
        </div>
    );
}