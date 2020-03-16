import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { connect } from 'react-redux'
import { Field, FieldArray, formValueSelector, reduxForm } from 'redux-form'
import TagPopover from './TagPopover'

const ReduxFormControl = ({input, meta, ...props}) => {
  return <Form.Control {...props} {...input} />
}



const RenderPeople = ({ fields }) => {
  return (
  <div>
    <div className="d-flex">
      <Form.Label>
        People Quoted (optional) 
        <TagPopover/>
      </Form.Label>
      <div className="ml-auto">
        <Button className="btn-sm" onClick={() => fields.push({})}>Add Person</Button>
      </div>
    </div>
    {fields.map((member, index) =>
      <div className="input-group input-group-sm" key={index}>
        <Field
          name={`${member}.name`}
          type="text"
          placeholder="Name"
          component={ReduxFormControl}
          />
        <Field
          name={`${member}.email`}
          type="text"
          placeholder="Email (optional)"
          component={ReduxFormControl}
          />
        <div className="input-group-append">
          <label className="input-group-text">@commschool.org</label>
          <Button onClick={() => fields.remove(index)}>Remove</Button>
        </div>
      </div>
    )}
  </div>
)}

let QuoteForm = ({pristine, submitting, validated, handleSubmit, canEditQuote=true}) => {
  return (
  <Form onSubmit={handleSubmit}>
    <Form.Group controlId="quoteForm.quote">
      <Form.Label>Quote</Form.Label>
      <Field readOnly={!canEditQuote} name="quote" as="textarea" rows="4" component={ReduxFormControl} placeholder='e.g., Alex, in the middle of English class, "I do often find myself working on a new QOTW website instead of sleeping at 2 AM. I think I have a problem."'/>
    </Form.Group>
    <Form.Group controlId="quoteForm.people">
      <FieldArray name="people" component={RenderPeople}/>
    </Form.Group>
    <Button variant="primary" type="submit" disabled={pristine || submitting || !validated}>Submit</Button>
  </Form>
  )
}

QuoteForm = reduxForm({
  form: 'quoteForm',
  initialValues: {
    quote: '',
    people: [],
  }
})(QuoteForm)

const validate = (quote, people) => {
  if (!quote) {
    return false
  }
  if (people && people.length) {
    const peopleTrues = people.map((person) => {
      if (!person.name) {
        return false
      }
      return true
    })
    return peopleTrues.every(t => t)
  } else {
    return true
  }
}

const selector = formValueSelector('quoteForm') // <-- same as form name
QuoteForm = connect(state => {
  // can select values individually
  const {quote, people} = selector(state, 'quote', 'people')

  const validated = validate(quote, people)
  return {
    validated,
  }
})(QuoteForm)



export default QuoteForm