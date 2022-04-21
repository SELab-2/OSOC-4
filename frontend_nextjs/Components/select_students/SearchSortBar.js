import { Button, Col, Form, Row } from "react-bootstrap";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import resetSearchIcon from "../../public/assets/reset-search.svg";
import searchIcon from "../../public/assets/search.svg";

// displays the counts of the suggestions for a student
export default function SearchSortBar(props) {

  const router = useRouter();

  const [search, setSearch] = useState((router.query.search) ? router.query.search : "");
  const sortby = (router.query.sortby) ? router.query.sortby : "name_asc";

  function sort(value) {
    let newQuery = router.query;
    newQuery["sortby"] = value;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }

  function doSearch() {
    let newQuery = router.query;
    newQuery["search"] = search;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }

  // return html representation of the suggestion counts for a student
  return (
    <Row className="nomargin">
      <Col>
        <Form onSubmit={ev => {
          ev.preventDefault();
          doSearch();
        }}>
          <Form.Group controlId="searchStudents">
            <Form.Control type="text" value={search} placeholder={"Search students"}
              onChange={(ev) => setSearch(ev.target.value)}>
            </Form.Control>
          </Form.Group>
        </Form>
      </Col>
      <Col xs="auto" >
        <button className="reset-search-button" onClick={() => setSearch("")}>
          <Image src={resetSearchIcon} />
        </button>
      </Col>
      <Col xs="auto">
        <button className="search-button" onClick={() => setSearch(() => doSearch())}>
          <Image src={searchIcon} />
        </button>
      </Col>
      <Col xs="auto" className="sortby-label">
        Sort by:
      </Col>
      <Col xs="auto" className="align-self-center">
        <select className="dropdown-sortby" id="dropdown-decision" value={sortby}
          onChange={(ev) => sort(ev.target.value)}>
          <option value={"first name+asc,last name+asc"}>Name A-Z</option>
          <option value={"first name+dc,last name+desc"}>Name Z-A</option>
        </select>
      </Col>
    </Row>
  )
}