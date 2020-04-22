export const login = () => {
  return (dispatch, getState, {getFirebase}) => {
    window.gapi.auth2.getAuthInstance().signIn().then(user => {
      if (user.getHostedDomain() !== "commschool.org") {
        dispatch(loginError("You must log in with a @commschool.org email"))
        return
      }
      const firebase = getFirebase()
      return firebase.login({
        credential: firebase.auth.GoogleAuthProvider.credential(
          user.getAuthResponse().id_token,
        )
      })
    }).then((r) => {
      if (r)
        dispatch(loginSuccess())
    }).catch(err => {
      switch (err.type) {
        case "tokenFailed":
          dispatch(loginError("You must log in with a @commschool.org email"))
          return
        default:
          console.log(err)
      }
    })
  }
}

export const loginEmail = (email, password) => {
  return (dispatch, getState, {getFirebase}) => {
    const firebase = getFirebase()
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
      dispatch(loginSuccess())
    }).catch((e) => {
      switch (e.code) {
        case "auth/user-not-found":
          dispatch(loginError("Email not found."))
          return
        case "auth/wrong-password":
          dispatch(loginError("Incorrect password."))
          return
        default:
          dispatch(loginError(e.message))
      }
    })
  }
}

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const loginSuccess = () => ({
  type: LOGIN_SUCCESS,
})

export const LOGIN_ERROR = 'LOGIN_ERROR'
export const loginError = (msg) => ({
  type: LOGIN_ERROR,
  msg,
})