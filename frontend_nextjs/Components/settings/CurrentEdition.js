import React, { useEffect, useState} from 'react'
import {api, Url} from "../../utils/ApiClient";
import {Accordion, Table } from "react-bootstrap";
import AccordionItem from "react-bootstrap/AccordionItem";
import AccordionBody from "react-bootstrap/AccordionBody";
import AccordionHeader from "react-bootstrap/AccordionHeader";
import QuestionTags from "../../Components/settings/QuestionTags";
import EditionDropdownButton from "./EditionDropdownButton";


export default function CurrentEdition(props) {
    const [loadingEditon, setLoadingEdition] = useState(false);
    const [edition, setEdition] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (edition === true && ! loadingEditon){
            setLoadingEdition(true);
            console.log("api.current_edition");
            console.log(api.current_edition);
            Url.fromName(api.current_edition).get().then(res => {
                console.log("res:");
                console.log(res);
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
            });
        }
    });

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
                        <div className="questiontags">
                            <QuestionTags />
                        </div>
                    </AccordionBody>
                </AccordionItem>
                <AccordionItem eventKey="2"> 
                    <AccordionHeader>
                        <h3>Change edition</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <EditionDropdownButton />
                    </AccordionBody>
                </AccordionItem>
            </Accordion>
        </div>
    )
}