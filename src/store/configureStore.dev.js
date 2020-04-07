import { getFirebase } from 'react-redux-firebase'
import { applyMiddleware, compose, createStore } from 'redux'
import { getFirestore } from 'redux-firestore'
import { createLogger } from 'redux-logger'
import { persistReducer, persistStore } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
import DevTools from '../components/DevTools'
import { enhanceStore } from '../firebase'
import rootReducer from '../reducers'

const persistConfig = {
  key: 'root',
  storage: localStorage,
  blacklist: ['form']
}

const configureStore = preloadedState => {
  const persistedReducer = persistReducer(persistConfig, rootReducer)
  const store = createStore(
    persistedReducer,
    preloadedState,
    compose(
      applyMiddleware(
        thunk.withExtraArgument({getFirebase, getFirestore}), 
        createLogger()
      ),
      enhanceStore,
      DevTools.instrument(),
    )
  )

  const persistor = persistStore(store)

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return { store, persistor }
}

export default configureStore
