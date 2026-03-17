import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, MapPin, CheckCircle, Activity, ChevronRight, Hash, LogIn, Plus, RefreshCw, MessageCircle, AlertTriangle, Save, Home, Building } from 'lucide-react';
import BottomNav from '../components/BottomNav';

// Helper: convert Indonesian phone to wa.me format (62xxx)
const toWaNumber = (phone) => {
    if (!phone) return '';
    let p = phone.trim().replace(/[\s\-()]/g, '');
    if (p.startsWith('+62')) return p.slice(1); // +62xxx -> 62xxx
    if (p.startsWith('62')) return p;            // 62xxx -> 62xxx
    if (p.startsWith('0')) return '62' + p.slice(1); // 08xxx -> 628xxx
    return '62' + p;
};

const GroupMap = ({ members, alerts }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayer = useRef(null);
    const linesLayer = useRef(null);

    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            mapInstance.current = L.map(mapRef.current).setView([21.4225, 39.8262], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapInstance.current);
            markersLayer.current = L.layerGroup().addTo(mapInstance.current);
            linesLayer.current = L.layerGroup().addTo(mapInstance.current);
        }

        if (markersLayer.current && linesLayer.current && members.length > 0) {
            markersLayer.current.clearLayers();
            linesLayer.current.clearLayers();

            const validMembers = members.filter(m => m.user?.last_latitude && m.user?.last_longitude);
            const leader = validMembers.find(m => m.member_role === 'leader');
            
            validMembers.forEach(m => {
                const lat = parseFloat(m.user.last_latitude);
                const lng = parseFloat(m.user.last_longitude);
                const hasAlert = alerts?.some(a => a.user_id === m.user_id);
                const isLeader = m.member_role === 'leader';
                const avatar = m.user.avatar;

                // Create Marker Icon
                const markerIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="position: relative;">
                            <div style="background: ${hasAlert ? '#ff4444' : (isLeader ? '#f9d423' : '#00d2ff')}; 
                                        width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; 
                                        display: flex; align-items: center; justify-content: center; 
                                        font-weight: bold; color: ${isLeader ? '#1a1a2e' : (hasAlert ? 'white' : '#1a1a2e')}; 
                                        font-size: 14px; box-shadow: 0 0 15px ${hasAlert ? 'rgba(255,0,0,0.8)' : 'rgba(0,0,0,0.4)'}; 
                                        animation: ${hasAlert ? 'pulse 0.8s infinite' : 'none'};
                                        overflow: hidden;
                                        z-index: 2;">
                                ${avatar ? 
                                    `<img src="${avatar}" style="width: 100%; height: 100%; object-fit: cover;" />` : 
                                    (m.user.full_name?.charAt(0) || 'U')
                                }
                            </div>
                            <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); 
                                        background: rgba(15, 23, 42, 0.9); color: white; padding: 2px 8px; border-radius: 10px; 
                                        font-size: 9px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                ${m.user.full_name?.split(' ')[0]}
                            </div>
                        </div>`,
                    iconSize: [40, 50],
                    iconAnchor: [20, 20]
                });

                L.marker([lat, lng], { icon: markerIcon })
                    .bindPopup(`
                        <div style="color: #1a1a2e; font-family: sans-serif; min-width: 180px; padding: 5px;">
                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px">
                                <div style="width:30px; height:30px; border-radius:50%; background:${isLeader ? '#f9d423' : '#00d2ff'}; display:flex; align-items:center; justify-content:center; font-weight:bold; overflow:hidden">
                                    ${avatar ? `<img src="${avatar}" style="width:100%; height:100%; object-fit:cover" />` : m.user.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <div style="font-weight:bold; font-size:14px">${m.user.full_name}</div>
                                    <div style="font-size:10px; color:#666">${isLeader ? 'Ketua Grup' : 'Jamaah'}</div>
                                </div>
                            </div>
                            ${hasAlert ? '<div style="color:white; background:#ff4444; padding:6px; margin-bottom:10px; border-radius:12px; text-align:center; font-weight:bold; font-size:11px; animation: pulse 1s infinite">🚨 EMERGENCY SOS 🚨</div>' : ''}
                            <div style="font-size:11px; color:#444; display:flex; align-items:center; gap:5px">
                                <span style="opacity:0.6">Update:</span> ${m.user.last_location_update ? new Date(m.user.last_location_update).toLocaleTimeString() : 'N/A'}
                            </div>
                            <div style="margin-top:10px; display:flex; gap:5px">
                                <a href="https://wa.me/${toWaNumber(m.user.phone)}" target="_blank" style="flex:1; background:#25D366; color:white; text-decoration:none; text-align:center; padding:5px; border-radius:5px; font-size:11px; font-weight:bold">WhatsApp</a>
                                <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="flex:1; background:#4285F4; color:white; text-decoration:none; text-align:center; padding:5px; border-radius:5px; font-size:11px; font-weight:bold">G-Maps</a>
                            </div>
                        </div>
                    `)
                    .addTo(markersLayer.current);

                // Create Line to Leader
                if (!isLeader && leader) {
                    const leaderLat = parseFloat(leader.user.last_latitude);
                    const leaderLng = parseFloat(leader.user.last_longitude);
                    
                    L.polyline([[lat, lng], [leaderLat, leaderLng]], {
                        color: hasAlert ? '#ff4444' : '#00d2ff',
                        weight: 3,
                        opacity: 0.5,
                        dashArray: '10, 10',
                        className: 'connection-line'
                    }).addTo(linesLayer.current);
                }
            });

            if (validMembers.length > 0) {
                const bounds = validMembers.map(m => [parseFloat(m.user.last_latitude), parseFloat(m.user.last_longitude)]);
                mapInstance.current.fitBounds(bounds, { padding: [70, 70] });
            }
        }
    }, [members, alerts]);

    return (
        <div style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: '24px', marginBottom: '20px', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 1 }} />
            <div style={{ 
                position: 'absolute', 
                bottom: '40px', 
                right: '15px', 
                background: 'rgba(15, 23, 42, 0.95)', 
                backdropFilter: 'blur(10px)',
                padding: '12px', 
                borderRadius: '16px', 
                zIndex: 1000, 
                fontSize: '11px', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', opacity: 0.8 }}>LEGEND</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f9d423', border: '2px solid white' }}></div> 
                    <span>Ketua Rombongan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00d2ff', border: '2px solid white' }}></div> 
                    <span>Jamaah Umrah</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff4444', border: '2px solid white', animation: 'pulse 1s infinite' }}></div> 
                    <span style={{ color: '#ff4444', fontWeight: 'bold' }}>Darurat SOS</span>
                </div>
            </div>
        </div>
    );
};


const GroupPage = () => {
    const { user } = useAuth();
    const [groups, setGroups] = useState({ owned: [], joined: [] });
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [sosLoading, setSosLoading] = useState(false);
    const [hotels, setHotels] = useState({ makkah: '', madinah: '' });
    const [savingHotels, setSavingHotels] = useState(false);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    const prevAlertsCount = useRef(0);

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
        fetchGroups();
    }, []);

    useEffect(() => {
        if (!selectedGroup) return;

        const poll = setInterval(() => {
            fetchMembers(selectedGroup.id);
            if (selectedGroup.owner_id === user.id) {
                fetchAlerts(selectedGroup.id);
            }
        }, 10000); // Polling lebih cepat (10 detik) saat ada SOS

        return () => clearInterval(poll);
    }, [selectedGroup, user]);

    useEffect(() => {
        if (alerts.length > prevAlertsCount.current) {
            // Ada alert baru!
            const newAlert = alerts[0];
            if (newAlert && Notification.permission === "granted") {
                new Notification("🚨 SOS DARURAT!", {
                    body: `${newAlert.user?.full_name} membutuhkan bantuan segera!`,
                    icon: '/favicon.ico'
                });
            }
            // Putar suara nyaring berkali-kali
            audioRef.current.loop = true;
            audioRef.current.play().catch(e => console.log("Audio play failed, needs user interaction first", e));
        } else if (alerts.length === 0) {
            // Berhenti jika sudah tidak ada alert
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        prevAlertsCount.current = alerts.length;
    }, [alerts]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get('/api/groups');
            setGroups(res.data);
            setLoading(false);
            
            if (selectedGroup) {
                const refreshed = [...(res.data.owned || []), ...(res.data.joined || [])].find(g => g.id === selectedGroup.id);
                if (refreshed) {
                    setSelectedGroup(refreshed);
                    setHotels({ makkah: refreshed.hotel_makkah || '', madinah: refreshed.hotel_madinah || '' });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectGroup = async (group) => {
        setSelectedGroup(group);
        setHotels({ makkah: group.hotel_makkah || '', madinah: group.hotel_madinah || '' });
        fetchMembers(group.id);
        if (group.owner_id === user.id) {
            fetchAlerts(group.id);
        }
    };

    const fetchMembers = async (groupId) => {
        setRefreshing(true);
        try {
            const res = await axios.get(`/api/groups/${groupId}/members`);
            setMembers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch members', err);
        } finally {
            setRefreshing(false);
        }
    };

    const fetchAlerts = async (groupId) => {
        try {
            const res = await axios.get(`/api/groups/${groupId}/alerts`);
            setAlerts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch alerts', err);
        }
    };

    const handleUpdateHotels = async () => {
        if (!selectedGroup) return;
        setSavingHotels(true);
        try {
            // Log for debugging
            console.log('Updating hotels for group', selectedGroup.id, hotels);
            const res = await axios.put(`/api/groups/${selectedGroup.id}/hotels`, {
                hotel_makkah: hotels.makkah,
                hotel_madinah: hotels.madinah
            });
            console.log('Update response', res.data);
            alert('Informasi Hotel Berhasil Disimpan');
            fetchGroups(); 
        } catch (err) {
            console.error('Update hotels error', err.response?.data || err.message);
            alert('Gagal menyimpan info hotel: ' + (err.response?.data?.message || 'Error Server'));
        } finally {
            setSavingHotels(false);
        }
    };

    const handleResolveAlert = async (alertId) => {
        if (!confirm('Tandai bantuan SOS ini sebagai selesai dan normalkan status?')) return;
        try {
            await axios.patch(`/api/emergency/alerts/${alertId}/resolve`);
            const remainingAlerts = alerts.filter(a => a.id !== alertId);
            setAlerts(remainingAlerts);
            if (remainingAlerts.length === 0) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            alert('Status kembali normal.');
        } catch (err) {
            alert('Gagal menyelesaikan bantuan');
        }
    };

    const handleSendSOS = async () => {
        if (!confirm('Kirim sinyal SOS Darurat ke Ketua Rombongan?')) return;
        setSosLoading(true);
        try {
            if (!("geolocation" in navigator)) throw new Error('GPS tidak tersedia');
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    await axios.post('/api/emergency/sos', {
                        group_id: selectedGroup.id,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    alert('Sinyal SOS telah dikirim. Ketua Rombongan akan segera menemui Anda.');
                } catch (err) {
                    alert('Gagal mengirim SOS. Coba hubungi via Whatsapp.');
                } finally {
                    setSosLoading(false);
                }
            }, (err) => {
                alert('Gagal mendapatkan lokasi: ' + err.message);
                setSosLoading(false);
            });
        } catch (err) {
            alert(err.message);
            setSosLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/groups', { group_name: newGroupName });
            setNewGroupName('');
            setShowCreate(false);
            fetchGroups();
        } catch (err) {
            alert('Gagal membuat grup');
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/groups/join', { invite_code: joinCode });
            setJoinCode('');
            setShowJoin(false);
            fetchGroups();
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal bergabung dengan grup');
        }
    };

    const getWorshipValue = (member, type) => {
        if (!member.user || !member.user.worship_logs) return 0;
        const log = member.user.worship_logs.find(l => l.activity_type?.toLowerCase().includes(type.toLowerCase()));
        return log ? (log.total_value || 0) : 0;
    };

    const isLeader = selectedGroup?.owner_id === user?.id;
    const totalGroups = (groups.owned?.length || 0) + (groups.joined?.length || 0);

    const deg2rad = (deg) => deg * (Math.PI / 180);
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 1000); // meters
    };

    const leaderMember = members.find(m => m.member_role === 'leader');
    const myMember = members.find(m => m.user_id === user?.id);
    const distanceToLeader = getDistance(
        myMember?.user?.last_latitude, 
        myMember?.user?.last_longitude, 
        leaderMember?.user?.last_latitude, 
        leaderMember?.user?.last_longitude
    );

    useEffect(() => {
        if (distanceToLeader > 2000 && !isLeader && selectedGroup) {
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Peringatan Jarak!", {
                    body: "Hati-hati, Anda terlalu jauh dengan Ketua Group ( > 2KM)",
                    icon: '/favicon.ico'
                });
            }
        }
    }, [distanceToLeader, isLeader, selectedGroup]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Memuat Grup...</div>;

    return (
        <div style={{ padding: '20px', paddingBottom: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Rombongan</h1>
                    <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>Tersedia {totalGroups} grup Anda</p>
                </div>
                {!selectedGroup && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setShowJoin(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', fontWeight: 'bold' }}>
                            <LogIn size={14} /> Join
                        </button>
                        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '10px', background: 'var(--accent-blue)', color: 'white', border: 'none', fontSize: '11px', fontWeight: 'bold' }}>
                            <Plus size={14} /> Buat
                        </button>
                    </div>
                )}
            </div>

            {selectedGroup ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <button onClick={() => setSelectedGroup(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                            &larr; Pilih Grup Lain
                        </button>
                        <button onClick={() => { fetchMembers(selectedGroup.id); if(isLeader) fetchAlerts(selectedGroup.id); }} style={{ background: 'none', border: 'none', color: 'white', opacity: refreshing ? 0.5 : 1 }}>
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    
                    <div className="glass-card" style={{ margin: '0 0 20px 0', border: '1px solid var(--accent-gold)', background: 'linear-gradient(135deg, rgba(249, 212, 35, 0.15), rgba(15, 23, 42, 0.8))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedGroup.group_name}</h2>
                                <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>Kode Invite: <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{selectedGroup.invite_code}</span></p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', textAlign: 'center', minWidth: '60px' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{members.length}</div>
                                <div style={{ fontSize: '10px', opacity: 0.6 }}>Anggota</div>
                            </div>
                        </div>
                    </div>

                    {alerts.length > 0 && isLeader && (
                        <div style={{ background: 'rgba(255,0,0,0.1)', border: '2px solid #ff4444', borderRadius: '15px', padding: '15px', marginBottom: '20px', animation: 'pulse 2s infinite' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444', marginBottom: '10px' }}>
                                <AlertTriangle size={24} />
                                <strong style={{fontSize: '16px'}}>PANGGILAN DARURAT (SOS)</strong>
                            </div>
                            {alerts.map(alert => (
                                <div key={alert.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                                    <div style={{fontWeight:'bold'}}>{alert.user?.full_name}</div>
                                    <div style={{fontSize:'12px', opacity:0.8}}>Meminta bantuan pada {new Date(alert.created_at).toLocaleTimeString()}</div>
                                    <div style={{display:'flex', gap:'8px', marginTop:'10px', flexWrap: 'wrap'}}>
                                        <a href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} target="_blank" className="btn-primary" style={{padding:'10px', fontSize:'11px', flex:1, minWidth: '100px', textAlign:'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                            <MapPin size={14} /> Buka Peta
                                        </a>
                                        <a href={`https://wa.me/${toWaNumber(alert.user?.phone)}?text=${encodeURIComponent("Saya butuh bantuan segera!")}`} target="_blank" className="btn-primary" style={{padding:'10px', fontSize:'11px', flex:1, minWidth: '100px', background:'#25D366', border:'none', textAlign:'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
                                            <MessageCircle size={14} /> Hubungi WA
                                        </a>
                                        <button 
                                            onClick={() => handleResolveAlert(alert.id)} 
                                            style={{padding:'10px', fontSize:'11px', width: '100%', marginTop: '5px', background:'var(--accent-blue)', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                                        >
                                            <CheckCircle size={14} /> Tandai Selesai & Normalkan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isLeader ? (
                        <div className="glass-card" style={{ marginBottom: '20px', padding: '20px', border: '1px solid rgba(0,210,255,0.2)' }}>
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} color="var(--accent-gold)" /> Pengaturan Hotel Jamaah</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '10px', opacity: 0.6 }}>Hotel Mekkah</label>
                                    <input 
                                        value={hotels.makkah} 
                                        onChange={(e) => setHotels({...hotels, makkah: e.target.value})}
                                        placeholder="Nama Hotel di Mekkah"
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', color: 'white' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '10px', opacity: 0.6 }}>Hotel Madinah</label>
                                    <input 
                                        value={hotels.madinah} 
                                        onChange={(e) => setHotels({...hotels, madinah: e.target.value})}
                                        placeholder="Nama Hotel di Madinah"
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '10px', color: 'white' }}
                                    />
                                </div>
                                <button onClick={handleUpdateHotels} disabled={savingHotels} style={{ marginTop: '5px', padding: '12px', borderRadius: '10px', background: 'var(--accent-blue)', border: 'none', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                    {savingHotels ? <RefreshCw size={16} className="animate-spin" /> : <><Save size={16} /> Simpan Informasi Hotel</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div className="glass-card" style={{ padding: '15px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                {distanceToLeader !== null && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: distanceToLeader > 2000 ? '#ff4444' : 'var(--accent-blue)', color: 'white', fontSize: '9px', padding: '2px', fontWeight: 'bold' }}>
                                        JARAK: {distanceToLeader}m {distanceToLeader > 2000 && '⚠️'}
                                    </div>
                                )}
                                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '5px', marginTop: distanceToLeader !== null ? '10px' : '0' }}>KETUA ROMBONGAN</div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{selectedGroup.owner?.full_name}</div>
                                {distanceToLeader > 2000 && (
                                    <div style={{ color: '#ff4444', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', animation: 'pulse 1s infinite' }}>Hati-hati, Anda terlalu jauh!</div>
                                )}
                                <a 
                                    href={`https://wa.me/${toWaNumber(selectedGroup.owner?.phone)}?text=${encodeURIComponent("Assalamu'alaykum Ustadz, Tolong saya di ...")}`} 
                                    target="_blank"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}
                                >
                                    <MessageCircle size={16} /> Chat WA
                                </a>
                            </div>
                            <div 
                                className="glass-card" 
                                style={{ padding: '15px', textAlign: 'center', border: '1px solid #ff4444', background: 'rgba(255,0,0,0.05)', cursor: 'pointer' }}
                                onClick={handleSendSOS}
                            >
                                <div style={{ fontSize: '10px', color: '#ff4444', fontWeight: 'bold', marginBottom: '5px' }}>PANGGILAN DARURAT (SOS)</div>
                                <div style={{ width: '40px', height: '40px', background: '#ff4444', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', color: 'white' }}>
                                    {sosLoading ? <RefreshCw size={20} className="animate-spin" /> : <AlertTriangle size={20} />}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>Klik untuk Bantuan</div>
                            </div>
                        </div>
                    )}

                    {isLeader && (
                        <div style={{marginBottom: '30px'}}>
                            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} /> Live Monitoring Map</h3>
                            <GroupMap members={members} alerts={alerts} />
                        </div>
                    )}

                    <h3 style={{ fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} color="var(--accent-blue)" /> Monitoring Progres Jamaah</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {members.length === 0 ? (
                            <div className="glass-card" style={{textAlign:'center', opacity:0.5}}>Belum ada anggota jamaah.</div>
                        ) : (
                            members.map(member => (
                                <div key={member.id} className="glass-card" style={{ margin: 0, padding: '15px', border: member.user_id === user.id ? '1px solid rgba(0,210,255,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: member.member_role === 'leader' ? 'var(--accent-gold)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                                                {member.user?.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{member.user?.full_name || 'User'} {member.user_id === user.id && '(Anda)'}</div>
                                                <div style={{ fontSize: '11px', opacity: 0.6 }}>{member.member_role === 'leader' ? 'Ketua Grup' : 'Jamaah'}</div>
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', gap:'8px'}}>
                                            {member.user?.last_latitude && (
                                                <a href={`https://www.google.com/maps?q=${member.user.last_latitude},${member.user.last_longitude}`} target="_blank" style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-blue)', padding: '8px', borderRadius: '10px' }}>
                                                    <MapPin size={18} />
                                                </a>
                                            )}
                                            {isLeader && member.user_id !== user.id && (
                                                <a href={`https://wa.me/${toWaNumber(member.user?.phone)}`} target="_blank" style={{ background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', padding: '8px', borderRadius: '10px' }}>
                                                    <MessageCircle size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '2px' }}>TAWAF</div>
                                            <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{getWorshipValue(member, 'tawaf')}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '2px' }}>SA'I</div>
                                            <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{getWorshipValue(member, 'sai')}</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', opacity: 0.5, marginBottom: '2px' }}>DAFTAR CEK</div>
                                            <div style={{ fontWeight: 'bold' }}>{member.user?.completed_checklists_count || 0}/{member.user?.checklists_count || 0}</div>
                                        </div>
                                    </div>
                                    
                                    {member.user?.last_location_update && (
                                        <div style={{ fontSize: '9px', opacity: 0.4, marginTop: '10px', textAlign: 'right' }}>Lokasi: {new Date(member.user.last_location_update).toLocaleTimeString()}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {(groups.owned?.length > 0) && (
                        <div>
                            <h3 style={{ marginBottom: '12px', fontSize: '16px', opacity: 0.7 }}>Grup Kelolaan (Ketua)</h3>
                            {groups.owned.map(group => (
                                <div key={group.id} onClick={() => handleSelectGroup(group)} className="glass-card" style={{ margin: '0 0 12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid rgba(249, 212, 35, 0.1)' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{group.group_name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{group.members_count || 0} Anggota &bull; Kode: <span style={{color:'var(--accent-gold)'}}>{group.invite_code}</span></div>
                                    </div>
                                    <ChevronRight size={20} opacity={0.5} />
                                </div>
                            ))}
                        </div>
                    )}

                    {(groups.joined?.length > 0) && (
                        <div>
                            <h3 style={{ marginBottom: '12px', fontSize: '16px', opacity: 0.7 }}>Grup Diikuti (Jamaah)</h3>
                            {groups.joined.map(group => (
                                <div key={group.id} onClick={() => handleSelectGroup(group)} className="glass-card" style={{ margin: '0 0 12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{group.group_name}</div>
                                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{group.members_count || 0} Anggota</div>
                                    </div>
                                    <ChevronRight size={20} opacity={0.5} />
                                </div>
                            ))}
                        </div>
                    )}

                    {(!groups.owned?.length && !groups.joined?.length) && (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
                            <Users size={40} style={{ opacity: 0.2, marginBottom: '15px' }} />
                            <p>Belum ada grup. Buat atau bergabung dengan rombongan Anda.</p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                <button onClick={() => setShowJoin(true)} style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>Join</button>
                                <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ width: 'auto' }}>Buat Baru</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showCreate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '360px' }}>
                        <h3>Grup Rombongan Baru</h3>
                        <form onSubmit={handleCreateGroup} style={{ marginTop: '20px' }}>
                            <input required placeholder="Nama Rombongan" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.2)', color:'white', marginBottom:'15px'}} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Batal</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Buat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoin && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '360px' }}>
                        <h3>Gabung Rombongan</h3>
                        <form onSubmit={handleJoinGroup} style={{ marginTop: '20px' }}>
                            <input required placeholder="Kode Invite" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} style={{ width:'100%', padding:'18px', borderRadius:'10px', border:'2px solid var(--accent-gold)', background:'rgba(0,0,0,0.2)', color:'white', marginBottom:'15px', textAlign:'center', fontSize:'24px', letterSpacing:'8px'}} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowJoin(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Batal</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Masuk</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
            <BottomNav />
        </div>
    );
};

export default GroupPage;
