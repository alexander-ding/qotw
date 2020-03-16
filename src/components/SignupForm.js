import React from 'react'
import { Button } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'

const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

let SignupForm = ({pristine, submitting, handleSubmit, passwordsMatch}) => {
  console.log(pristine, submitting, passwordsMatch)
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="signupForm.email">
      <Form.Label>Email</Form.Label>
      <Field props={{disabled: true}} name="email" component={ReduxFormControl} type="email" placeholder="Email"/>
    </Form.Group>

    <Form.Group controlId="signupForm.name">
      <Form.Label>Name</Form.Label>
      <Field name="name" component={ReduxFormControl} type="text" placeholder="Your full name"/>
    </Form.Group>

    <Form.Group controlId="signupForm.password">
      <Form.Label>Password</Form.Label>
      <Field name="password" component={ReduxFormControl} type="password"/>
    </Form.Group>
    
    <Form.Group controlId="signupForm.passwordConfirm">
      <Form.Label>Confirm Password</Form.Label>
      <Field name="passwordConfirm" component={ReduxFormControl} type="password"/>
    </Form.Group>

    
    <Button variant="primary" type="submit" disabled={pristine || submitting || !passwordsMatch }>Register</Button>
  </Form>
  )
}
SignupForm = reduxForm({
  form: 'signupForm',
})(SignupForm)

const selector = formValueSelector('signupForm')

SignupForm = connect(
  (state, props) => ({
    initialValues: {
      email: props.email,
    },
    passwordsMatch: (selector(state, 'password') === selector(state, 'passwordConfirm')) && Boolean(selector(state, 'password')),
  })
)(SignupForm)

export default SignupForm