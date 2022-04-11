import React, { useEffect, useState } from "react";
import { getJson, sendDelete, patchEdit } from "../../utils/json-requests";
import { Form, Button } from 'react-bootstrap';
import deleteIcon from '../../public/assets/delete.svg';
import Image from "next/image";

export default function QuestionTag(props) {
    const [previousTag, setPreviousTag] = useState({});
    const [questionTag, setQuestionTag] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        getJson(props.url)
            .then(res => {
                setPreviousTag(res);
                setQuestionTag(res);
            })
            .then(() => setLoading(false))
    }, []);

    const handleChange = (event) => {
        event.preventDefault()
        const { name, value } = event.target;
        setQuestionTag(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setQuestionTag(prevState => ({
            ...prevState,
            [name]: checked
        }));
    }

    const deleteTag = (event) => {
        event.preventDefault()
        sendDelete(props.url).then(result => {
            props.deleteTag(props.url)
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        patchEdit(props.url, questionTag).then(res => {
            if (previousTag["tag"] !== questionTag["tag"]) {
                props.renameTag(props.url, res["data"])
            }
            setPreviousTag(questionTag);
        })
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    {questionTag["mandatory"] ? (
                        <Form.Control name="tag" type="text" placeholder="Tag" value={questionTag["tag"]} onChange={handleChange} disabled />
                    ) : (
                        <Form.Control name="tag" type="text" placeholder="Tag" value={questionTag["tag"]} onChange={handleChange} />
                    )
                    }
                    <Form.Control name="question" type="text" placeholder="Question" value={questionTag["question"]} onChange={handleChange} />

                    <Form.Check
                        name="showInList"
                        type="checkbox"
                        checked={questionTag["showInList"]}
                        label={"show in studentlist"}
                        onChange={handleCheckboxChange}
                    />

                    {!questionTag["mandatory"] &&
                        <button onClick={deleteTag}>
                            <Image src={deleteIcon} className="delete-icon" />
                        </button>
                    }

                </Form.Group>
                {JSON.stringify(questionTag) !== JSON.stringify(previousTag) &&
                    <Button variant="primary" type="submit">
                        Save
                    </Button>
                }
            </Form>
        </div>
    )
}