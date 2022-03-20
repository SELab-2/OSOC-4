import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";

export default function StudentListelement(props) {

  const [student, setStudent] = useState(undefined);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (!student) {
      getJson(props.student).then(res => {
        setStudent(res.data)
        setName(res.data.name)
        setUrl(res.data.url)
      });
    }
  });

  return(
    <div id="list-element" className="list-element" style={{textAlign: "left", width: "800px", position: "relative"}}>

      <div id="upper-layer">
        <div id="name" style={{float: "left"}} className="name">{name}</div>
        <div id="practical-problems" style={{float: "left"}} className="practical-problems">2 practical problems</div>
        <div id="suggestions" style={{float: "right"}} className="suggestions">Suggestions</div>
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
      <br/><br/><br/><br/><br/>

      <div id="roles" style={{float: "right"}}>
        <ul>
          <li className="role" style={{float: "right", bottom: 0}}>VIDEO EDITOR</li>
          <li className="role" style={{float: "right"}}>BACKEND DEVELOPPER</li>
        </ul>
      </div>


    </div>
  )
}