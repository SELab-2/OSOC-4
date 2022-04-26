import React, { useEffect, useState } from "react";
import deleteIcon from '../../public/assets/delete.svg';
import editIcon from '../../public/assets/edit.svg';
import saveIcon from '../../public/assets/save.svg';
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

    // fetch the question tag (the url is provided in the props)
    useEffect(() => {
        setQuestionTag(props.questionTag);
        setPreviousTag(props.questionTag);
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

        let newQuestionTag = {...previousTag};
        newQuestionTag[name] = checked;
        Url.fromUrl(questionTag["url"]).setBody(newQuestionTag).patch().then(res => {
          setPreviousTag(newQuestionTag);
        })

        newQuestionTag = {...questionTag};
        newQuestionTag[name] = checked;
        setQuestionTag(newQuestionTag);
    }

    const deleteTag = (event) => {
        event.preventDefault();
        Url.fromUrl(questionTag["url"]).delete().then(res => {
            if (res.success) {
                props.deleteTag(questionTag["url"])
            }
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
      let requirements = [questionTag["tag"].length > 0,
        props.questionTags.every(qt => qt["tag"] !== questionTag["tag"] || qt["url"] === questionTag["url"]),
        questionTag["question"].length > 0,
        props.questionTags.every(qt => qt["question"] !== questionTag["question"] || qt["url"] === questionTag["url"])];
        if (requirements.every(req => req)) {
          Url.fromUrl(questionTag["url"]).setBody(questionTag).patch().then(res => {
            if (previousTag["tag"] !== questionTag["tag"]) {
              props.renameTag(questionTag["url"], res["data"])
            }
            setPreviousTag(questionTag);
          })
          props.setErrorMessage("");
          props.setEdited(undefined);
        } else {
          let messages = ["Tag name must not be empty", "Tag name must be unique",
            "Question must not be empty", "Question must be unique"];
          props.setErrorMessage(messages[requirements.indexOf(false)]);
        }
    }

    return (
      <tr key={props.questionTag["url"]}>
          <td>
              {(questionTag["mandatory"] || ! props.edited)? (
                <p>{previousTag["tag"]}</p>
              ) : (
                <input name="tag" placeholder="Tag" value={questionTag["tag"]} onChange={handleChange}/>
              )
              }
          </td>
          <td>
              {(props.edited)? <input name="question" placeholder="Question" value={questionTag["question"]} onChange={handleChange} />:
              <p>{previousTag["question"]}</p>}

          </td>
          <td>
              {(!questionTag["mandatory"]) &&
                <input name="showInList" type="checkbox" checked={questionTag["showInList"]} onChange={handleCheckboxChange} />
              }
          </td>
          <td>
              {(!questionTag["mandatory"]) &&
                ((! props.edited)?
                <button className="table-button" onClick={(ev) => {
                    props.setNewQuestionTag(undefined);
                    props.setEdited(previousTag["url"])}}>
                  <Image src={editIcon} height="30px"/>
                </button>
                :
                <button className="table-button" onClick={handleSubmit}>
                  <Image src={saveIcon} height="30px"/>
                </button>)
              }
              {(!questionTag["mandatory"]) &&
                <button onClick={deleteTag} className="table-button">
                  <Image src={deleteIcon} height="30px"/>
                </button>
              }
          </td>
      </tr>
    )
}