import React from 'react';
import { Form } from 'react-bootstrap';
import { connectSearchBox } from 'react-instantsearch-dom';

const SearchBox = ({ currentRefinement, isSearchStalled, refine }) => (
  <Form noValidate action="" role="search">
    <Form.Control
      type="search" 
      value={currentRefinement}
      onChange={e => refine(e.currentTarget.value)}
      placeholder={"Search something..."}
    />
  </Form>
);

export default connectSearchBox(SearchBox);