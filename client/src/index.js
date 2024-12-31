import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

//we are unabled reactStrictMode as it makes conflit and shows error
root.render(
    <App />
);


reportWebVitals();
