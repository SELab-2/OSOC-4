import React, { useEffect, useState } from "react";
import {Button, Form, Modal, Table, Spinner} from "react-bootstrap";
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
        setSent(false);
        setSending(false);
        setShow(false);
        setToInvite("");
    }

    const handleTryAgain = () => {
        setFail(false);
        setSent(false);
        setSending(false);
        setToInvite("");
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
                } else {
                    setSending(false);
                    setFail(true);
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
                                    {(sent || fail) && <br/>}
                                    {(fail) && <Form.Label>Something went wrong, please try again</Form.Label>}
                                    {(sent) && <Form.Label>Invites have been sent!</Form.Label>}
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                {sent && <Button variant={"primary"} onClick={handleClose}>Close</Button>}
                                {fail && <Button variant={"primary"} onClick={handleTryAgain}>Try again</Button>} 
                                {sending && 
                                    <Button variant="primary" disabled className="invite-button">
                                        Sending invites...
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                }
                                {!sent && !fail && !sending && 
                                    <div>
                                        <Button variant={"secondary"} onClick={handleClose}>Close</Button>
                                        <Button variant={"primary"} type="submit" className="invite-button">Invite users</Button>
                                    </div>}
                            </Modal.Footer> 
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
