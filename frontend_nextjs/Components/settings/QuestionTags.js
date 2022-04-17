import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import { engine } from "../../utils/ApiClient";
import { getJson, postCreate } from "../../utils/json-requests";
import { Form, Button } from 'react-bootstrap';

export default function QuestionTags() {
    const [questionTags, setQuestionTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        setLoading(true)
        engine.getQuestionTags().then(res => {
                console.log(res)
                setQuestionTags(res);
            }
            ).then(() => setLoading(false))
    }, []);

    const handleNewTagChange = (event) => {
        setNewTag(event.target.value);
    }

    async function submitNewTag(event) {
        event.preventDefault()
        const questiontag_url = await engine.getUrl(engine.names.questiontags)
        postCreate(questiontag_url, { "tag": newTag }).then(resp => {
            setQuestionTags([...questionTags, resp["data"]])
            setNewTag("");
        })

    }

    const deleteTag = (url) => {
        const newArr = questionTags.filter(item => item !== url);
        setQuestionTags(newArr);
    }

    const renameTag = (url, newurl) => {

        var index = questionTags.indexOf(url);

        if (index !== -1) {
            questionTags[index] = newurl;
        }

        setQuestionTags([...questionTags]);
    }

    return (
        <div>
            {
                questionTags.map(url =>
                    <QuestionTag key={url} url={url} deleteTag={deleteTag} renameTag={renameTag} />
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