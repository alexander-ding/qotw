import React from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty, withFirebase, withFirestore } from 'react-redux-firebase'
import { Redirect, useHistory, withRouter } from 'react-router-dom'
import { compose, withState } from 'recompose'
import logo from "../images/logo.png"
import "./LoginPage.css"

const LoginPage = ({firebase, firestore, auth, location, error, updateError}) => {
  const history = useHistory()
  const googleLogin = () => {
    firebase.login({
      provider: 'google',
      type: 'popup',
    }).catch(e => {
      switch (e.code) {
        case "auth/popup-closed-by-user":
          updateError("Pop up was closed by user. Try again?")
          break
        default:
          updateError(e.message)
      }
    })
  }

  if (!isEmpty(auth)) {
    const { from } = location.state || { from : { pathname: "/"}}
    return <Redirect to={from}/>
  }

  return (
    <Container fluid className="login-background">
      <div className="login-container d-flex flex-column">
        <img src={logo} alt="logo" width="70" height="70" className="d-inline-block mb-4" style={{margin: 'auto'}}/>
        <h3 className="text-center mb-3">Please log in</h3>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <div className="text-center">
          <h5>Commonwealth Students</h5>
          <Button block onClick={googleLogin}>Login with Google</Button>
          <small id="emailHelp" className="form-text text-muted">Your submissions will be anonymous. Only the quotemasters can see who you are.</small>
        </div>
        <br/>
        <div className="text-center">
          <p>Are you an alumni? Click <Button variant="link" className="mx-0 p-0" style={{verticalAlign: 'baseline'}} onClick={() => {history.push("/AlumLogin")}}>here</Button></p>
        </div>
      </div>
    </Container>
  )
}

const enhance = compose(
  withFirebase,
  withFirestore,
  withRouter,
  withState("error", "updateError", null),
  connect(
    ({ firebase: { auth, profile } }) => ({
      auth,
      profile
    })
  ),
  withFirebase,
)

export default enhance(LoginPage)