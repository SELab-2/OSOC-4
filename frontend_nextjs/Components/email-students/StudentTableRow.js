import React, {useEffect, useState} from "react";
import correctIcon from "../../public/assets/correct.svg"
import wrongIcon from "../../public/assets/wrong.svg"
import Image from "next/image";

export default function StudentTableRow(props) {

  const [decisionSuggestion, setDecisionSuggesion] = useState(undefined);

  // This function inserts the data in the variables
  useEffect(() => {
    if (props.student["suggestions"]) {
      // a decision is a suggestion which is definitive
      let decisions = props.student["suggestions"].filter(suggestion => suggestion["definitive"])
      if (decisions.length !== 0) {
        setDecisionSuggesion(decisions[0]);
      }
    }
  });

  function getDecisionString() {
    if (! decisionSuggestion) {
      return "Undecided"
    }
    return ["no", "maybe", "yes"][decisionSuggestion["decision"]]
  }

  function getEmailSent() {
    if (decisionSuggestion && decisionSuggestion["mail_sent"]) {
      return <Image src={correctIcon} height="30px"/>;
    }
    return <Image src={wrongIcon} height="30px"/>;
  }

  return (
    <tr key={props.student.id}>
      <td>
        <input id={props.filter_id} type="checkbox" onChange={ev => props.addToReceivers(ev.target.checked, props.student)} />
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