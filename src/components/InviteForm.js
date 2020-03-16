import React from 'react'
import { Button, InputGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

let InviteForm = ({pristine, submitting, handleSubmit, validated}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="inviteForm.email">
      <InputGroup>
        <Field name="email" component={ReduxFormControl} type="email" placeholder="Email"/>
      </InputGroup>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Send Invite</Button>
  </Form>
  )
}
const selector = formValueSelector('inviteForm')
InviteForm = reduxForm({
  form: 'inviteForm',
})(InviteForm)

InviteForm = connect(
  state => ({
    validated: (selector(state, 'email') ? !selector(state, 'email').endsWith("@commschool.org") : false),
  })
)(InviteForm)

export default InviteForm