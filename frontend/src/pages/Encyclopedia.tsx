import React, { useState, useRef, useEffect } from 'react';
import { Search, Flower2 } from 'lucide-react';

interface Disease {
    name: string;
    plant: string;
    severity: string;
    raw_name: string;
}

const Encyclopedia: React.FC = () => {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlant, setSelectedPlant] = useState('All');
    const [loading, setLoading] = useState(true);

    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            setMouseX(e.clientX / window.innerWidth - 0.5);
            setMouseY(e.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await fetch('http://localhost:8000/diseases');
                const data = await response.json();
                setDiseases(data.diseases);
            } catch (err) {
                console.error("Failed to fetch diseases", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDiseases();
    }, []);

    const filteredDiseases = diseases.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.plant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlant = selectedPlant === 'All' || d.plant === selectedPlant;
        return matchesSearch && matchesPlant;
    });

    const uniquePlants = ['All', ...Array.from(new Set(diseases.map(d => d.plant))).sort()];

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)' }}>
                <Flower2 color="var(--color-green)" style={{ position: 'absolute', width: '200px', height: '200px', top: '10vh', right: '8vw', opacity: 0.08, transform: `translate(${mouseX * 30}px, ${mouseY * 30}px) rotate(45deg)`, transition: 'transform 0.1s ease-out' }} />
                <Flower2 color="var(--color-green)" style={{ position: 'absolute', width: '140px', height: '140px', top: '45vh', left: '4vw', opacity: 0.12, transform: `translate(${mouseX * -40}px, ${mouseY * -40}px) rotate(-15deg)`, transition: 'transform 0.1s ease-out' }} />
                <Flower2 color="var(--color-green)" style={{ position: 'absolute', width: '120px', height: '120px', top: '75vh', right: '20vw', opacity: 0.1, transform: `translate(${mouseX * 50}px, ${mouseY * 50}px) rotate(110deg)`, transition: 'transform 0.1s ease-out' }} />
            </div>

            <div className="container animate-fade-in delay-100" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
                <h1 style={{ fontSize: '3rem', textAlign: 'center', color: 'var(--color-dark-green)', marginBottom: '1rem' }}>
                    Disease Encyclopedia
                </h1>
                <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
                    Browse our database of 117 conditions across 59 plant types — verifiable by the AI model.
                </p>

                <div className="search-container" style={{ flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by plant or disease name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>

                    {!loading && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '800px' }}>
                            {uniquePlants.map((plant) => (
                                <button
                                    key={plant}
                                    onClick={() => setSelectedPlant(plant)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '999px',
                                        border: `1px solid ${selectedPlant === plant ? 'var(--color-lime)' : 'var(--color-glass-input)'}`,
                                        background: selectedPlant === plant ? 'var(--color-lime)' : 'transparent',
                                        color: selectedPlant === plant ? 'var(--color-dark-green)' : 'var(--color-text)',
                                        fontWeight: selectedPlant === plant ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {plant}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="disease-grid">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="skeleton-card">
                                <div className="skeleton-img skeleton"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line skeleton" style={{ width: '30%' }}></div>
                                    <div className="skeleton-line skeleton" style={{ width: '80%', height: '1.5rem', marginTop: '0.25rem' }}></div>
                                    <div className="skeleton-line skeleton" style={{ width: '40%', marginTop: 'auto' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="disease-grid">
                        {filteredDiseases.map((disease, idx) => (
                            <div key={idx} className="disease-card">
                                <div style={{ width: '100%', height: '150px', background: 'linear-gradient(135deg, #e0f2e9, #bce3cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    <span style={{ fontSize: '3rem', opacity: 0.1, fontWeight: 'bold', position: 'absolute' }}>{disease.plant}</span>
                                    <img
                                        src={`http://localhost:8000/image/${disease.raw_name}`}
                                        alt={disease.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                                <div className="disease-card-content">
                                    <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {disease.plant.toUpperCase()}
                                    </span>
                                    <h3>{disease.name}</h3>
                                    <span className={`severity-badge severity-${disease.severity}`}>
                                        Severity: {disease.severity}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {filteredDiseases.length === 0 && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>No diseases found matching your search.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Encyclopedia;
