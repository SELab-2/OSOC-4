import React, { useEffect, useState } from "react";
import { Form, Button } from 'react-bootstrap';
import deleteIcon from '../../public/assets/delete.svg';
import Image from "next/image";
import {Url} from "../../utils/ApiClient";

export default function QuestionTag(props) {
    const [previousTag, setPreviousTag] = useState({});
    const [questionTag, setQuestionTag] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        Url.fromUrl(props.url).get()
            .then(res => {
                if(res.success) {
                    setPreviousTag(res.data);
                    setQuestionTag(res.data);
                }
            })
            .then(() => setLoading(false))
    }, [props.url]);

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
        Url.fromUrl(props.url).delete().then(res => {
            if (res.success) {
                props.deleteTag(props.url)
            }
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        Url.fromUrl(props.url).setBody(questionTag).patch().then(res => {
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

                    {!questionTag["mandatory"] &&
                        <div>
                            <Form.Check
                                name="showInList"
                                type="checkbox"
                                checked={questionTag["showInList"]}
                                label={"show in studentlist"}
                                onChange={handleCheckboxChange}
                            />
                            <button onClick={deleteTag}>
                                <Image src={deleteIcon} className="delete-icon" />
                            </button>
                        </div>
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