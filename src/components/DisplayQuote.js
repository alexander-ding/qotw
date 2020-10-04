import React from 'react'
import Card from 'react-bootstrap/Card'
import QuoteBase from './QuoteBase'
import VoteDisplay from './VoteDisplay'

const DisplayQuote = (props) => (
  <Card>
    <Card.Body>
      <QuoteBase {...props}/>
      <VoteDisplay {...props}/>
    </Card.Body>
  </Card>
)
export default DisplayQuote