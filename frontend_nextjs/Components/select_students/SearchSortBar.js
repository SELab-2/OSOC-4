import {Col, Form, Row} from "react-bootstrap";
import React from "react";
import {useRouter} from "next/router";

// displays the counts of the suggestions for a student
export default function SearchSortBar(props) {

  const router = useRouter();

  const search = (router.query.search)? router.query.search: "";
  const sortby = (router.query.sortby)? router.query.sortby: "name_asc";

  function sort(value) {
    let newQuery = router.query;
    newQuery["sortby"] = value;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true})
  }

  function doSearch(value) {
    let newQuery = router.query;
    newQuery["search"] = value;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }

  // return html representation of the suggestion counts for a student
  return (
      <Row className="searchbar-row">
        <Col>
          <Form onSubmit={(ev) => ev.preventDefault()}>
            <Form.Group controlId="searchStudents">
              <Form.Control type="text" value={search} placeholder={"Search students"}
                            onChange={ev => doSearch(ev.target.value)} />
            </Form.Group>
          </Form>
        </Col>
        <Col md="auto" className="sortby-label">
          Sort by:
        </Col>
        <Col md="auto" className="align-self-center">
          <select className="dropdown-sortby" id="dropdown-decision" value={sortby}
                  onChange={(ev) => sort(ev.target.value)}>
            <option value={"name_asc"}>Name A-Z</option>
            <option value={"name_desc"}>Name Z-A</option>
            <option value="1">Maybe</option>
            <option value="0">No</option>
          </select>
        </Col>
    </Row>
  )
}