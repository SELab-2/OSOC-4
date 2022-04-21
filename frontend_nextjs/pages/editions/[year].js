import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useState } from 'react';
import LoadingPage from "../../Components/LoadingPage"
import {api, Url} from "../../utils/ApiClient";
import {Accordion, Table } from "react-bootstrap";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionBody from "react-bootstrap/AccordionBody";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import QuestionTags from "../../Components/settings/QuestionTags";

const Edition = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true);
    const [edition, setEdition] = useState(true);
    const { year } = router.query
    const [users, setUsers] = useState([]);

    useEffect(() => {
        Url.fromName(api.editions).extend(`/${year}`).get().then(res => {
            if (res.success) {
                setEdition(res.data);
                Url.fromUrl(res.data.users).get().then(async res2 => {
                    if (res2.success){
                        Promise.all(res2.data.map(u => { Url.fromUrl(u).get().then(async res3 => {
                                    if (res3.success) {
                                        const user = res3.data;
                                        if (user && user.data.role === 0) {
                                            setUsers(prevState => [...prevState, user.data]);
                                        }
                                    }
                                })
                            })
                        )
                    }
                })
            }
            setLoading(false);
        });
    }, [year]);

    if (loading) {
        return <LoadingPage />
    }

    console.log("The current edition:");
    console.log(edition);

    return (
        <div classname="body-editiondetail">
            <h1>{edition.name}</h1>
            <p>{(edition.description) ? edition.description : "No description available"}</p>
            <Accordion defaultActiveKey="0">
                <AccordionItem eventkey="0">
                    <AccordionHeader>
                        <h3>Coaches</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        { <Table className={"table-manage-users"}>
                            <thead>
                                <th>
                                    <p>Name</p>
                                </th>
                                <th>
                                    <p>Email</p>
                                </th>
                            </thead>
                            <tbody>
                            {(users.length) ? (users.map((user, _) => (
                                <tr>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                </tr>))) : null}
                            </tbody>
                        </Table> }
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem eventKey="1">
                    <AccordionHeader>
                        <h3>Question Tags</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <div className="personal-settings">
                            <QuestionTags />
                        </div>
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default Edition;

