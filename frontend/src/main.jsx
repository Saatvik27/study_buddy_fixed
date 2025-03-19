// frontend/src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './output.css'; // Ensure the path is correct
import './index.css';
import App from './App.jsx'; // Correct file extension

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);