import React, { useEffect, useState } from "react";
import {Button, Form, Modal, Table} from "react-bootstrap";
import UserTr from "./UserTr";
import {api, Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen where you can manage the users in the application
 * For each user you can see:
 * - name
 * - email
 * - role (Admin or Coach) or approve button (or not yet active)
 * - revoke access button, which soft deletes a user
 *      (he won't have access anymore,
 *      but all action he did (like a suggestion)
 *      will still be visible that he did that action)
 *
 * @param props
 * @returns {JSX.Element}
 */
export default function ManageUsers(props) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [shownUsers, setShownUsers] = useState([])
    const [toInvite, setToInvite] = useState("");
    const [loading, setLoading] = useState(false)
    const [show, setShow] = useState(false);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [fail, setFail] = useState(false);

    const handleClose = () => {
        setFail(false);
        setToInvite("");
        setShow(false);
        setSent(false);
        setSending(false);
    }

    const handleShow = () => setShow(true);

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

    /**
     * This function makes a post request to the api to create a new user with given email address,
     * after that it makes a post request to invite the (new) user
     * @param event
     * @returns {Promise<void>}
     */
    async function handleSubmitInvite(event) {
        event.preventDefault();
        setSending(true);
        const emails = toInvite.trim().split("\n").map(a => a.trim());
        await Promise.all(emails.map(email =>
            Url.fromName(api.users).extend("/create").setBody({"email": email}).post().then(async resp => {
                if (resp.success && resp.data.data.id) {
                    await Url.fromUrl(resp.data.data.id).extend("/invite").post().then(async resp2 => {
                        setSending(false);
                        if (resp2.success) {
                            setSent(true);
                        } else {
                            setFail(true);
                        }
                    });
                }
            }))
        );
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

    /**
     * Gets called when a filter gets updated, updates the list of users you can see
     * @param ev
     */
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
            <Button variant="primary" onClick={handleShow} className="invite-users-button">
                Invite new users
            </Button>
                <Modal 
                    show={show} 
                    onHide={handleClose}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Invite users</Modal.Title>
                    </Modal.Header>
                        <Form id="invite-users" onSubmit={handleSubmitInvite}>
                        <Modal.Body>
                            <Form.Group controlId="inviteUserTextarea">
                                <Form.Label>List of email-address(es) of the users you want to invite, seperated from each other by an newline</Form.Label>
                                {(sent || sending || fail) ? (
                                    <Form.Control as="textarea" value={toInvite} onChange={handleChangeToInvite} rows={3} disabled/>
                                ) : (
                                    <Form.Control as="textarea" value={toInvite} onChange={handleChangeToInvite} rows={3} />
                                )}
                                {(sending || sent) ? <br/> : null}
                                {(sending)? <Form.Label>Trying to sent invites!</Form.Label>: null}
                                {(sent)? <Form.Label>Invites have been sent!</Form.Label>: null}
                                {(fail)? <Form.Label>Something went wrong, please try again</Form.Label>: null}
                            </Form.Group>
                        </Modal.Body>
                            {(sent) ? 
                            (
                                <Modal.Footer>
                                    <Button variant={"primary"} onClick={handleClose}>Close</Button>
                                </Modal.Footer> 
                            ):(
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                                    <Button variant={"primary"} type="submit">Invite users</Button>
                                </Modal.Footer>
                            )}
                        </Form>
                </Modal>

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
                        </thead>
                </Table>
                <Table responsive>
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
