import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WindowManagerContextProvider } from './contexts/WindowManagerContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <WindowManagerContextProvider>
    <App />
  </WindowManagerContextProvider>
)
