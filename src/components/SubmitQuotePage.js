import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { connect } from 'react-redux'
import { isEmpty, isLoaded, withFirestore } from 'react-redux-firebase'
import { useHistory } from 'react-router-dom'
import { compose } from 'recompose'
import QuoteForm from './QuoteForm'
import SplashScreen from './SplashScreen'

const SubmitQuotePage = ({firestore, auth}) => {
  const history = useHistory()
  const [showModal, updateShowModal] = useState(false)
  const handleSubmit = values => {
    firestore.add('quotes', {
      quote: values,
      approvedByModerator: false,
      submittedAt: firestore.FieldValue.serverTimestamp(),
      submittedBy: isEmpty(auth) ? "anonymous" : auth.email,
      votes: [],
      inPublication: false,
      nominated: false,
    })
    updateShowModal(true)
  }
  const handleHome = () => {
    history.push("/")
  }
  const handleAnother = () => {
    window.location.reload();
  } 
  if (!isLoaded(auth)) {
    return <SplashScreen/>
  }
  return (
  <div className="main">
    <h1>Submit a Quote</h1>
    <QuoteForm onSubmit={handleSubmit}/>
    <Modal show={showModal} onHide={handleAnother}>
      <Modal.Header closeButton>
        <Modal.Title>Submission Success!</Modal.Title>
      </Modal.Header>
      <Modal.Body>Woohoo, you've successfully submitted a quote! After a quotemaster reviews the quote, it will be included in next week's voting. </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHome}>
          Home
        </Button>
        <Button variant="primary" onClick={handleAnother}>
          Submit Another!
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
  )
}

const enhance = compose(
  withFirestore,
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
  })),
)

export default enhance(SubmitQuotePage)