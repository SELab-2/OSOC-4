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

  /**
   * This function uses the 'decisionSuggestion' to return a string that corresponds with the decision of a student
   * @returns {string} a string that corresponds with the decision of a student
   */
  function getDecisionString() {
    if (props.student["decision"] < 0) {
      return "Undecided"
    }
    return ["No", "Maybe", "Yes"][props.student["decision"]]
  }

  /**
   * This function uses the 'decisionSuggestion' to return wheater or not the student has received the correct email.
   * @returns {JSX.Element} A 'correct icon' or 'wrong icon', depending on wheater or not the student has received
   * the correct email
   */
  function getEmailSent() {
    if (props.student["decision"] >= 0 && ! props.student["email_sent"]) {
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
        {props.student["mandatory"]["email"]}
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