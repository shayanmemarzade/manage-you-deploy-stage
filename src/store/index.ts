import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'

import authReducer from './reducer/auth';
import inviteesReducer from './reducer/inviteesList';
import documentsReducer from './reducer/documents';


const authPersistConfig = {
  key: 'auth',
  version: 1,
  storage: storage,
  blacklist: [''],
};
const inviteesPersistConfig = {
  key: 'invitees',
  version: 1,
  storage: storage,
  blacklist: [''],
};
const documentsPersistConfig = {
  key: 'documents',
  version: 1,
  storage: storage,
};

const authPersistReducer = persistReducer(authPersistConfig, authReducer);
const inviteesPersistReducer = persistReducer(inviteesPersistConfig, inviteesReducer);
const documentsPersistReducer = persistReducer(documentsPersistConfig, documentsReducer);


const store = configureStore({
  reducer: {
    // general: generalReducer,
    auth: authPersistReducer,
    invitees: inviteesPersistReducer,
    documents: documentsPersistReducer,
  },
  devTools: false,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });
    // .concat(api.middleware as Middleware);

    return middlewares;
  },
});

const persistor = persistStore(store);

setupListeners(store.dispatch);

export { store, persistor };

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
