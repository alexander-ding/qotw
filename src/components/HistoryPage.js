import { Icon } from '@material-ui/core'
import React from 'react'
import { Button, ButtonGroup, Card, Col, Row, Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, withFirebase, withFirestore } from 'react-redux-firebase'
import { useHistory } from 'react-router-dom'
import { compose, lifecycle, withState } from 'recompose'
import QuoteBase from './QuoteBase'
import SplashScreen from './SplashScreen'
let ProcessQuote = ({quote, firestore}) => {
  const history = useHistory()

  const cancelQuote = () => {
    firestore.delete(
      { collection: 'quotes', doc: quote.id },
    )
  }
  return (
    <Card>
      <Card.Body>
      <Row>
        <Col sm={10}>
          <QuoteBase key={quote.id} quote={quote.quote.quote} people={quote.quote.people} id={quote.id}></QuoteBase>
        </Col>
        <Col sm={2} className="d-flex">
          <ButtonGroup className="ml-auto" aria-label="Basic example">
            <Button style={{padding: 0}} variant="link" onClick={() => {history.push("/EditQuote/"+quote.id)}}><Icon>edit</Icon></Button>
            <Button style={{padding: 0}} variant="link" onClick={cancelQuote}><Icon>delete</Icon></Button>
          </ButtonGroup>
        </Col>
      </Row>
      </Card.Body>
    </Card>
  )
}

ProcessQuote = withFirestore(ProcessQuote)

const PastQuote = ({quote}) => {
  return (
    <Card>
      <Card.Body>
        <QuoteBase key={quote.id} quote={quote.quote.quote} people={quote.quote.people} id={quote.id}></QuoteBase>
      </Card.Body>
    </Card>
  )
}

const HistoryPage = ({firebase, firestore, auth, profile, quotes, data}) => {
  const history = useHistory()
  
  if (!isLoaded(auth) || !isLoaded(profile) || !data) {
    return <SplashScreen/>
  }
  if (!isLoaded(quotes)) {
    return <SplashScreen/>
  }
  const currentCycleQuotes = quotes.filter(quote => !quote.inPublication)
  const pastQuotes = quotes.filter(quote => quote.inPublication).sort((a,b) => a.submittedAt._seconds - b.submittedAt._seconds)
  const myQuotes = data

  return (
  <div className="main">
    <h3>History</h3>
    <Tabs defaultActiveKey="submissions">
      <Tab eventKey="submissions" title="My Submissions">
        <Card>
          
            <Card.Body>
              <div>
                <Card.Text>Current Cycle</Card.Text>
                { currentCycleQuotes.length ? 
                  currentCycleQuotes.map(quote => <ProcessQuote key={quote.id} quote={quote}/>) : 
                  <Card.Text>You haven't submitted a quote this cycle yet. </Card.Text>
                }
              </div> 
            </Card.Body>

          
          { pastQuotes.length ? 
            <Card.Body>
              <div>
                <Card.Text>Past Submissions</Card.Text>
                {pastQuotes.map(quote => <PastQuote key={quote.id} quote={quote} nominated={quote.nominated}/>)}
              </div>
            </Card.Body> :
            null
          }

        </Card>
      </Tab>
      <Tab eventKey="quotes" title="My Quotes">
        <Card>
          { myQuotes.length ? 
            <Card.Body>
              <div>
                <Card.Text>Current Cycle</Card.Text>
                {currentCycleQuotes.map(quote => <ProcessQuote key={quote.id} quote={quote}/>)}
              </div> 
            </Card.Body> :
            null
          } 
        </Card>
      </Tab>
    </Tabs>
  </div>
  )
}

const enhance = compose(
  withFirestore,
  withFirebase,
  withState('data', 'setData', null),
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    quotes: state.firestore.ordered.quotes,
  })),
  firestoreConnect ((props) => 
  [{ 
    collection: 'quotes',
    where: [['submittedBy', '==', props.auth.email]]
  }]),
  lifecycle({
    componentDidMount() {
      const getQuotesOfEmail = this.props.firebase.functions().httpsCallable('getQuotesOfEmail')
      getQuotesOfEmail({email: this.props.auth.email}).then((result) => {
        this.props.setData(result.data)
      })
    }
  }),
  
)

export default enhance(HistoryPage)