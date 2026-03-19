import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';

// Layouts y guards – se cargan siempre de forma síncrona
import NavBar from './components/NavBar';
import MedicalLayout from './components/MedicalLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const MedicalLogin      = lazy(() => import('./pages/MedicalLogin'));

// Bloque Médico
const Remisiones            = lazy(() => import('./pages/Remisiones'));
const SearchRemission       = lazy(() => import('./pages/SearchRemission'));
const ServicioTecnico       = lazy(() => import('./pages/ServicioTecnico'));
const ServicioTecnicoResumen = lazy(() => import('./pages/ServicioTecnicoResumen'));
const VolumeReportPage      = lazy(() => import('./pages/VolumeReportPage'));
const ProductsPage          = lazy(() => import('./pages/ProductsPage'));
const SalesPage             = lazy(() => import('./pages/SalesPage'));

// Bloque Especialistas
const SearchSpecialists = lazy(() => import('./pages/SearchSpecialists'));
const BookingForm       = lazy(() => import('./components/BookingForm'));
const BookingList       = lazy(() => import('./components/BookingList'));
const SpecialistDetails = lazy(() => import('./pages/SpecialistDetails'));
const CalendarPage      = lazy(() => import('./pages/CalendarPage'));
const RCAWizard         = lazy(() => import('./pages/RCAWizard'));

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b4f6c',
      light: '#3f7892',
      dark: '#07364a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5a4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f8fb',
      paper: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Manrope, Nunito Sans, Segoe UI, system-ui, sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: -0.4,
    },
    h5: {
      fontWeight: 800,
      letterSpacing: -0.3,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(90deg, #0b4f6c 0%, #0a6a88 100%)',
          boxShadow: '0 8px 24px rgba(11, 79, 108, 0.18)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(11, 79, 108, 0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/medical-login" element={<MedicalLogin />} />

            {/* ---- BLOQUE: Layout Médico (MUI) ---- */}
            <Route
              element={
                <ProtectedRoute>
                  <MedicalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/remisiones" element={<Remisiones />} />
              <Route path="/entrega-equipo" element={<SearchRemission />} />
              <Route path="/servicio-tecnico" element={<ServicioTecnico />} />
              <Route path="/servicio-tecnico-resumen" element={<ServicioTecnicoResumen />} />
              <Route path="/reports/volume" element={<VolumeReportPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sales" element={<SalesPage />} />
            </Route>

            {/* ---- BLOQUE: Flujo Especialistas (MUI) ---- */}
            <Route
              element={
                <ProtectedRoute>
                  <NavBar />
                </ProtectedRoute>
              }
            >
              <Route path="/search-specialists" element={<SearchSpecialists />} />
              <Route path="/create-booking" element={<BookingForm />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/specialists/:id" element={<SpecialistDetails />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/rca-wizard" element={<RCAWizard />} />
            </Route>

            {/* Fallback para evitar pantalla en blanco en rutas no reconocidas */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
