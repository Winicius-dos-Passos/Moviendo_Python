import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Lists from './pages/Lists';
import Biblioteca from './pages/Biblioteca';
import Estatisticas from './pages/Estatisticas';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/listas" element={<Lists />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/configuracoes" element={
            <div className="flex items-center justify-center h-screen">
              <p className="text-gray-400 text-xl">Configurações - Em desenvolvimento</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
