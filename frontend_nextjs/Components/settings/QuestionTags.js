import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import {api, Url} from "../../utils/ApiClient";
import { Form, Button } from 'react-bootstrap';

/**
 * This component displays a settings-screen where you can manage the question tags for an edition
 * @returns {JSX.Element}
 */
export default function QuestionTags() {
    const [questionTags, setQuestionTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        setLoading(true)
        Url.fromName(api.editions_questiontags).get().then(res => {
            if (res.success) {
                setQuestionTags(res.data);
            }}).then(() => setLoading(false))
    }, []);

    const handleNewTagChange = (event) => {
        setNewTag(event.target.value);
    }

    async function submitNewTag(event) {
        event.preventDefault()
        Url.fromName(api.editions_questiontags).setBody({"tag": newTag}).post().then(resp => {
            setQuestionTags([...questionTags, resp["data"]])
            setNewTag("");
        })

    }

    const deleteTag = (url) => {
        const newArr = questionTags.filter(item => item !== url);
        setQuestionTags(newArr);
    }

    const renameTag = (url, newurl) => {
        let index = questionTags.indexOf(url);
        if (index !== -1) {
            questionTags[index] = newurl;
        }
        setQuestionTags([...questionTags]);
    }

    return (
        <div>
            {questionTags.map(url =>
                    <QuestionTag key={url} url={url} deleteTag={deleteTag} renameTag={renameTag} />
            )}
            <Form onSubmit={submitNewTag}>
                <Form.Control name="newtag" type="text" placeholder="New tag" value={newTag} onChange={handleNewTagChange} />
                <Button variant="primary" type="submit">
                    Create
                </Button>

            </Form>
        </div>
    )

}