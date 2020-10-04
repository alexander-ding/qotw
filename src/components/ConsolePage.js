
import Icon from '@material-ui/core/Icon'
import 'firebase/functions'
import React from 'react'
import { Alert, Button, ButtonGroup, ButtonToolbar, Card, Col, ListGroup, Modal, Row, Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, withFirebase, withFirestore } from 'react-redux-firebase'
import { useHistory } from 'react-router-dom'
import { compose, lifecycle, withState } from 'recompose'
import { change, getFormValues, submit } from 'redux-form'
import { rankQuotes } from '../utils'
import PublishForm from './PublishForm'
import QuoteBase from './QuoteBase'
import Quotes from './Quotes'
import SplashScreen from './SplashScreen'


let ProcessQuote = ({quote, name, firestore}) => {
  const history = useHistory()
  const acceptQuote = () => {
    firestore.update(
      { collection: 'quotes', doc: quote.id },
      { approvedByModerator: true },
    )
  }

  const rejectQuote = () => {
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
          <Card.Text>Submitted by {name}</Card.Text>
        </Col>
        <Col sm={2} className="d-flex">
          <ButtonGroup className="ml-auto" aria-label="Basic example">
            <Button style={{padding: 0}} variant="link" onClick={() => {history.push("/EditQuote/"+quote.id)}}><Icon>edit</Icon></Button>
            <Button style={{padding: 0}} variant="link" onClick={acceptQuote}><Icon>check</Icon></Button>
            <Button style={{padding: 0}} variant="link" onClick={rejectQuote}><Icon>delete</Icon></Button>
          </ButtonGroup>
        </Col>
      </Row>
      </Card.Body>
    </Card>
  )
}

ProcessQuote = withFirestore(ProcessQuote)

let AcceptedQuote = ({quote, name, nominated, firestore}) => {
  const history = useHistory()
  const rejectQuote = () => {
    firestore.update(
      { collection: 'quotes', doc: quote.id },
      { approvedByModerator: false, nominated: false, },
    )
  }
  const nominateQuote = (b) => () => {
    firestore.update(
      {collection: 'quotes', doc: quote.id },
      { nominated: b },
    )
  }
  return (
    <Card>
      <Card.Body>
      <Row>
        <Col sm={10}>
          <QuoteBase key={quote.id} quote={quote.quote.quote} people={quote.quote.people} id={quote.id}></QuoteBase>
          <Card.Text>Submitted by {name}</Card.Text>
        </Col>
        <Col sm={2} className="d-flex">
          <ButtonGroup className="ml-auto" aria-label="Basic example">
            <Button style={{padding: 0}} variant="link" onClick={() => {history.push("/EditQuote/"+quote.id)}}><Icon>edit</Icon></Button>
            {nominated ? 
              <Button style={{padding: 0}} variant="link" onClick={nominateQuote(false)}><Icon>star</Icon></Button> :
              <Button style={{padding: 0}} variant="link" onClick={nominateQuote(true)}><Icon>star_border</Icon></Button>
            }
            <Button style={{padding: 0}} variant="link" onClick={rejectQuote}><Icon>close</Icon></Button>
          </ButtonGroup>
        </Col>
      </Row>
      </Card.Body>
    </Card>
  )
}

AcceptedQuote = withFirestore(AcceptedQuote)

