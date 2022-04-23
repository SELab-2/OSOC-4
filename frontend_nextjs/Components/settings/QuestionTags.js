import React, { useEffect, useState } from "react";
import QuestionTag from "./QuestionTag";
import {api, Url} from "../../utils/ApiClient";
import {Form, Button, Table} from 'react-bootstrap';
import StudentTableRow from "../email-students/StudentTableRow";

/**
 * This component displays a settings-screen where you can manage the question tags for an edition
 * @returns {JSX.Element}
 */
export default function QuestionTags() {
    const [questionTags, setQuestionTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const [edited, setEdited] = useState(undefined);

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
                  <th>
                      <p>Delete</p>
                  </th>
              </tr>
              </thead>
              <tbody className="email-students-cell">
              {questionTags.map(url => <QuestionTag key={url} url={url} deleteTag={deleteTag} renameTag={renameTag}
                                                    setEdited={setEdited} edited={edited === url}/>)}
              </tbody>
          </Table>

          <Button variant="primary">
              New question tag
          </Button>
      </div>
    )

}