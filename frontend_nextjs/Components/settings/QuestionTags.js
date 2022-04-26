import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import {api, Url} from "../../utils/ApiClient";
import {Form, Button, Table} from 'react-bootstrap';
import Image from "next/image";
import saveIcon from "../../public/assets/save.svg";
import deleteIcon from "../../public/assets/delete.svg";
import LoadingPage from "../LoadingPage";

/**
 * This component displays a settings-screen where you can manage the question tags for an edition
 * @returns {JSX.Element}
 */
export default function QuestionTags(props) {
    const [questionTags, setQuestionTags] = useState([]);

    const [edited, setEdited] = useState(undefined);
    const [newQuestionTag, setNewQuestionTag] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        Url.fromName(api.editions_questiontags).get().then(res => {
          if (res.success) {
            Promise.all(res.data.map(url => Url.fromUrl(url).get())).then(
              resq => {
                let newQuestionTags = resq;
                for (let i = 0; i < newQuestionTags.length; i ++) {
                  newQuestionTags[i] = newQuestionTags[i]["data"];
                  newQuestionTags[i]["url"] = res.data[i];
                }
                setQuestionTags(newQuestionTags);
              }
            )
          }});
    }, []);

    function handleNewTagChange(ev) {
        let newQuestionTagAdj = {...newQuestionTag};
        newQuestionTagAdj[ev.target.name] = ev.target.value;
        setNewQuestionTag(newQuestionTagAdj);
    }

    async function submitNewTag(event) {
        event.preventDefault();
        let requirements = [newQuestionTag["tag"].length > 0,
            ! questionTags.some(qt => qt["tag"] === newQuestionTag["tag"]),
            newQuestionTag["question"].length > 0,
            ! questionTags.some(qt => qt["question"] === newQuestionTag["question"])];
        if (requirements.every(req => req)) {
            Url.fromName(api.editions_questiontags).setBody({...newQuestionTag}).post().then(resp => {
                Url.fromUrl(resp["data"]).setBody({...newQuestionTag}).patch().then(() => {
                    newQuestionTag["url"] = resp["data"];
                    setQuestionTags([...questionTags, {...newQuestionTag}]);
                    setNewQuestionTag(undefined);
                    setEdited(undefined);
                })
            })
            setErrorMessage("");
        } else {
            let messages = ["Tag name must not be empty", "Tag name must be unique",
                "Question must not be empty", "Question must be unique"];
            setErrorMessage(messages[requirements.indexOf(false)]);
        }
    }

    function deleteTag(url) {
        const newArr = questionTags.filter(item => item["url"] !== url);
        setQuestionTags(newArr);
    }

    function renameTag(url, newUrl) {
        let index = questionTags.map(qt => qt["tag"]).indexOf(url);
        let newQuestionTags = [...questionTags];
        if (index !== -1) {
            newQuestionTags[index]["url"] = newUrl;
        }
        setQuestionTags(newQuestionTags);
    }

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
                                 setNewQuestionTag={setNewQuestionTag} setErrorMessage={setErrorMessage}/>)}
                  {(newQuestionTag) &&
                    <tr key="newQuestionTag">
                        <td>
                            <input name="tag" placeholder="Tag" value={newQuestionTag["tag"]}
                                   onChange={handleNewTagChange}/>
                        </td>
                        <td>
                            <input name="question" placeholder="Question" value={newQuestionTag["question"]}
                                   onChange={handleNewTagChange}/>
                        </td>
                        <td><p/></td>
                        <td>
                            <button className="table-button" onClick={submitNewTag}>
                                <Image src={saveIcon} height="30px"/>
                            </button>
                            <button onClick={(ev) => {
                                setErrorMessage("");
                                setNewQuestionTag(undefined)}} className="table-button">
                                <Image src={deleteIcon} height="30px"/>
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
              setNewQuestionTag({"tag": "", "question": "", "mandatory": false, "showInList": false});
          }}>
              New question tag
          </Button>
      </div>
    )

}