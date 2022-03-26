import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import {getRolesUrl, getStudentsPath, getSuggestionsPath} from "../routes";

export default function StudentListelement(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState(undefined);
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsYes, setSuggestionsYes] = useState(0);
  const [suggestionsMaybe, setSuggestionsMaybe] = useState(0);
  const [suggestionsNo, setSuggestionsNo] = useState(0);
  const [decision,setDecision] = useState(-1)
  const [skills, setSkills] = useState([]);

  // This function inserts the data in the variables
  useEffect(() => {
    if (!student) {
      setStudent(props.student)
      setName(props.student.name)

      if (suggestions === []) {
        getJson(getSuggestionsPath()).then(res => {
          let possibleSuggestions = res.data;
          setSuggestions(possibleSuggestions.filter(suggestion => suggestion.student = student.id));
          setSuggestionsYes(suggestions.filter(
            suggestion => suggestion.decision === 2 && suggestion.definitive === false).length);
          setSuggestionsMaybe(suggestions.filter(
            suggestion => suggestion.decision === 1 && suggestion.definitive === false).length);
          setSuggestionsNo(suggestions.filter(
            suggestion => suggestion.decision === 0 && suggestion.definitive === false).length);
          let newDecision = suggestions.filter(suggestion => suggestion.definitive = true);
          if (newDecision !== []) {
            setDecision(newDecision[0]);
          }
        })
      }

      if (skills === []) {
        getJson(getRolesUrl()).then(res => {
          let skillObjs = res.data.filter(skill => student.skills.includes(skill.id));
          setSkills(skillObjs.map(skill => skill.name));
        })
      }
    }
  });

  function getDecision() {
    if (decision === -1) {
      return "Undecided";
    }
    let possibleDecisions = ["No", "Maybe", "Yes"];
    return possibleDecisions[decision];
  }

  function getRoles() {
    return skills.map(skill =>
      <li className="role" style={{float: "right", bottom: 0}}>{skill}</li>
    )
  }

  // The html representation of a list-element
  return(
    <div id="list-element" className="list-element" style={{textAlign: "left", width: "800px", position: "relative"}}>

      <div id="upper-layer">
        <div id="name" style={{float: "left"}} className="name">{name}</div>
        <div id="practical-problems" style={{float: "left"}} className="practical-problems">2 practical problems</div>
        <div id="suggestions" style={{float: "right"}} className="suggestions">
          Suggestions:
          <div className="suggestionsYes">{suggestionsYes}</div>
          <div className="suggestionsMaybe">{suggestionsMaybe}</div>
          <div className="suggestionsNo">{suggestionsNo}</div>
        </div>
      </div>

      <br/>

      <div id="info-titles" style={{float: "left"}}>
        <p>Studies:<br/>
        Type of degree:<br/>
        First language:<br/>
        Level of English:<br/>
        Decision:
        </p>
      </div>

      <div id="info-answers">
        <br/><br/><br/><br/>
        {getDecision()}
      </div>

      <div id="roles" style={{float: "right"}}>
        <ul>
          {getRoles()}
        </ul>
      </div>

      <br/><br/>

    </div>
  )
}