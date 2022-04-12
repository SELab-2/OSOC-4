import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import {useRouter} from "next/router";

// displays the counts of the suggestions for a student
export default function SearchSortBar(props) {

  const router = useRouter();

  const [search, setSearch] = useState((router.query.search)? router.query.search: "");
  const sortby = (router.query.sortby)? router.query.sortby: "name_asc";

  function sort(value) {
    let newQuery = router.query;
    newQuery["sortby"] = value;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true});
    props.setSearchChanged(true);
  }

  function doSearch(ev) {
    ev.preventDefault();
    let newQuery = router.query;
    newQuery["search"] = search;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true});
    props.setSearchChanged(true);
  }

  // return html representation of the suggestion counts for a student
  return (
      <Row className="searchbar-row">
        <Col>
          <Form onSubmit={ev => doSearch(ev)}>
            <Form.Group controlId="searchStudents">
              <Form.Control type="text" value={search} placeholder={"Search students"}
                            onChange={(ev) => setSearch(ev.target.value)}/>
            </Form.Group>
          </Form>
        </Col>
        <Col md="auto" className="sortby-label">
          Sort by:
        </Col>
        <Col md="auto" className="align-self-center">
          <select className="dropdown-sortby" id="dropdown-decision" value={sortby}
                  onChange={(ev) => sort(ev.target.value)}>
            <option value={"firstname+asc,lastname+asc"}>Name A-Z</option>
            <option value={"firstname+dc,lastname+dc"}>Name Z-A</option>
          </select>
        </Col>
    </Row>
  )
}