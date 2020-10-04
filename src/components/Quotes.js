import React from 'react'
import Quote from './DisplayQuote'

const Quotes = ({quotes, profile, auth}) => {
  if (!quotes) {
    return <div>Hmm, no quote seems to be available</div>
  }
  return (
    <div>
      {quotes.map((quote, index) => 
        <Quote key={index} quote={quote.quote.quote} people={quote.quote.people} id={quote.id} votes={quote.votes} profile={profile}/>
      )}
    </div>
  )
}

export default Quotes