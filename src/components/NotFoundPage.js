import React from 'react'
import Button from 'react-bootstrap/Button'
import { useHistory } from 'react-router-dom'

const NotFoundPage = () => {
  const history = useHistory()
  return (
    <div className="main d-flex-column align-items-center" style={{textAlign: 'center'}}>
      <h2>404!</h2>
      <p><strong>Page not found</strong></p>
      <p>The page you're looking for does not exist or some other error occurred.</p>
      <Button onClick={() => {history.push("/")}}>Take me home!</Button>
    </div>
  )
}

export default NotFoundPage