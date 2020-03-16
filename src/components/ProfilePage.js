
import 'firebase/functions'
import React, { useState } from 'react'
import { Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import { isLoaded, withFirebase, withFirestore } from 'react-redux-firebase'
import { compose } from 'recompose'
import { change, reset } from 'redux-form'
import AddQuoteMasterForm from './AddQuoteMasterForm'
import InviteForm from './InviteForm'
import ProfileForm from './ProfileForm'
import SplashScreen from './SplashScreen'


const ProfilePage = ({firebase, firestore, auth, profile, changeInviteForm, dispatch}) => {
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  if (!isLoaded(auth) || !isLoaded(profile)) {
    return <SplashScreen/>
  }
  
  const profileFormSubmit = (values) => {
    firestore.update(
      { collection: 'users', doc: auth.uid }, 
      { isNewsletterSubscribe: values.newsletter },
    ).then(
      dispatch(reset("profileForm"))
    )
  }

  const addNewQuoteMasterFormSubmit = (values) => {
    const email = values.email + "@commschool.org"
    firestore.get({ collection: 'users', where: ['email', '==', email] }).then( snapshot => {
      if (snapshot.size !== 1) {
        setError(`${email} is not a registered QOTW account. Please log in to this website with that email at least once.`)
        return
      }
      console.log(snapshot.docs[0])
      if (snapshot.docs[0].data().isModerator) {
        setError(`${email} is already a quotemaster.`)
        return
      }
      firestore.update(
        { collection: 'users', doc: snapshot.docs[0].id },
        { isModerator: true },
      )
      setError(null)
      setNotification(`Successfully added ${email} as a quotemaster`)
    })
      
  }

  const inviteFormSubmit = (values) => {
    firestore.collection('users').where('email', '==', values.email).get().then(snapshot => {
      if (snapshot.size !== 0) {
        setError(`${values.email} is already a registered user`)
        return
      }
      const invite = firebase.functions().httpsCallable('invite')
      invite({email: values.email}).then(() => {
        setNotification(`Successfully invited ${values.email} to join`)
        setError(null)
        changeInviteForm("email", "")
      })
    })
    
    
  }
  const moderatorSection = <div>
    <hr/>
    <h3>Quotemaster Section</h3>
    { error ? <Alert variant="danger">{error}</Alert> : null }
    { notification ? <Alert variant="success">{notification}</Alert> : null }
    <h5>Invite a Non-Commonwealth Account</h5>
    <InviteForm onSubmit={inviteFormSubmit}/>
    <br/>
    <h5>Add a New Quotemaster</h5>
    <small>This action cannot be reversed</small>
    <AddQuoteMasterForm onSubmit={addNewQuoteMasterFormSubmit}/>
    
  </div>

  return (
  <div className="main">
    <h3>Profile</h3>

    <ProfileForm onSubmit={profileFormSubmit} isNewsletterSubscribe={profile.isNewsletterSubscribe} enableReinitialize={true} initialValues={{newsletter: profile.isNewsletterSubscribe}}/>
    { profile.isModerator ? moderatorSection : null}
  </div>
  )
}

const enhance = compose(
  withFirestore,
  withFirebase,
  connect(
  ({ firebase: { auth, profile } }) => ({
    auth,
    profile
  }), (dispatch) => ({
    changeInviteForm: (field, value) => {
      dispatch(change("inviteForm", field, value))
    }
  })),
)

export default enhance(ProfilePage)