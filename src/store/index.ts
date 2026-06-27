import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import groupsReducer from './slices/groupsSlice';
import rolesReducer from './slices/rolesSlice';
import planReducer from './slices/planSlice';
import analyticsReducer from './slices/analyticsSlice';
import supportReducer from './slices/supportSlice';
import logsReducer from './slices/logsSlice';
import settingsReducer from './slices/settingsSlice';
import billingReducer from './slices/billingSlice';
import notificationsReducer from './slices/notificationsSlice';
import enquiriesReducer from './slices/enquiriesSlice';
import photosReducer from './slices/photosSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    groups: groupsReducer,
    roles: rolesReducer,
    plans: planReducer,
    analytics: analyticsReducer,
    support: supportReducer,
    logs: logsReducer,
    settings: settingsReducer,
    billing: billingReducer,
    notifications: notificationsReducer,
    enquiries: enquiriesReducer,
    photos: photosReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