const ConsolePage = ({firebase, state, firestore, auth, profile, quotes, users, meta, dispatch,
  warning, updateWarning, info, updateInfo, data, activeKey, updateActiveKey, publishForm,
  showTopQuotes, updateShowTopQuotes, showNominations, updateShowNominations, changePublishForm,
  showConfirm, updateShowConfirm,
}) => {
  const history = useHistory()

  if (!isLoaded(auth) || !isLoaded(profile)) {
    return <SplashScreen/>
  } else {
    if (!profile.isModerator) {
      history.push("/")
    }
  }
  if (!isLoaded(quotes) || !isLoaded(users) || !isLoaded(meta) || !data) {
    return <SplashScreen/>
  }
  const formEmail = (publishForm ? publishForm.email : null)
  const formTitle = (publishForm ? publishForm.title : null)
  const formPublish = (publishForm ? publishForm.publish : false)
  let emailToName = users.reduce((map, user) => {
    map[user.email] = user.name
    return map
  }, {})
  emailToName["anonymous"] = "Anonymous"
  
  const quotesUnapproved = quotes.filter(quote => !quote.approvedByModerator)
  const quotesApproved = quotes.filter(quote => quote.approvedByModerator)

  const handleSend = () => {
    if (formPublish && quotesUnapproved.length) {
      updateWarning("You must process all current submissions before publishing.")
      return
    }
    updateShowConfirm(true)
  }

  const handleConfirm = () => {
    dispatch(submit('publishForm'))
    updateWarning(null)
    updateInfo("This week's QOTW has been sent.")
    updateShowConfirm(false)
  }

  const handleSubmit = (values) => {
    console.log()
    if (values.publish) {
      const publish = firebase.functions().httpsCallable('publish')
      handleReset()
      publish({content: values.email, title: values.title})
    } else {
      const sendMailinglistEmail = firebase.functions().httpsCallable('sendMailinglistEmail')
      handleReset()
      sendMailinglistEmail({content: values.email, title: values.title})
    }
  }

  const handleSave = () => {
    firestore.update(
      { collection: "meta", doc: "email"},
      { content: formEmail, title: formTitle }
    )
  }

  const handleSaveTemplate = () => {
    firestore.update(
      { collection: "meta", doc: "email"},
      { template: formEmail }
    )
  }


  const handleReset = () => {
    firestore.update(
      { collection: "meta", doc: "email"},
      { content: meta.email.template, title: "" }
    )
    changePublishForm("email", meta.email.template)
  }

  const handleTopQuotes = () => {
    updateShowTopQuotes(true)
  }

  const handleNominations = () => {
    updateShowNominations(true)
  }


  return (
  <div className="main">
    <h3>Quotemaster Console</h3>
    {warning ? <Alert variant="danger">{warning}</Alert> : null}
    {info ? <Alert variant="info">{info}</Alert> : null}
    <Tabs defaultActiveKey="submissions">
      <Tab eventKey="submissions" title="Submissions">
        <Card>
          
          { quotesUnapproved.length ? 
            <Card.Body>
              <div>
                <Card.Text>Process Submissions</Card.Text>
                {quotesUnapproved.map(quote => <ProcessQuote key={quote.id} quote={quote} name={emailToName[quote.submittedBy]}/>)}
              </div> 
            </Card.Body> :
            null
          } 
          
          { quotesApproved.length ? 
            <Card.Body>
              <div>
                <Card.Text>Accepted Submissions</Card.Text>
                {quotesApproved.map(quote => <AcceptedQuote key={quote.id} quote={quote} name={emailToName[quote.submittedBy]} nominated={quote.nominated}/>)}
              </div>
            </Card.Body> :
            null
          }

        </Card>
      </Tab>
      <Tab eventKey="votes" title="Votes">
        <Card>
          <Card.Body>
          <Card.Text>Quote ranking based on current votes.</Card.Text>
          <Card.Text>{`${data.voters.length} vote(s) recorded`}</Card.Text>
          <Quotes quotes={data.quotes} profile={profile} auth={auth}/>
          </Card.Body>
        </Card>
      </Tab>
      <Tab eventKey="publish" title="Publish" >
        <Card>
          <Card.Body>
          <Card.Text>Compose an email to all newsletter subscribers, optionally publishing the current quotes. </Card.Text>
          <PublishForm onSubmit={handleSubmit} initialValues={{email: meta.email.content, title: meta.email.title, publish: true}}/>
          <ButtonToolbar>
            <ButtonGroup className="mr-2">
              <Button onClick={handleSend}>Send</Button>
            </ButtonGroup>
            <ButtonGroup className="mr-2">
              <Button variant="info" disabled={formEmail === meta.email.content && formTitle === meta.email.title} onClick={handleSave}>Save</Button>
              <Button variant="info" disabled={formEmail === meta.email.template} onClick={handleReset}>Reset</Button>
            </ButtonGroup>
            <ButtonGroup className="mr-2">
              <Button variant="success" onClick={handleTopQuotes}>Top Quotes</Button>
              <Button variant="success" onClick={handleNominations}>Nominations</Button>
            </ButtonGroup>
            <ButtonGroup className="mr-2">
              <Button variant="danger" disabled={formEmail === meta.email.template} onClick={handleSaveTemplate}>Save as Template</Button>
            </ButtonGroup>
          </ButtonToolbar>
          
          </Card.Body>
        </Card>
      </Tab>
    </Tabs>
    <Modal show={showTopQuotes} onHide={() => {updateShowTopQuotes(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>Top Quotes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          {data.quotes.slice(0, 10).map((quote, index) => <ListGroup.Item key={quote.id} className="multi-line-display">{`${index+1}.`} {quote.quote.quote}</ListGroup.Item>)}
        </ListGroup>
      </Modal.Body>
    </Modal>
    <Modal show={showNominations} onHide={() => {updateShowNominations(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>Nominations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          {quotesApproved.filter(quote => quote.nominated).map((quote, index) => <ListGroup.Item key={quote.id} className="multi-line-display">{`${index+1}.`} {quote.quote.quote}</ListGroup.Item>)}
        </ListGroup>
      </Modal.Body>
    </Modal>
    <Modal show={showConfirm} onHide={() => {updateShowConfirm(false)}}>
      <Modal.Header closeButton>
        <Modal.Title>Are You Sure?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>The following email will be sent to the entire QOTW mailing list{formPublish ? ", and the system will roll into a new cycle of quotes. Current submissions will become available for voting, and the current voting will be closed. " : null }</p>
        <Card>
          <Card.Body>
          <Card.Title>
            QOTW: {formTitle}
          </Card.Title>
          <Card.Text className="multi-line-display">
            {formEmail}
          </Card.Text>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => {updateShowConfirm(false)}}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  </div>
  )
}

const enhance = compose(
  withFirestore,
  withFirebase,
  withState("warning", "updateWarning", null),
  withState("info", "updateInfo", null),
  withState("data", "updateData", null),
  withState("showTopQuotes", "updateShowTopQuotes", false),
  withState("showNominations", "updateShowNominations", false),
  withState("showConfirm", "updateShowConfirm", false),
  firestoreConnect (() => 
  [{ 
    collection: 'quotes',
    where: [['inPublication', '==', false]]
  }, { 
    collection: 'users',
  }, {
    collection: 'meta',
    doc: 'email',
  }]),
  lifecycle({
    componentDidMount() {
      const getQuotes = this.props.firebase.functions().httpsCallable('getQuotes')
      getQuotes({status: "pending"}).then((result) => {
        this.setState({
          data: (Object.assign(result.data, {
          quotes: rankQuotes(result.data.quotes.filter(quote => quote.nominated)),
        }))})
      })
    }
  }),
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    quotes: state.firestore.ordered.quotes,
    users: state.firestore.ordered.users,
    meta: state.firestore.data.meta,
    publishForm: getFormValues('publishForm')(state)
  }), (dispatch) => ({
    changePublishForm: (field, value) => {
      dispatch(change("publishForm", field, value))
    }
  })),
)

export default enhance(ConsolePage)