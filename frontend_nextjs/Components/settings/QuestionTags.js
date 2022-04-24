import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import {api, Url} from "../../utils/ApiClient";
import {Form, Button, Table} from 'react-bootstrap';
import StudentTableRow from "../email-students/StudentTableRow";
import Image from "next/image";
import editIcon from "../../public/assets/edit.svg";
import saveIcon from "../../public/assets/save.svg";
import deleteIcon from "../../public/assets/delete.svg";

/**
 * This component displays a settings-screen where you can manage the question tags for an edition
 * @returns {JSX.Element}
 */
export default function QuestionTags() {
    const [questionTags, setQuestionTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [edited, setEdited] = useState(undefined);
    const [newQuestionTag, setNewQuestionTag] = useState(undefined);

    useEffect(() => {
        setLoading(true)
        Url.fromName(api.editions_questiontags).get().then(res => {
            if (res.success) {
                setQuestionTags(res.data);
            }}).then(() => setLoading(false))
    }, []);

    function handleNewTagChange(ev) {
        let newQuestionTagAdj = {...newQuestionTag};
        newQuestionTagAdj[ev.target.name] = ev.target.value;
        setNewQuestionTag(newQuestionTagAdj);
    }

    async function submitNewTag(event) {
        event.preventDefault()
        Url.fromName(api.editions_questiontags).setBody(newQuestionTag).post().then(resp => {
            setQuestionTags([...questionTags, resp["data"]])
            setNewQuestionTag(undefined);
        })

    }

    function deleteTag(url) {
        const newArr = questionTags.filter(item => item !== url);
        setQuestionTags(newArr);
    }

    function renameTag(url, newurl) {
        let index = questionTags.indexOf(url);
        if (index !== -1) {
            questionTags[index] = newurl;
        }
        setQuestionTags([...questionTags]);
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
                  {questionTags.map(url => <QuestionTag key={url} url={url} deleteTag={deleteTag} renameTag={renameTag}
                                                    setEdited={setEdited} edited={edited === url}/>)}
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
                            <Image src={saveIcon} height="30px"/>
                          </button>
                          <button onClick={(ev) => setNewQuestionTag(undefined)} className="table-button">
                            <Image src={deleteIcon} height="30px"/>
                          </button>
                      </td>
                    </tr>
                  }
              </tbody>
          </Table>

          <Button variant="primary" onClick={(ev) => setNewQuestionTag({})}>
              New question tag
          </Button>
      </div>
    )

}