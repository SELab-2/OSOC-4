import { Col, Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  const [projects, setProjects] = useState(undefined);

  useEffect(() => {
    if (! projects && props.student["participations"]) {
      for (let newProject of props.student["participations"]) {
        let newProjects = []
        Url.fromUrl(newProject["project"]).get().then(res => {
          newProjects = newProjects.concat([res.data["name"]]);
          setProjects(newProjects);
        })
      }
    }
  })

  // get the info of the basic questions shown in the list element
  function getInfo() {
    if (props.student["suggestions"]) {
      let decisions = Object.values(props.student["suggestions"]).filter(sugg => sugg["definitive"]);
      let decision = (decisions.length === 0) ? "Undecided" : ["No", "Maybe", "Yes"][decisions[0]["decision"]];

      let rows = [];

      Object.entries(props.student["listtags"]).map(([k, v]) => {
        rows.push(
          <Row key={k} className="question-answer-row">
            <Col md="auto" className="info-titles">{k}</Col>
            <Col md="auto" className="info-answers">{v}</Col>
          </Row>
        )
      })
      if (!props.listelement) {
        Object.entries(props.student["detailtags"]).map(([k, v]) => {
          rows.push(
            <Row key={k} className="question-answer-row">
              <Col md="auto" className="info-titles">{k}</Col>
              <Col md="auto" className="info-answers">{v}</Col>
            </Row>
          )
        })
      }

      rows.push(
        <Row key={"Project"} className="question-answer-row">
          <Col md="auto" className="info-titles">{"Project"}</Col>
          <Col md="auto" className="info-answers">
            {(! projects || projects.length === 0)? "None": projects.join(", ")}
          </Col>
        </Row>
      )

      rows.push(
        <Row key={"Decision"} className="question-answer-row">
          <Col md="auto" className="info-titles">{"Decision"}</Col>
          <Col md="auto" className="info-answers">{decision}</Col>
        </Row>
      )

      return rows;
    }
  }

  // return html representation of the suggestion counts for a student
  return (
    <Col md="auto">
      {getInfo()}
    </Col>
  );
}