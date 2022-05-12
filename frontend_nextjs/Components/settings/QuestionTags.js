import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import { api, Url, cache } from "../../utils/ApiClient";
import { Form, Button, Table } from 'react-bootstrap';
import Image from "next/image";
import saveIcon from "../../public/assets/save.svg";
import deleteIcon from "../../public/assets/delete.svg";
import LoadingPage from "../LoadingPage";

/**
 * This component displays a settings-screen where you can manage the question tags for an edition
 * @returns {JSX.Element}
 */
export default function QuestionTags(props) {

    // represents the array of question tags.
    const [questionTags, setQuestionTags] = useState([]);

    // represents the currently edited question tag.
    const [edited, setEdited] = useState(undefined);

    // This variable represents the new questiontag, when the 'new question tag' button is clicked it is shown as an
    // empty row in the end of the table.
    const [newQuestionTag, setNewQuestionTag] = useState(undefined);

    // This variable holds the error message that needs to be shown. If this is empty, no error message is shown.
    const [errorMessage, setErrorMessage] = useState("");

    const [loading, setLoading] = useState(true);

    /**
     * Called when the component is build. It fetches all the question tags and inserts them the questionTags array
     */
    useEffect(() => {
        if(props.reload) {
            setLoading(true);
            Url.fromName(api.editions_questiontags).get().then(res => {
                if (res.success) {
                    Promise.all(res.data.map(url => Url.fromUrl(url).get())).then(
                        resq => {
                            let newQuestionTags = resq;
                            for (let i = 0; i < newQuestionTags.length; i++) {
                                newQuestionTags[i] = newQuestionTags[i]["data"];
                                newQuestionTags[i]["url"] = res.data[i];
                            }
                            setQuestionTags(newQuestionTags);
                        }
                    )
                }});
            setLoading(false);
        }
    }, [props.reload]);

    /**
     * This function is called when the tag name or question of the new question tag are edited.
     * @param ev The event of editing the input field
     */
    function handleNewTagChange(ev) {
        let newQuestionTagAdj = { ...newQuestionTag };
        newQuestionTagAdj[ev.target.name] = ev.target.value;
        setNewQuestionTag(newQuestionTagAdj);
    }

    /**
     * This function is called when clicking the save button of the new question tag. First it checks or the tag name
     * and question of the new question tag are not empty and unique. Then It posts the new question tag. Only the tag
     * name will be inserted in the database in the post. We follow the post by a patch that inserts the question,
     * mandatory and show_in_list variables of the new question tag.
     * @param event The event of clicking the save button
     * @returns {Promise<void>}
     */
    async function submitNewTag(event) {
        event.preventDefault();
        let requirements = [newQuestionTag["tag"].length > 0,
        !questionTags.some(qt => qt["tag"] === newQuestionTag["tag"]),
        newQuestionTag["question"].length > 0,
        !questionTags.some(qt => qt["question"] === newQuestionTag["question"])];
        if (requirements.every(req => req)) {
            Url.fromName(api.editions_questiontags).setBody({ ...newQuestionTag }).post().then(resp => {
                Url.fromUrl(resp["data"]).setBody({ ...newQuestionTag }).patch().then(() => {
                    newQuestionTag["url"] = resp["data"];
                    setQuestionTags([...questionTags, { ...newQuestionTag }]);
                    setNewQuestionTag(undefined);
                    setEdited(undefined);
                    cache.clear();
                })
            })
            setErrorMessage("");
        } else {
            let messages = ["Tag name must not be empty", "Tag name must be unique",
                "Question must not be empty", "Question must be unique"];
            setErrorMessage(messages[requirements.indexOf(false)]);
        }
    }

    /**
     * This function is called when a question tag is deleted. It removes the question tag from the local question tags.
     * @param url
     */
    function deleteTag(url) {
        const newArr = questionTags.filter(item => item["url"] !== url);
        setQuestionTags(newArr);
    }

    /**
     * This function is called when the tag name of a question tag is changed. It changes the url of the question tag
     * locally.
     * @param url The old url of the question tag.
     * @param newUrl The new url of the question tag.
     */
    function renameTag(url, newUrl) {
        let index = questionTags.map(qt => qt["tag"]).indexOf(url);
        let newQuestionTags = [...questionTags];
        if (index !== -1) {
            newQuestionTags[index]["url"] = newUrl;
        }
        setQuestionTags(newQuestionTags);
    }

    if (loading) {
        return (<LoadingPage/>);
    }
    /**
     * The html that renders the question tags.
     */
    return (
        <div>
            <Table>
                <thead>
                    <tr className="table-head">
                        <th>
                            <p>Name</p>
                        </th>
                        <th>
                            <p>Question</p>
                        </th>
                        <th>
                            <p>Show in student list</p>
                        </th>

                    </tr>
                </thead>
                <tbody className="email-students-cell">
                    {questionTags.map(questionTag =>
                        <QuestionTag key={questionTag["url"]} questionTag={questionTag} questionTags={questionTags}
                            deleteTag={deleteTag} renameTag={renameTag}
                            setEdited={setEdited} edited={edited === questionTag["url"]}
                            setNewQuestionTag={setNewQuestionTag} setErrorMessage={setErrorMessage} />)}
                    {(newQuestionTag) &&
                        <tr key="newQuestionTag">
                            <td>
                                <input name="tag" placeholder="Tag" value={newQuestionTag["tag"]}
                                    onChange={handleNewTagChange} />
                            </td>
                            <td>
                                <input name="question" placeholder="Question" value={newQuestionTag["question"]}
                                    onChange={handleNewTagChange} />
                            </td>
                            <td><p /></td>
                            <td>
                                <button className="table-button" onClick={submitNewTag}>
                                    <Image src={saveIcon} height="30px" />
                                </button>
                                <button onClick={(ev) => {
                                    setErrorMessage("");
                                    setNewQuestionTag(undefined)
                                }} className="table-button">
                                    <Image src={deleteIcon} height="30px" />
                                </button>
                            </td>
                        </tr>
                    }
                    {(errorMessage) &&
                        <tr key="error">
                            <td className="errormessage">{errorMessage}</td>
                        </tr>
                    }
                </tbody>
            </Table>

            <Button variant="primary" onClick={(ev) => {
                setEdited(undefined);
                setNewQuestionTag({ "tag": "", "question": "", "mandatory": false, "show_in_list": false });
            }}>
                New question tag
            </Button>
        </div>
    )

}
