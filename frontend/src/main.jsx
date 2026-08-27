import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

try {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
} catch (err) {
  console.error('RENDER CRASH:', err);
  document.getElementById('root').innerHTML = `<pre style="padding:40px;color:red;font-size:16px;">RENDER CRASH:\n${err.message}\n\n${err.stack}</pre>`;
}
