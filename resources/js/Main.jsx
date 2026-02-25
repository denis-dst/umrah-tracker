import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ChecklistPage from './pages/ChecklistPage';
import PlanningPage from './pages/PlanningPage';
import HistoryPage from './pages/HistoryPage';
import GroupPage from './pages/GroupPage';
import ProfilePage from './pages/ProfilePage';
import ReminderPage from './pages/ReminderPage';
import AdminDashboard from './pages/AdminDashboard';
import SessionTracker from './components/SessionTracker';
import BottomNav from './components/BottomNav';
import PrayerLogPage from './pages/PrayerLogPage';
import DuaPage from './pages/DuaPage';
import QuranPage from './pages/QuranPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    console.log('ProtectedRoute:', { user, loading });
    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const TrackerView = ({ type }) => (
    <div style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>{type === 'tawaf' ? 'Tawaf Tracker' : "Sa'i Tracker"}</h1>
        <SessionTracker type={type} />
        <BottomNav />
    </div>
);

const AuthCallback = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            import('axios').then(({ default: axios }) => {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                axios.get('/api/me').then(res => {
                    setUser(res.data);
                    navigate('/');
                }).catch(() => {
                    navigate('/login?error=auth_failed');
                });
            });
        } else {
            navigate('/login');
        }
    }, [setUser, navigate]);

    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Authenticating...</div>;
};

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = React.useState('test@example.com');
    const [password, setPassword] = React.useState('password');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            window.location.href = '/';
        } catch (err) {
            alert('Login failed. Check backend/database.');
        }
    };

    const handleGoogleLogin = () => {
        alert('Fitur Login Google akan segera hadir!');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
            <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Umrah Tracker</h2>
                <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>Silakan masuk untuk melanjutkan</p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', opacity: 0.6, marginLeft: '5px' }}>Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', opacity: 0.6, marginLeft: '5px' }}>Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '12px', marginTop: '10px', fontSize: '15px', fontWeight: 'bold' }}>Login</button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '25px 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ fontSize: '12px', opacity: 0.4 }}>Atau</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'white',
                        color: '#1a1a2e',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                    Masuk dengan Google
                </button>
            </div>
        </div>
    );
};

const Main = () => {
    console.log('Rendering Main component');
    return (
        <AuthProvider>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/checklist" element={<ProtectedRoute><ChecklistPage /></ProtectedRoute>} />
                    <Route path="/plan" element={<ProtectedRoute><PlanningPage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                    <Route path="/groups" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
                    <Route path="/reminders" element={<ProtectedRoute><ReminderPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/tracker/tawaf" element={<ProtectedRoute><TrackerView type="tawaf" /></ProtectedRoute>} />
                    <Route path="/tracker/sai" element={<ProtectedRoute><TrackerView type="sai" /></ProtectedRoute>} />
                    <Route path="/log-prayer" element={<ProtectedRoute><PrayerLogPage /></ProtectedRoute>} />
                    <Route path="/doas" element={<ProtectedRoute><DuaPage /></ProtectedRoute>} />
                    <Route path="/quran" element={<ProtectedRoute><QuranPage /></ProtectedRoute>} />
                </Routes>
            </div>
        </AuthProvider>
    );
};

export default Main;
