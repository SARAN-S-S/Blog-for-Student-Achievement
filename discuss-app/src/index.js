import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ContextProvider } from './context/Context';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';

if (process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ContextProvider>
        <App />
      </ContextProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
