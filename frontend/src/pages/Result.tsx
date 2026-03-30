import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CheckCircle, AlertTriangle, Info, ArrowLeft,
    MessageSquare, X, Zap, Leaf, ShieldAlert,
    FlaskConical, ShieldCheck, TrendingDown, RefreshCw
} from 'lucide-react';

interface DiseaseInfo {
    overview: string;
    causes: string[];
    symptoms: string[];
    treatment: string[];
    prevention: string[];
    impact: string[];
}

interface ChatMsg { text: string; isBot: boolean; }

// ── Quick-action buttons the user can click ──────────────────────────────────
const QUICK_QUESTIONS = [
    { label: '🔍 What caused this?',      msg: 'What caused this disease?' },
    { label: '🌿 What are the symptoms?', msg: 'What are the symptoms?' },
    { label: '💊 How do I treat it?',     msg: 'How do I treat it?' },
    { label: '🛡️ How to prevent it?',     msg: 'How do I prevent it?' },
    { label: '📉 What is the impact?',    msg: 'What is the impact on my crop?' },
    { label: '⚠️ Is it serious?',         msg: 'How serious is it?' },
    { label: '📢 Can it spread?',         msg: 'Can it spread to other plants?' },
    { label: '💧 Watering tips',          msg: 'Give me watering tips.' },
    { label: '☀️ Sunlight tips',          msg: 'Tell me about sunlight needs.' },
    { label: '🌱 Soil & nutrition',       msg: 'Tell me about soil and nutrition.' },
];

