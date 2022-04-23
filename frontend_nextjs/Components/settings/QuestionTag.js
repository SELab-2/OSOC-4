import React, { useEffect, useState } from "react";
import { Form, Button } from 'react-bootstrap';
import deleteIcon from '../../public/assets/delete.svg';
import Image from "next/image";
import {Url} from "../../utils/ApiClient";

/**
 * This component displays a settings-screen where you can manage a question tag
 * @param props
 * @returns {JSX.Element}
 */
export default function QuestionTag(props) {
    const [previousTag, setPreviousTag] = useState({});
    const [questionTag, setQuestionTag] = useState({});
    const [loading, setLoading] = useState(false);

    // fetch the question tag (the url is provided in the props)
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
      <tr key={props.url}>
          <td>
              {(questionTag["mandatory"] || ! props.edited)? (
                <p>{questionTag["tag"]}</p>
              ) : (
                <input placeholder="Tag" value={questionTag["tag"]} onChange={handleChange} />
              )
              }
          </td>
          <td>
              {(props.edited)? <input placeholder="Question" value={questionTag["question"]} onChange={handleChange} />:
              <p>{questionTag["question"]}</p>}

          </td>
          <td>
              {(!questionTag["mandatory"]) &&
                <input type="checkbox" checked={questionTag["showInList"]} onChange={handleCheckboxChange} />
              }
          </td>
          <td>
              {(!questionTag["mandatory"]) && <button onClick={deleteTag}>
                  <Image src={deleteIcon} className="delete-icon" />
              </button>
              }
          </td>
      </tr>
    )
}