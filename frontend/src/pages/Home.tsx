import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Search } from 'lucide-react';

const Home: React.FC = () => {
    const [stats, setStats] = useState({ diseases: 38, plants: 14 });
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
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8000/diseases');
                const data = await res.json();
                if (data.diseases && data.diseases.length > 0) {
                    const uniquePlants = new Set(data.diseases.map((d: any) => d.plant));
                    setStats({
                        diseases: data.diseases.length,
                        plants: uniquePlants.size
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {/* Parallax Background Leaves (Fixed to entire screen to escape container bounds) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)' }}>
                {/* 1. Far Left edge */}
                <Leaf
                    color="var(--color-green)"
                    style={{ position: 'absolute', width: '130px', height: '130px', top: '30vh', left: '-3vw', opacity: 0.12, transform: `translate(${mouseX * -30}px, ${mouseY * -30}px) rotate(45deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', transition: 'transform 0.1s ease-out' }}
                />

                {/* 2. Center Top, behind "seconds" */}
                <Leaf
                    color="var(--color-green)"
                    style={{ position: 'absolute', width: '190px', height: '190px', top: '15vh', left: '38vw', opacity: 0.08, transform: `translate(${mouseX * 40}px, ${mouseY * 40}px) rotate(-15deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', transition: 'transform 0.1s ease-out' }}
                />

                {/* 3. Bottom left margin edge */}
                <Leaf
                    color="var(--color-green)"
                    style={{ position: 'absolute', width: '85px', height: '85px', top: '78vh', left: '6vw', opacity: 0.15, transform: `translate(${mouseX * -50}px, ${mouseY * -50}px) rotate(100deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', transition: 'transform 0.1s ease-out' }}
                />

                {/* 4. Bottom Center, between stats and main graphic */}
                <Leaf
                    color="var(--color-green)"
                    style={{ position: 'absolute', width: '110px', height: '110px', top: '70vh', left: '44vw', opacity: 0.12, transform: `translate(${mouseX * 20}px, ${mouseY * 20}px) rotate(-40deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', transition: 'transform 0.1s ease-out' }}
                />

                {/* 5. Far Right edge */}
                <Leaf
                    color="var(--color-green)"
                    style={{ position: 'absolute', width: '150px', height: '150px', top: '35vh', right: '-4vw', opacity: 0.09, transform: `translate(${mouseX * -60}px, ${mouseY * -60}px) rotate(120deg)`, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))', transition: 'transform 0.1s ease-out' }}
                />
            </div>
            <div
                className="hero animate-fade-in delay-100"
                style={{ position: 'relative', minHeight: 'calc(100vh - 100px)' }}
            >
                <div className="hero-content">
                    <h1 className="hero-title">
                        Diagnose your plant in <span>seconds</span>.
                    </h1>
                    <p className="hero-subtitle">
                        Instantly identify plant diseases with state-of-the-art AI. Just upload a photo or snap a picture of a leaf, and we'll tell you how to save your plant.
                    </p>
                    <Link to="/scan" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={20} />
                        Start Diagnosis
                    </Link>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <h4>{stats.diseases}</h4>
                            <p>Detectable Diseases</p>
                        </div>
                        <div className="stat-item">
                            <h4>{stats.plants}</h4>
                            <p>Plant Types</p>
                        </div>
                        <div className="stat-item">
                            <h4>95%+</h4>
                            <p>Model Accuracy</p>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="leaf-blob">
                        <Leaf size={150} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
