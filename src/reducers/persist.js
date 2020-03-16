import { persistReducer } from 'redux-persist';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import storage from 'redux-persist/lib/storage';


export default function persist(key, whitelist, reducer) {
  const whitelistVal = whitelist.length ? whitelist : null
  return persistReducer({
    key,
    storage: storage,
    whitelist: whitelistVal,
    stateReconciler: hardSet,
  }, reducer);
}