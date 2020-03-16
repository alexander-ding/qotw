import React from 'react'
import Card from 'react-bootstrap/Card'
import QuoteBase from './QuoteBase'

const DisplayQuote = (props) => (
  <Card>
    <Card.Body>
      <QuoteBase {...props}/>
    </Card.Body>
  </Card>
)
export default DisplayQuote