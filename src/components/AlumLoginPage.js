import React from 'react'
import { Alert, Container } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isEmpty, withFirebase, withFirestore } from 'react-redux-firebase'
import { Redirect, withRouter } from 'react-router-dom'
import { compose, withState } from 'recompose'
import { loginEmail } from '../actions'
import logo from "../images/logo.png"
import LoginForm from './LoginForm'
import "./LoginPage.css"

const LoginPage = ({firebase, firestore, auth, location, error, login}) => {
  if (!isEmpty(auth)) {
    const { from } = location.state || { from : { pathname: "/"}}
    return <Redirect to={from}/>
  }

  return (
    <Container fluid className="login-background">
    <Alert variant="info">To acquire an alumni account, please contact a current quotemaster via <a href="mailto:qotw@qotw.net?Subject=Alumni%20Email%20Request" target="_top">qotw@qotw.net</a></Alert>
      <div className="login-container d-flex flex-column">
        
        <img src={logo} alt="logo" width="70" height="70" className="d-inline-block mb-4" style={{margin: 'auto'}}/>
        <h3 className="text-center mb-3">Please log in</h3>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <div >
          <h5 className="text-center">Alumni</h5>
          <LoginForm onSubmit={login}/>
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
    (state) => ({
      auth: state.firebase.auth,
      profile: state.firebase.profile,
      error: state.login,
    }), dispatch => ({
      login: (values) => dispatch(loginEmail(values.email, values.password))
    })
  ),
  withFirebase,
)

export default enhance(LoginPage)