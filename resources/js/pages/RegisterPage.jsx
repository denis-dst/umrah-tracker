import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        invite_code: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const passwordStrength = useMemo(() => {
        const pass = formData.password;
        if (!pass) return { score: 0, label: '', color: 'transparent' };
        
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        switch (score) {
            case 1: return { score: 25, label: 'Lemah', color: '#ff4d4d' };
            case 2: return { score: 50, label: 'Cukup', color: '#ffd43b' };
            case 3: return { score: 75, label: 'Kuat', color: '#20c997' };
            case 4: return { score: 100, label: 'Sangat Kuat', color: '#2dce89' };
            default: return { score: 10, label: 'Sangat Lemah', color: '#ff4d4d' };
        }
    }, [formData.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('/api/register', formData);
            localStorage.setItem('token', res.data.access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
            setUser(res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registrasi gagal. Silakan cek data Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '440px', margin: '40px auto' }}>
            <div className="glass-card" style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '26px', marginBottom: '8px', textAlign: 'center', color: 'white' }}>Daftar Akun</h2>
                <p style={{ marginBottom: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>Lengkapi data untuk pendampingan Umrah Anda</p>

                {error && (
                    <div style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '20px', textAlign: 'center', background: 'rgba(255, 77, 77, 0.1)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,77,77,0.2)', fontWeight: '500' }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nama Lengkap</label>
                        <input
                            name="full_name"
                            required
                            placeholder="Contoh: Ahmad Abdullah"
                            value={formData.full_name}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="email@contoh.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>No. WhatsApp</label>
                        <input
                            name="phone"
                            required
                            placeholder="0812..."
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ color: 'var(--accent-gold)' }}>ID Grup (Opsional)</label>
                        <input
                            name="invite_code"
                            placeholder="Masukkan Kode Grup"
                            value={formData.invite_code}
                            onChange={handleChange}
                            style={{ border: '1px solid rgba(249, 212, 35, 0.3)', background: 'rgba(249, 212, 35, 0.05)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Min. 8 karakter"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button 
                                type="button"
                                className="input-icon-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        {formData.password && (
                            <div style={{ marginTop: '5px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10px', opacity: 0.6 }}>Kekuatan:</span>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: passwordStrength.color }}>{passwordStrength.label}</span>
                                </div>
                                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${passwordStrength.score}%`, background: passwordStrength.color, transition: 'all 0.4s' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Konfirmasi Password</label>
                        <input
                            name="password_confirmation"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Ulangi password"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            style={{ 
                                borderColor: formData.password_confirmation && formData.password !== formData.password_confirmation ? '#ff4d4d' : 'var(--glass-border)'
                            }}
                        />
                        {formData.password_confirmation && formData.password !== formData.password_confirmation && (
                            <span style={{ fontSize: '10px', color: '#ff4d4d', marginTop: '4px', marginLeft: '5px', fontWeight: 'bold' }}>
                                ⚠️ Password tidak cocok
                            </span>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading || (formData.password_confirmation && formData.password !== formData.password_confirmation)} 
                        style={{ marginTop: '10px', opacity: (loading || (formData.password_confirmation && formData.password !== formData.password_confirmation)) ? 0.6 : 1 }}
                    >
                        {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '13px' }}>
                    Sudah punya akun? <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 'bold', textDecoration: 'none' }}>Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
