import { applyMiddleware, compose, createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import localStorage from 'redux-persist/lib/storage'
import thunk from 'redux-thunk'
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
      applyMiddleware(thunk),
      enhanceStore,
    )
  )

  const persistor = persistStore(store)

  return { store, persistor }
}

export default configureStore
