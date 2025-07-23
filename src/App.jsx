import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import EbookDetail from './pages/EbookDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="ebook/:id" element={<EbookDetail />} />
      </Route>
    </Routes>
  )
}

export default App