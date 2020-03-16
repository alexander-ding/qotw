import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

const ReduxFormCheck = ({input, meta, ...props}) => {
  return <Form.Check {...props} {...input} />
}

let ProfileForm = ({pristine, submitting, validated, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="profileForm.newsletter">
      <Field name="newsletter" component={ReduxFormCheck} type="checkbox" label="Subscribe me to weekly quotes newsletter"/>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Update Profile</Button>
  </Form>
  )
}

ProfileForm = reduxForm({
  form: 'profileForm',
})(ProfileForm)

const selector = formValueSelector('profileForm') // <-- same as form name
ProfileForm = connect((state, props) => {
  // can select values individually
  const newsletter = selector(state, 'newsletter')
  const validated = newsletter !== props.isNewsletterSubscribe
  return {
    validated,
  }
})(ProfileForm)

export default ProfileForm