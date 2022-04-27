import React, { useEffect, useState } from "react";
import deleteIcon from '../../public/assets/delete.svg';
import editIcon from '../../public/assets/edit.svg';
import saveIcon from '../../public/assets/save.svg';
import Image from "next/image";
import {Url} from "../../utils/ApiClient";

/**
 * This component represents a row in the table of question tags. It represents one question tag.
 * @param props props contains questionTag, questionTags, deleteTag, renameTag, setEdited, edited, setNewQuestionTag,
 * setErrorMessage. QuestionTag is the object that represents the row's queston tag. questionTags is the list of all
 * the rendered question tags. deleteTag is a function that needs to be called when deleting the quesion tag. renameTag
 * is a function that needs to be called when editing the tag name. edited is a state variable that represent the
 * currently edited questiontag, setEdited edits the variable. setNewQuestionTag is to set the variable that represents
 * the new question tag when clicking on 'new question tag'. setErrorMessage is used to show an error message.
 * @returns {JSX.Element} A table row that represents a question tag.
 */
export default function QuestionTag(props) {
    const [previousTag, setPreviousTag] = useState({});
    const [questionTag, setQuestionTag] = useState({});

    // fetch the question tag (the url is provided in the props)
    useEffect(() => {
        setQuestionTag(props.questionTag);
        setPreviousTag(props.questionTag);
    }, [props.questionTag]);

  /**
   * This function is called when the tag name or question are edited. It changes their value in the questionTag
   * variable.
   * @param event
   */
  const handleChange = (event) => {
        event.preventDefault()
        const { name, value } = event.target;
        setQuestionTag(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

  /**
   * This function is called when you click the visibility checkbox. It makes the chosen questiontag
   * visible/invisible in the select students tab.
   * @param event The click event on the checkbox
   */
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

  /**
   * This function is called when you click the delete button of a question tag. It deletes the question tag.
   * @param event The click event on the checkbox
   */
  const deleteTag = (event) => {
        event.preventDefault();
        Url.fromUrl(questionTag["url"]).delete().then(res => {
            if (res.success) {
                props.deleteTag(questionTag["url"])
            }
        })
    }

  /**
   * This function is called when you click the save button of a question tag. First it checks or the tag and question
   * are not empty en unique. If they are, The new questiontag is patched.
   * @param event
   */
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

  /**
   * return the html that renders a question tag in the question tags table.
   */
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