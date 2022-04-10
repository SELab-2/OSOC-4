import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import { urlManager } from "../../utils/ApiClient";
import { getJson, postCreate } from "../../utils/json-requests";
import { Form, Button } from 'react-bootstrap';

export default function QuestionTags() {
    const [questionTags, setQuestionTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        setLoading(true)
        urlManager.getQuestionTags().then(questiontags_url => {
            getJson(questiontags_url).then(res => {
                console.log(res)
                setQuestionTags(res);
            }
            ).then(() => setLoading(false))
        })
    }, []);

    const handleNewTagChange = (event) => {
        setNewTag(event.target.value);
    }

    async function submitNewTag(event) {
        const questiontag_url = await urlManager.getQuestionTags()
        postCreate(questiontag_url, { "tag": newTag }).then(resp => {
            setQuestionTags([...questionTags, resp])
        })
    }

    return (
        <div>
            {
                questionTags.map(url =>
                    <QuestionTag key={url} url={url} />
                )
            }
            <Form onSubmit={submitNewTag}>
                <Form.Control name="newtag" type="text" placeholder="New tag" value={newTag} onChange={handleNewTagChange} />
                <Button variant="primary" type="submit">
                    Create
                </Button>

            </Form>
        </div>
    )

}