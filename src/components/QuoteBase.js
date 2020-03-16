import propTypes from 'prop-types'
import React from 'react'
import TagPopover from './TagPopover'

const QuoteBase = ({quote, people, id}) => {
  const nameStr = people.length === 0 ? 
    "Anonymous" :
    people.map(person => person.name).join(', ')
  return (
    <blockquote className="blockquote mb-0 multi-line-display">
      {quote}
      
      <footer className="blockquote-footer">
        {nameStr + " "}
        <a href={"EditQuote/"+id}>Tag</a>
        <TagPopover/>
      </footer>
      
    </blockquote>
)}

QuoteBase.propTypes = {
  quote: propTypes.string,
  names: propTypes.arrayOf(propTypes.string),
}

export default QuoteBase