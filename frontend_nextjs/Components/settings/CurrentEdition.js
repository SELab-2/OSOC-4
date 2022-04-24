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
                }
            });
        }
    });


    return (
        <div className="body-editiondetail">
            <h1>{edition.name}</h1>
            <p>{(edition.description) ? edition.description : "No description available"}</p>
            <Accordion>

                <AccordionItem eventKey="0">
                    <AccordionHeader>
                        <h3>Change edition</h3>
                    </AccordionHeader>
                    <AccordionBody>
                        <EditionDropdownButton currentVersion={edition} setCurrentVersion={setEdition} />
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



            </Accordion>
        </div>
    )
}