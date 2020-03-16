import React from 'react'
import Form from 'react-bootstrap/Form'
import { Field, reduxForm } from 'redux-form'

const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}

const ReduxFormCheck = ({input, meta, ...props}) => {
  return <Form.Check {...props} {...input} />
}

let PublishForm = ({pristine, submitting, handleSubmit, emailsMatch}) => {
  return (
  <Form onSubmit={handleSubmit}>
    
    <Form.Group controlId="publishForm.email">
      <Field name="title" type="text" component={ReduxFormControl} placeholder='Subject'/>
      <Field name="email" as="textarea" rows="16" component={ReduxFormControl} placeholder='Email'/>
    </Form.Group>
    <Form.Group>
      <Field name="publish" type="checkbox" component={ReduxFormCheck} label="Publish current quotes"/>
    </Form.Group>
  
  </Form>
  )
}

PublishForm = reduxForm({
  form: 'publishForm',
  initialValues: {
    publish: true,
  }
})(PublishForm)

export default PublishForm