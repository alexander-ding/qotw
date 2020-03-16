import React from 'react'
import { Button, Form } from 'react-bootstrap'
import { Field, reduxForm } from 'redux-form'

const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

let LoginForm = ({pristine, submitting, handleSubmit}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="loginForm" >
      <Field
        name="email"
        type="email"
        placeholder="Email"
        component={ReduxFormControl}
      />
      <Field
        name="password"
        type="password"
        placeholder="Password"
        component={ReduxFormControl}
      />
    </Form.Group>
    <Button block variant="primary" type="submit" disabled={pristine || submitting}>Login</Button>
  </Form>
  )
}

LoginForm = reduxForm({
  form: 'loginForm',
})(LoginForm)

export default LoginForm