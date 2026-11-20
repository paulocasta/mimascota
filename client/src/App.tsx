import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PetFormPage } from './pages/PetFormPage';
import { PetPage } from './pages/PetPage';
import { PrintPage } from './pages/PrintPage';
import { VetsPage } from './pages/VetsPage';

export function App() {
  return (
    <>
      <header className="topbar no-print">
        <Link to="/" className="brand">
          <img src="/favicon.svg" alt="" width={28} height={28} />
          MiMascota
        </Link>
        <nav>
          <NavLink to="/" end>
            Mis mascotas
          </NavLink>
          <NavLink to="/veterinarios">Veterinarios</NavLink>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mascotas/nueva" element={<PetFormPage />} />
          <Route path="/mascotas/:id" element={<PetPage />} />
          <Route path="/mascotas/:id/editar" element={<PetFormPage />} />
          <Route path="/mascotas/:id/ficha" element={<PrintPage />} />
          <Route path="/veterinarios" element={<VetsPage />} />
          <Route path="*" element={<p className="muted">Página no encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
