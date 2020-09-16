import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/functions'
import { createFirestoreInstance, reduxFirestore } from 'redux-firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBpgw6JfwPUIk_Wu_0IQ8Ly6vQDhyfZYcg",
  authDomain: "app.qotw.net",
  databaseURL: "https://qotw-270106.firebaseio.com",
  projectId: "qotw-270106",
  storageBucket: "qotw-270106.appspot.com",
  messagingSenderId: "47305262498",
  appId: "1:47305262498:web:2e34f6e4e13bdd6b979efb",
  measurementId: "G-QDDK69WRZ9"
}

const rrfConfig = {
  userProfile: 'users',
  useFirestoreForProfile: true, 
  customAuthParameters: {
    google: {
      hd: 'commschool.org',
    }
  }
}

firebase.initializeApp(firebaseConfig)
firebase.functions()
firebase.firestore()
if (process.env.NODE_ENV !== "production") {
  firebase.functions().useFunctionsEmulator("http://localhost:5001")
  firebase.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  })
}

const rfConfig = {}

export const enhanceStore = reduxFirestore(firebase, rfConfig)

export const setupFB = (store) => ({
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance,
})