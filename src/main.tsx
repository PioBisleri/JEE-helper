import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore - side-effect CSS imports
import './index.css'
// @ts-ignore - side-effect CSS imports
import 'katex/dist/katex.min.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
