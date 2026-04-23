import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './router'

function App() {
  if (!window.location.pathname.startsWith('/seller')) {
    window.location.replace('/seller/login')
    return null
  }

  return (
    <BrowserRouter basename="/seller">
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
