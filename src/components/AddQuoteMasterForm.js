import React from 'react'
import { Button, InputGroup } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

let AddQuoteMasterForm = ({pristine, submitting, handleSubmit, emailsMatch}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="addQuoteMasterForm.email">
      <InputGroup>
        <Field name="email" component={ReduxFormControl} type="text" placeholder="Email"/>
        <InputGroup.Append className="input-group-append">
          <label className="input-group-text">@commschool.org</label>
        </InputGroup.Append>
      </InputGroup>
    </Form.Group>

    <Form.Group controlId="addQuoteMasterForm.emailConfirm">
      <InputGroup>
        <Field name="emailConfirm" component={ReduxFormControl} type="text" placeholder="Confirm email"/>
        <InputGroup.Append className="input-group-append">
          <label className="input-group-text">@commschool.org</label>
        </InputGroup.Append>
      </InputGroup>
    </Form.Group>
    
    <Button variant="primary" type="submit" disabled={pristine || submitting || !emailsMatch}>Add Quotemaster</Button>
  </Form>
  )
}
const selector = formValueSelector('addQuoteMasterForm')
AddQuoteMasterForm = reduxForm({
  form: 'addQuoteMasterForm',
})(AddQuoteMasterForm)

AddQuoteMasterForm = connect(
  state => ({
    emailsMatch: selector(state, 'email') === selector(state, 'emailConfirm')
  })
)(AddQuoteMasterForm)

export default AddQuoteMasterForm