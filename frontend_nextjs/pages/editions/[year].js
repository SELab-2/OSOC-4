import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import {api, Url} from "../../utils/ApiClient";
import { Button, Form, Table } from "react-bootstrap";

const Edition = () => {
    console.log("--------\n--------------\n------------");
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [edition, setEdition] = useState(true);
    const { year } = router.query
    const [users, setUsers] = useState([]);

    useEffect(() => {
        Url.fromName(api.editions).extend(`/${year}`).get().then(resp => {
            if (resp.success) {
                setEdition(resp.data);
                Url.fromUrl(resp.data.users).get().then(async res2 => {
                    //console.log("test");
                    if (res2.success){
                        // console.log("-----------\n---------\nres2");
                        // console.log(res2);
                        for (let u of res2.data){
                            Url.fromUrl(u).get().then(async res3 => {
                                if (res3.success) {
                                    console.log("res3");
                                    console.log(res3);
                                    const user = res3.data;
                                    //console.log(user);
                                    if (user && user.data.role === 0) {
                                        
                                        await setUsers(prevState => [...prevState, user.data]);
                                        //await setShownUsers(prevState => [...prevState, user.data]);
                                    }
                                }
                            })
                            // Url.fromUrl(u).get().then((async res3 => {
                            //     if (res3.success){
                            //         console.log(res3.data);
                            //     }
                            // }))
                        }
                    }
                })
            }
            setLoading(false);
        });
    }, [year]);

    if (loading) {
        return <LoadingPage />
    }

    // console.log("The current edition:");
    // console.log(edition);
    console.log(users);

    return (
        <>
            <h1>Naam</h1>
            <p>{edition.name}</p>
            <h2>Beschrijving</h2>
            <p>{edition.description}</p>
            <h2>Coaches</h2>
            <p>{edition.users}</p>
            { <Table className={"table-manage-users"}>
                <thead>
                    <th>
                        <p>
                            begeleider
                        </p>
                    </th>
                    <th>
                        <p>
                            role
                        </p>
                    </th>
                </thead>
                <tbody>
                {(users.length) ? (users.map((user, index) => (
                    <tr>
                        <td>{user.name}</td>
                        <td>{user.role}</td>
                    </tr>))) : null}
                </tbody>
            </Table> }
        </>
    )
}

export default Edition;

