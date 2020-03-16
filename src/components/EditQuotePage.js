import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, withFirestore } from 'react-redux-firebase'
import { useHistory, withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import NotFoundPage from './NotFoundPage'
import QuoteForm from './QuoteForm'
import SplashScreen from './SplashScreen'


const EditQuotePage = ({firestore, auth, profile, quotes, location}) => {
  const history = useHistory()
  const { from } = location.state || { from : { pathname: "/"}}

  if (!isLoaded(auth) || !isLoaded(profile)) {
    return <SplashScreen/>
  }
  if (!isLoaded(quotes)) {
    return <SplashScreen/>
  }
  if (quotes.length !== 1) {
    return <NotFoundPage/>
  }
  const quote = quotes[0]
  const canEditQuote = profile.isModerator
                    || (!quote.inPublication 
                      && profile.email === quote.submittedBy)
  
  const handleSubmit = (values) => {
    firestore.update(
      { collection: 'quotes', doc: quote.id },
      { quote: values }
    ).then(() => {
      history.push(from)
    })
  }
  return (
    <div className="main">
      <h3>Edit Quote</h3>
      <QuoteForm canEditQuote={canEditQuote} initialValues={quote.quote} onSubmit={handleSubmit}/>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withFirestore,
  firestoreConnect ((props) => [{ collection: 'quotes', doc: props.match.params.id}]),
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    quotes: state.firestore.ordered.quotes,
  })),
)

export default enhance(EditQuotePage)