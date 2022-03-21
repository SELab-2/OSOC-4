import React, {useEffect, useState} from "react";
import {getJson, postCreate} from "../utils/json-requests";
import {Table} from "react-bootstrap";
import data from "bootstrap/js/src/dom/data";

export default function ManageUsers() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [toInvite, setToInvite] = useState("");

    const handleSearch = (event) => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        if (!users.length) {
            getJson("/users").then(res => {
                console.log("manage users:")
                console.log(res)
                for (let u of res.data) {
                    getJson(u.id, false).then(async user => {
                        if (user.data) {await setUsers(prevState => [...prevState, user.data]);}
                    })
                }
            });
        }
    })

    const handleChangeToInvite = (event) => {
        event.preventDefault();
        setToInvite(event.target.value)
    }

    async function handleSubmitInvite(event) {
        console.log("handle submit invite");
        event.preventDefault();
        const emails = toInvite.trim().split("\n").map(a => a.trim());
        emails.forEach(e => {
            // post to create
            postCreate("users/create", {"email": e}).then(resp => {
                console.log(resp.data.data)
                if (resp.data.data.id) {
                    postCreate(resp.data.data.id + "/invite", undefined, false);
                }
            })
            // post to invite
        })
        console.log("submit invites");
        console.log(toInvite);
    }

    return (
        <div>

            <div>
                <h3>User management</h3>
                <h5>Invite new users</h5>
                <form id="invite-users" onSubmit={handleSubmitInvite}>
                    <textarea form="invite-users" value={toInvite}  onChange={handleChangeToInvite}/>
                    <input type="submit"/>
                </form>
                <h5>Manage users</h5>
                <label htmlFor="search">
                    Search:
                    <input id="search" type="text" onChange={handleSearch} />
                </label>
                <ul>
                    {(users.length)? users.map(u => {
                        return (<li>{u.name}</li>)
                    }) : null}
                </ul>
            </div>


        </div>
    );
}