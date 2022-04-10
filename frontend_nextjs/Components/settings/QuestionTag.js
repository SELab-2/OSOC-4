import React, { useEffect, useState } from "react";
import { getJson } from "../../utils/json-requests";
import { Form, Button } from 'react-bootstrap';

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

    return (
        <div>
            <Form>
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