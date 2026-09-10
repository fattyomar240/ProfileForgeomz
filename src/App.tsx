import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import CreateProfilePage from '@/pages/CreateProfilePage';
import PreviewPage from '@/pages/PreviewPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

function Pages() {
  const { route, navigate } = useRouter();
  const { session, isAdmin, loading } = useAuth();

  // Admin routes: full-screen, no public chrome
  if (route === 'admin-login') {
    return <AdminLoginPage />;
  }

  if (route === 'admin') {
    if (loading) return null;
    if (!session || !isAdmin) {
      navigate('admin-login');
      return null;
    }
    return <AdminDashboardPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {route === 'home' && <HomePage />}
        {route === 'create' && <CreateProfilePage />}
        {route === 'preview' && <PreviewPage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <RouterProvider>
          <Pages />
        </RouterProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
