import React from 'react'
import Container from 'react-bootstrap/Container'
import { Route, Switch } from 'react-router-dom'
import { compose, lifecycle } from 'recompose'
import AuthIsLoaded from '../utils/AuthIsLoaded'
import PrivateRoute from '../utils/PrivateRoute'
import AboutPage from './AboutPage'
import AlumLoginPage from './AlumLoginPage'
import './App.css'
import ArchivePage from './ArchivePage'
import ConsolePage from './ConsolePage'
import DevTools from "./DevTools"
import EditQuotePage from './EditQuotePage'
import HistoryPage from './HistoryPage'
import HomePage from "./HomePage"
import LoginPage from './LoginPage'
import Navbar from './Navbar'
import NotFoundPage from './NotFoundPage'
import PrivacyPage from './PrivacyPage'
import ProfilePage from './ProfilePage'
import RegisterPage from './RegisterPage'
import SubmitQuotePage from './SubmitQuotePage'
import VotePage from './VotePage'
const App = () => (
  <React.Fragment>
    <Switch>
      <Route path="/Login"><LoginPage/></Route>
      <Route path="/AlumLogin"><AlumLoginPage/></Route>
      <Route path="/Register/:email"><RegisterPage/></Route>
      <Route path="/Privacy"><PrivacyPage/></Route>
      <Route path="*">
        <Navbar/>
        <Container fluid>
          <AuthIsLoaded>
            <Switch>
              <Route exact path="/"><HomePage/></Route>
              <Route exact path="/Archive"><ArchivePage/></Route>
              <Route exact path="/About"><AboutPage/></Route>
              <PrivateRoute path="/Submit"><SubmitQuotePage/></PrivateRoute>
              <PrivateRoute path="/Vote"><VotePage/></PrivateRoute>
              <PrivateRoute path="/Profile"><ProfilePage/></PrivateRoute>
              <PrivateRoute path="/Console"><ConsolePage/></PrivateRoute>
              <PrivateRoute path="/History"><HistoryPage/></PrivateRoute>
              <PrivateRoute path="/EditQuote/:id"><EditQuotePage/></PrivateRoute>
              <Route path="*"><NotFoundPage/></Route>
            </Switch>
          </AuthIsLoaded>
        </Container>
      </Route>
    </Switch>
    { process.env.NODE_ENV === "production" ? null : <DevTools/> }
  </React.Fragment>
)

const enhance = compose(
  lifecycle({
    componentDidMount() {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: '47305262498-mqvh1bfdt6clmrqsjti4erasvvjumnof.apps.googleusercontent.com',
          hosted_domain: 'commschool.org',
        })
      })
    }
  })
)

export default enhance(App)
