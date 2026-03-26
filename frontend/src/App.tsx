import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import SystemPage from './pages/SystemPage'
import ContainersPage from './pages/ContainersPage'
import ServicesPage from './pages/ServicesPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<SystemPage />} />
          <Route path="containers" element={<ContainersPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
