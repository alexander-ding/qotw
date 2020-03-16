import { firebaseReducer } from 'react-redux-firebase'
import { combineReducers } from "redux"
import { firestoreReducer } from 'redux-firestore'
import { reducer as formReducer } from 'redux-form'
import locationReducer from './location'
import persist from "./persist"

export default combineReducers({
  form: formReducer,
  firebase: persist('firebaseState', [], firebaseReducer),
  firestore: persist('firestoreState', [], firestoreReducer),
  location: locationReducer,
})

