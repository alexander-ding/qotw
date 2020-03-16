import dateFormat from 'dateformat'
import React from 'react'
import { Accordion, Button, Card } from "react-bootstrap"
import Quotes from './Quotes'
const Hit = ({hit}) => {
  const emailSection = hit.email ?
    <Card>
        <Accordion.Toggle as={Button} style={{textAlign: 'left'}} variant="link" eventKey="email">
          QOTW: {hit.email.title}
        </Accordion.Toggle>
      <Accordion.Collapse eventKey="email">
        <Card.Body>
          <Card.Text className="multi-line-display">{hit.email.content}</Card.Text>
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

export default Hit