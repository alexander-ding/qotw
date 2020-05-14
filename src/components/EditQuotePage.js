import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect, isLoaded, withFirestore } from 'react-redux-firebase'
import { useHistory, withRouter } from 'react-router-dom'
import { useLastLocation } from 'react-router-last-location'
import { compose } from 'recompose'
import NotFoundPage from './NotFoundPage'
import QuoteForm from './QuoteForm'
import SplashScreen from './SplashScreen'

const EditQuotePage = ({firestore, auth, profile, quote}) => {
  const history = useHistory()
  const lastLocation = useLastLocation()
  const from = lastLocation ? lastLocation : '/'

  if (!isLoaded(auth) || !isLoaded(profile)) {
    return <SplashScreen/>
  }
  if (!isLoaded(quote)) {
    return <SplashScreen/>
  }
  if (!quote) {
    return <NotFoundPage/>
  }
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
  firestoreConnect ((props) => [{ collection: 'quotes', doc: props.match.params.id, storeAs: `quote${props.match.params.id}`}]),
  connect((state, props) => ({
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    quote: state.firestore.data[`quote${props.match.params.id}`],
  })),
)

export default enhance(EditQuotePage)