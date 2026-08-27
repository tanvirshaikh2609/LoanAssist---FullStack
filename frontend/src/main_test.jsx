// Minimal test - just render a div to check if React works
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const TestApp = () => {
  return <div style={{padding: '40px', fontSize: '24px', color: 'black', background: 'white'}}>
    <h1>React is working!</h1>
    <p>If you see this, React itself is fine. The issue is in App/Routes/components.</p>
  </div>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TestApp />
  </StrictMode>,
)
