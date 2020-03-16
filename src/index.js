import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ReactReduxFirebaseProvider } from 'react-redux-firebase'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import App from './components/App'
import SplashScreen from './components/SplashScreen'
import { setupFB } from "./firebase"
import './index.css'
import configureStore from './store/configureStore'

const { store, persistor } = configureStore()
ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
    <PersistGate loading={<SplashScreen/>} persistor={persistor}>
      <ReactReduxFirebaseProvider {...setupFB(store)}>
        <App />
      </ReactReduxFirebaseProvider>
    </PersistGate>
    </Provider>
  </BrowserRouter>,
  document.getElementById('root'));