// ── Reusable info section card ────────────────────────────────────────────────
const InfoSection: React.FC<{
    icon: React.ReactNode; title: string; items: string[]; color: string; bgColor: string;
}> = ({ icon, title, items, color, bgColor }) => (
    <div style={{ background: bgColor, borderRadius: '14px', padding: '1.25rem 1.5rem', border: `1px solid ${color}22`, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <span style={{ color, display: 'flex' }}>{icon}</span>
            <h4 style={{ margin: 0, color, fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {items.map((item, i) => (
                <li key={i} style={{ color: '#444', fontSize: '0.95rem', lineHeight: 1.6 }}>{item}</li>
            ))}
        </ul>
    </div>
);

// ── Main Result page ──────────────────────────────────────────────────────────
const Result: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const resultData = location.state?.result;
    const imageSrc   = location.state?.imageSrc;

    const [diseaseInfo, setDiseaseInfo] = useState<DiseaseInfo | null>(null);
    const [infoLoading, setInfoLoading] = useState(true);

    useEffect(() => { if (!resultData) navigate('/scan'); }, [resultData, navigate]);

    useEffect(() => {
        if (!resultData?.disease) return;
        const fetch_ = async () => {
            setInfoLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/disease-info/${encodeURIComponent(resultData.disease)}`);
                if (res.ok) {
                    setDiseaseInfo(await res.json());
                } else {
                    throw new Error('Not found');
                }
            } catch (_) {
                console.warn('Using fallback disease info for demo.');
                // Provide a basic fallback so the UI isn't empty
                setDiseaseInfo({
                    overview: `Commonly found in ${resultData.plant} crops, ${resultData.disease} can impact yield quality if not managed. This demo overview provides a glimpse of the detailed analysis available in the full version.`,
                    causes: ["High humidity levels", "Infected seeds or soil", "Lack of proper ventilation"],
                    symptoms: ["Discolored spots on leaves", "Wilting of stems", "White or gray fuzzy growth"],
                    treatment: ["Apply organic fungicides", "Prune infected areas", "Improve air circulation"],
                    prevention: ["Use disease-resistant varieties", "Rotate crops annually", "Maintain proper spacing"],
                    impact: ["Reduced photosynthesis", "Premature leaf drop", "Lower fruit/vegetable quality"]
                });
            }
            finally { setInfoLoading(false); }
        };
        fetch_();
    }, [resultData?.disease]);

    if (!resultData) return null;

    const { disease, confidence, severity } = resultData;
    const confidencePercent = Math.round(confidence * 100);
    const isHealthy  = disease.toLowerCase().includes('healthy');
    const isHighRisk = severity === 'High';

    const accentColor  = isHealthy ? '#3cb371' : isHighRisk ? '#e63946' : '#f4a261';
    const accentShadow = isHealthy ? 'rgba(60,179,113,0.35)' : isHighRisk ? 'rgba(230,57,70,0.35)' : 'rgba(244,162,97,0.35)';
    const textColor    = isHealthy ? '#1a5c35' : isHighRisk ? '#b91c1c' : '#92400e';

    // ── FloraBot state ──────────────────────────────────────────────────────
    const [chatOpen, setChatOpen]       = useState(false);
    const [messages, setMessages]       = useState<ChatMsg[]>([]);
    const [isAsking, setIsAsking]       = useState(false);
    const [activeQ, setActiveQ]         = useState<string | null>(null);
    const messagesEndRef                = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatOpen && messagesEndRef.current)
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatOpen]);

    const askQuestion = async (questionMsg: string, btnLabel: string) => {
        if (isAsking) return;
        setIsAsking(true);
        setActiveQ(btnLabel);
        setMessages(prev => [...prev, { text: questionMsg, isBot: false }]);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: questionMsg, disease })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
        } catch {
            // Mock bot response for demo
            setTimeout(() => {
                const mockReply = `In this demo mode, I can tell you that ${disease} usually requires careful monitoring of environmental factors. For ${btnLabel.toLowerCase()}, typical advice includes maintaining optimal soil moisture and ensuring clean tools are used. In the full version, I would provide a much more detailed, AI-generated answer based on your specific leaf scan!`;
                setMessages(prev => [...prev, { text: mockReply, isBot: true }]);
                setIsAsking(false);
                setActiveQ(null);
            }, 800);
            return;
        } finally {
            if (!messages.some(m => m.isBot && m.text.includes('demo mode'))) {
                // Only reset loading if we didn't already trigger the mock timeout above
                setIsAsking(false);
                setActiveQ(null);
            }
        }
    };

    const clearChat = () => setMessages([]);

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="result-container animate-fade-in delay-100">
            <div className="result-header">
                <h1 style={{ color: textColor }}>{isHealthy ? '✅ Healthy Plant!' : '🔬 Disease Detected'}</h1>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>AI-powered leaf analysis complete.</p>
            </div>

            {/* Top row: image + summary */}
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '2rem' }}>
                {imageSrc && (
                    <div style={{ flex: '1 1 260px' }}>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <img src={imageSrc} alt="Scanned Leaf" style={{ width: '100%', borderRadius: '12px' }} />
                        </div>
                    </div>
                )}

                <div style={{ flex: '2 1 380px' }}>
                    <div className="glass-card" style={{ borderTop: `4px solid ${accentColor}` }}>
                        <h2 style={{ fontSize: '1.9rem', color: textColor, marginBottom: '0.4rem' }}>{disease}</h2>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                            <span className={`severity-badge severity-${severity}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                {severity === 'High' && <AlertTriangle size={13} />}
                                {severity === 'Low'  && <CheckCircle  size={13} />}
                                Severity: {severity}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#888', background: '#f3f4f6', padding: '3px 10px', borderRadius: '999px' }}>
                                {isHealthy ? 'No Action Needed' : 'Action Required'}
                            </span>
                        </div>

                        {/* Confidence bar */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: '#555', fontSize: '0.95rem' }}>AI Confidence</span>
                                <span style={{ fontWeight: 800, color: accentColor, fontSize: '1.2rem' }}>{confidencePercent}%</span>
                            </div>
                            <div style={{ height: '12px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ width: `${confidencePercent}%`, background: accentColor, height: '100%', borderRadius: '99px', boxShadow: `0 0 12px ${accentShadow}`, transition: 'width 1.5s cubic-bezier(0.22,1,0.36,1)' }} />
                            </div>
                        </div>

                        {/* Overview */}
                        {diseaseInfo?.overview && (
                            <div style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <Info size={18} color={accentColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <p style={{ margin: 0, color: '#444', lineHeight: 1.7, fontSize: '0.97rem' }}>{diseaseInfo.overview}</p>
                                </div>
                            </div>
                        )}
                        {infoLoading && <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.75rem' }}>Loading disease details…</p>}
                    </div>
                </div>
            </div>

            {/* Detail grid */}
            {diseaseInfo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <InfoSection icon={<Zap       size={17} />} title="Causes"           items={diseaseInfo.causes}     color="#e76f51" bgColor="#fff5f2" />
                    <InfoSection icon={<Leaf      size={17} />} title="Symptoms"         items={diseaseInfo.symptoms}   color="#7c3aed" bgColor="#f8f4ff" />
                    <InfoSection icon={<FlaskConical size={17}/>} title="Treatment Steps" items={diseaseInfo.treatment}  color={isHealthy ? '#3cb371' : '#e63946'} bgColor={isHealthy ? '#f0fdf4' : '#fff5f5'} />
                    <InfoSection icon={<ShieldCheck  size={17}/>} title="Prevention"     items={diseaseInfo.prevention} color="#0891b2" bgColor="#f0fbff" />
                    <InfoSection icon={<TrendingDown size={17}/>} title="Impact"          items={diseaseInfo.impact}     color="#b45309" bgColor="#fffbeb" />
                    {!isHealthy && (
                        <InfoSection icon={<ShieldAlert size={17}/>} title="Risk Level"
                            items={[
                                `Severity: ${severity}`,
                                severity === 'High'   ? 'Immediate action required — significant spread risk.' :
                                severity === 'Medium' ? 'Act within 48–72 hours to limit spread.' :
                                'Monitor closely over the next week.',
                                'Isolate affected plant from healthy ones.',
                                'Document infection date and location.',
                                'Consult a local agronomist if symptoms worsen.'
                            ]}
                            color="#dc2626" bgColor="#fef2f2" />
                    )}
                </div>
            )}

            {/* Back button */}
            <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '4rem' }}>
                <button
                    onClick={() => navigate('/scan')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: '2px solid var(--color-dark-green)', color: 'var(--color-dark-green)', padding: '0.75rem 2rem', borderRadius: '999px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--color-dark-green)'; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={e  => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-dark-green)'; }}
                >
                    <ArrowLeft size={18} /> Scan Another Plant
                </button>
            </div>

            {/* ── FloraBot ─────────────────────────────────────────────────── */}
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

                {/* FAB toggle */}
                {!chatOpen && (
                    <button
                        onClick={() => setChatOpen(true)}
                        title="Ask FloraBot"
                        style={{ background: 'var(--color-dark-green)', color: 'white', border: '5px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', transition: 'transform 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseOut={e  => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <MessageSquare size={28} />
                    </button>
                )}

                {/* Chat panel */}
                {chatOpen && (
                    <div className="glass-card animate-fade-in" style={{ width: '370px', maxHeight: '600px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.4)' }}>

                        {/* Header */}
                        <div style={{ background: 'var(--color-dark-green)', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
                                <MessageSquare size={20} /> FloraBot
                                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '99px', fontWeight: 400 }}>Plant Assistant</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {messages.length > 0 && (
                                    <button onClick={clearChat} title="Clear chat" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <RefreshCw size={14} />
                                    </button>
                                )}
                                <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Static intro (only when no messages yet) */}
                        {messages.length === 0 && (
                            <div style={{ padding: '0.9rem 1rem', background: '#f0fdf4', borderBottom: '1px solid #e2f5e8', flexShrink: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#2d6a4f', lineHeight: 1.55 }}>
                                    Hi! I can answer questions about <strong>{disease}</strong>. Tap a button below to get instant info 👇
                                </p>
                            </div>
                        )}

                        {/* Message history (scrollable) */}
                        {messages.length > 0 && (
                            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f9fcf8' }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                                        maxWidth: '88%',
                                        background: msg.isBot ? 'white' : 'var(--color-dark-green)',
                                        color: msg.isBot ? '#333' : 'white',
                                        padding: '0.7rem 0.9rem',
                                        borderRadius: '12px',
                                        borderBottomLeftRadius:  msg.isBot ? '2px' : '12px',
                                        borderBottomRightRadius: msg.isBot ? '12px' : '2px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        fontSize: '0.88rem',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isAsking && (
                                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '0.7rem 1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#999', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                        FloraBot is thinking…
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Quick-action button grid */}
                        <div style={{ padding: '0.75rem', background: 'white', borderTop: '1px solid #eee', flexShrink: 0 }}>
                            <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Tap a question:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {QUICK_QUESTIONS.map(q => (
                                    <button
                                        key={q.label}
                                        onClick={() => askQuestion(q.msg, q.label)}
                                        disabled={isAsking}
                                        style={{
                                            background: activeQ === q.label ? 'var(--color-dark-green)' : '#f0fdf4',
                                            color:      activeQ === q.label ? 'white' : '#2d6a4f',
                                            border:     '1px solid #b7e3c7',
                                            borderRadius: '20px',
                                            padding: '0.38rem 0.75rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            cursor: isAsking ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: isAsking && activeQ !== q.label ? 0.55 : 1,
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseOver={e => { if (!isAsking) e.currentTarget.style.background = 'var(--color-dark-green)'; e.currentTarget.style.color = 'white'; }}
                                        onMouseOut={e  => { if (activeQ !== q.label) { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#2d6a4f'; } }}
                                    >
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Result;
