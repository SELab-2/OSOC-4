import React, { useEffect, useState } from "react";
import {Button, Col, Form, Row, Table} from "react-bootstrap";
import UserTr from "./UserTr";
import {api, Url} from "../../utils/ApiClient";
import CheckboxFilter from "../CheckboxFilter";

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
        if (Boolean(props.initialize)) {
            if (!users.length && !loading) {
                setLoading(true)
                Url.fromName(api.users).get().then(res => {
                    if (res.success) {
                        for (let u of res.data) {
                            Url.fromUrl(u.id).get().then(async res2 => {
                                if (res2.success) {
                                    const user = res2.data
                                    if (user) {
                                        await setUsers(prevState => [...prevState, user.data]);
                                        await setShownUsers(prevState => [...prevState, user.data]);
                                    }
                                }
                            }).then(() => setLoading(false))
                        }
                    }
                });
            }
        }
    }, [users.length, loading, props.initialize])

    const handleChangeToInvite = (event) => {
        event.preventDefault();
        setToInvite(event.target.value)
    }

    async function handleSubmitInvite(event) {
        event.preventDefault();
        const emails = toInvite.trim().split("\n").map(a => a.trim());
        emails.forEach(email => {
            // post to create
            Url.fromName(api.users).extend("/create").setBody({"email": email}).post().then(resp => {
                if (resp.success) {
                    resp = resp.data
                    if (resp.data.id) {
                        Url.fromUrl(resp.data.id).extend("/invite").post();
                    }
                }
            })
        })
    }

    async function handleSearchSubmit(event) {
        event.preventDefault();
        setShownUsers(users.filter(user => user.name.toLowerCase().includes(search.toLowerCase())))
    }

    const [filters, setFilters] = useState({
        "show-all-users": true,
        "show-approved": false,
        "show-unapproved": false,
        "show-inactive": false
    });

    function updateFilters(ev) {
        const temp = {
            "show-all-users": false,
            "show-approved": false,
            "show-unapproved": false,
            "show-inactive": false
        }
        temp[ev.target.id] = true
        setFilters(temp);

        setShownUsers([...users.filter(user => {
            if (!user.name.toLowerCase().includes(search.toLowerCase())) {return false;}
            if (ev.target.id === "show-all-users") {return true;}
            if (ev.target.id === "show-approved") {return user.approved;}
            if (ev.target.id === "show-unapproved") {return user.active && !user.approved;}
            if (ev.target.id === "show-inactive") {return !user.active;}
        })]);
    }

    return (
        <div>
            <h4>Invite new users</h4>

            <Form id="invite-users" onSubmit={handleSubmitInvite}>
                <Form.Group controlId="inviteUserTextarea">
                    <Form.Label>List of email-address(es) of the users you want to invite </Form.Label>
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
                        <div key={`inline-radio`} className="mb-3">
                            <Form.Check
                                label="All users"
                                name="group-users"
                                type="radio"
                                id="show-all-users"
                                checked={filters["show-all-users"]}
                                onClick={updateFilters}
                            />
                            <Form.Check
                                label="Approved users"
                                name="group-users"
                                type="radio"
                                id="show-approved"
                                checked={filters["show-approved"]}
                                onClick={updateFilters}
                            />
                            <Form.Check
                                label="Not yet approved users"
                                name="group-users"
                                type="radio"
                                id="show-unapproved"
                                checked={filters["show-unapproved"]}
                                onClick={updateFilters}
                            />
                            <Form.Check
                                label="Not yet active users"
                                name="group-users"
                                type="radio"
                                id="show-inactive"
                                checked={filters["show-inactive"]}
                                onClick={updateFilters}
                            />
                        </div>
                    </tr>
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