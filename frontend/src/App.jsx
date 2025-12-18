import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import EventPage from './pages/EventPage.jsx'
import RegistrationPage from './pages/RegistrationPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import EventListPage from './pages/admin/EventListPage.jsx'
import EventOverviewPage from './pages/admin/EventOverviewPage.jsx'
import ThemeSettingsPage from './pages/admin/ThemeSettingsPage.jsx'
import BannerSettingsPage from './pages/admin/BannerSettingsPage.jsx'
import TileSettingsPage from './pages/admin/TileSettingsPage.jsx'
import EventUsersPage from './pages/admin/EventUsersPage.jsx'
import EventRegistrationsPage from './pages/admin/EventRegistrationsPage.jsx'
import RegistrationFormConfigPage from './pages/admin/RegistrationFormConfigPage.jsx'
import WeatherSettingsPage from './pages/admin/WeatherSettingsPage.jsx'
import MapPinsSettingsPage from './pages/admin/MapPinsSettingsPage.jsx'
import EventLoginPage from './pages/EventLoginPage.jsx'
import ProtectedEventRoute from './components/ProtectedEventRoute.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { EventUserAuthProvider } from './context/EventUserAuthContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/:eventId/login',
    element: (
      <EventUserAuthProvider>
        <EventLoginPage />
      </EventUserAuthProvider>
    ),
  },
  {
    path: '/:eventId',
    element: (
      <EventUserAuthProvider>
        <ProtectedEventRoute>
          <EventPage />
        </ProtectedEventRoute>
      </EventUserAuthProvider>
    ),
  },
  {
    path: '/:eventId/registration',
    element: (
      <EventUserAuthProvider>
        <RegistrationPage />
      </EventUserAuthProvider>
    ),
  },
  {
    path: '/admin',
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'login', element: <AdminLoginPage /> },
      {
        element: <AdminLayout />,
        children: [
          { path: 'events', element: <EventListPage /> },
          {
            path: 'events/:eventId',
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: 'overview', element: <EventOverviewPage /> },
              { path: 'theme', element: <ThemeSettingsPage /> },
              { path: 'banners', element: <BannerSettingsPage /> },
              { path: 'tiles', element: <TileSettingsPage /> },
              { path: 'users', element: <EventUsersPage /> },
              { path: 'registrations', element: <EventRegistrationsPage /> },
              { path: 'registration-form-config', element: <RegistrationFormConfigPage /> },
              { path: 'weather', element: <WeatherSettingsPage /> },
              { path: 'map-pins', element: <MapPinsSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

const App = () => (
  <LanguageProvider>
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>
  </LanguageProvider>
)

export default App
