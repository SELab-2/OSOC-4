import React, {useEffect, useState} from "react";
import correctIcon from "../../public/assets/correct.svg"
import wrongIcon from "../../public/assets/wrong.svg"
import Image from "next/image";

/**
 * This element represents a row in the table of students in the 'email students' tab. Each row shows a checkbox to
 * add the student to the receivers of the emails, a name, email-address, decision and if the student has received
 * the correct email.
 * @param props props has a student which contains the student corresponding to the row and a function 'addToReceivers',
 * which adds or deletes a student to the receivers of the email.
 * @returns {JSX.Element} an element that renders a row in the table of students in the 'email students' tab.
 */
export default function StudentTableRow(props) {

  const [decisionSuggestion, setDecisionSuggesion] = useState(undefined);

  /**
   * This function inserts the data in the variable decisionSuggestion, which is the decision about the student.
   */
  useEffect(() => {
    if (props.student["suggestions"]) {
      // a decision is a suggestion which is definitive
      let decisions = Object.values(props.student["suggestions"]).filter(suggestion => suggestion["definitive"])
      if (decisions.length !== 0) {
        setDecisionSuggesion(decisions[0]);
      }
    }
  }, [props.student]);

  /**
   * This function uses the 'decisionSuggestion' to return a string that corresponds with the decision of a student
   * @returns {string} a string that corresponds with the decision of a student
   */
  function getDecisionString() {
    if (! decisionSuggestion) {
      return "Undecided"
    }
    return ["No", "Maybe", "Yes"][decisionSuggestion["decision"]]
  }

  /**
   * This function uses the 'decisionSuggestion' to return wheater or not the student has received the correct email.
   * @returns {JSX.Element} A 'correct icon' or 'wrong icon', depending on wheater or not the student has received
   * the correct email
   */
  function getEmailSent() {
    if (decisionSuggestion && decisionSuggestion["mail_sent"]) {
      return <Image src={correctIcon} height="30px"/>;
    }
    return <Image src={wrongIcon} height="30px"/>;
  }

  /**
   * This returns the html of the student table row.
   */
  return (
    <tr key={props.student.id}>
      <td>
        <input type="checkbox" onChange={ev => props.addToReceivers(ev.target.checked, props.student)} />
      </td>
      <td>
        {props.student["mandatory"]["first name"]} {props.student["mandatory"]["last name"]}
      </td>
      <td>
        Email address
      </td>
      <td>
        {getDecisionString()}
      </td>
      <td>
        {getEmailSent()}
      </td>
    </tr>

  )
}