import dateFormat from 'dateformat'
import React from 'react'
import { Accordion, Button, Card } from "react-bootstrap"
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded } from 'react-redux-firebase'
import { compose } from 'recompose'
import Quotes from './Quotes'
import SplashScreen from './SplashScreen'

const Hit = ({hit, emails}) => {
  if (hit.email && (!isLoaded(emails) || !emails || !emails[hit.email.id])) {
    return <SplashScreen/>
  }
  const emailSection = hit.email ?
    <Card>
        <Accordion.Toggle as={Button} style={{textAlign: 'left'}} variant="link" eventKey="email">
          QOTW: {emails[hit.email.id].title}
        </Accordion.Toggle>
      <Accordion.Collapse eventKey="email">
        <Card.Body>
          <Card.Text className="multi-line-display">{emails[hit.email.id].content}</Card.Text>
        </Card.Body>
      </Accordion.Collapse>
    </Card> :
    <small>{"(Email from this publication is not available)"}</small>
  
  const quotesSection = hit.quotes.length ? 
    <Card>
        <Accordion.Toggle as={Button} style={{textAlign: 'left'}} variant="link" eventKey="quotes">
          Quotes
        </Accordion.Toggle>
      <Accordion.Collapse eventKey="quotes">
        <Card.Body>
          <Quotes quotes={hit.quotes}/>
        </Card.Body>
      </Accordion.Collapse>
    </Card>: 
    <small>{"(Quotes from this publication are not available)"}</small>
  
  const date = new Date(hit.datePublished._seconds*1000)
  const dateStr = dateFormat(date, "mmmm dS, yyyy")
  return (
    <Accordion>
      {quotesSection}
 
      {emailSection}
      <small>{dateStr}</small>
    </Accordion>
  )
}

const enhance = compose(
  firestoreConnect(props => [{
    collection: 'emails',
    doc: props.hit.email.id,
  }]),
  connect(state => ({
    emails: state.firestore.data.emails,
  })),
)

export default enhance(Hit)