import React from 'react'
import { Alert, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, withFirebase, withFirestore } from 'react-redux-firebase'
import { useHistory, withRouter } from 'react-router-dom'
import { compose, withState } from 'recompose'
import logo from '../images/logo.png'
import './LoginPage.css'
import NotFoundPage from './NotFoundPage'
import SignupForm from './SignupForm'
import SplashScreen from './SplashScreen'

const RegisterPage = ({firebase, firestore, auth, profile, meta, email, error, updateError}) => {
  const history = useHistory()
  if (!isLoaded(auth) || !isLoaded(profile) || !isLoaded(meta) || !meta.invite) {
    return <SplashScreen/>
  }
  if (!meta.invite.emails.includes(email)) {
    return <NotFoundPage/>
  }

  const handleSubmit = (values) => {
    firebase.auth().createUserWithEmailAndPassword(values.email, values.password)
    .then(() => {
      firestore.collection('meta').doc('invite').update({
        emails: firebase.firestore.FieldValue.arrayRemove(values.email)
      })
      const user = firebase.auth().currentUser
      
      firestore.collection('users').doc(user.uid).set({ 
        name: values.name
      }, { merge: true },)
      user.updateProfile({
        displayName: values.name
      }).then(() => {
        history.push("/")
      })
      
    }).catch(e => {
      switch (e.code) {
        case "auth/weak-password":
        default:
          updateError(e.message)
      }
    })
  }

  return (
    <Container fluid className="login-background">
    <div className="login-container d-flex flex-column">
      <img src={logo} alt="logo" width="70" height="70" className="d-inline-block mb-4 align-self-center" style={{margin: 'auto'}}/>
      <h3 className="text-center mb-3">Complete registration</h3>
      {error ? <Alert variant="danger">{error}</Alert> : null}
        <SignupForm email={email} onSubmit={handleSubmit}/>
    </div>
  </Container>
  )
}


const enhance = compose(
  withFirestore,
  withFirebase,
  withState('error', 'updateError', false),
  firestoreConnect([{ collection: 'meta', doc: 'invite'}]),
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    id: props.match.params.id,
    meta: state.firestore.data.meta,
    email: props.match.params.email,
  })),
)

export default withRouter(enhance(RegisterPage))