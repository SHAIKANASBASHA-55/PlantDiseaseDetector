import React, { useState, useEffect } from 'react';
import { 
    BookOpen, 
    Leaf, 
    Grape, 
    Recycle, 
    ShieldPlus, 
    Wrench, 
    Search, 
    ChevronRight,
    Carrot,
    Factory
} from 'lucide-react';
import { PLANTOPEDIA_DATA } from '../data/plantopedia_data';

interface PlantopediaItem {
    name: string;
    type?: string;
    category?: string;
    medicine?: string;
    utility?: string;
    use?: string;
    target?: string;
    info: string;
    isCommon?: boolean;
    isEaten?: boolean;
    isCultivated?: boolean;
    isUsed?: boolean;
    image?: string;
}

interface PlantopediaData {
    [key: string]: PlantopediaItem[];
}

const Plantopedia: React.FC = () => {
    const [data, setData] = useState<PlantopediaData | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('Plant Diseases');
    const [filterMode, setFilterMode] = useState<'all' | 'common' | 'cultivated' | 'eaten' | 'used'>('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
        setData(PLANTOPEDIA_DATA);
        setLoading(false);
    }, []);

    const categoryIcons: { [key: string]: React.ReactNode } = {
        'Plant Diseases': <ShieldPlus size={20} />,
        'Food Crops': <Leaf size={20} />,
        'Fruit Crops': <Grape size={20} />,
        'Vegetables': <Carrot size={20} />,
        'Industrial Crops': <Factory size={20} />,
        'Waste Crops': <Recycle size={20} />,
        'Medicines/Chemicals': <BookOpen size={20} />,
        'Farming Utilities': <Wrench size={20} />
    };

    const isVisible = (item: PlantopediaItem) => {
        if (filterMode === 'all') return true;
        if (filterMode === 'common') return item.isCommon;
        if (filterMode === 'cultivated') return item.isCultivated;
        if (filterMode === 'eaten') return item.isEaten;
        if (filterMode === 'used') return item.isUsed;
        return true;
    };

    if (loading) {
        return (
            <div className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '10rem' }}>
                <div className="loader" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '2rem', color: 'var(--color-text-muted)' }}>Cultivating Plantopedia...</p>
            </div>
        );
    }

    const filteredItems = data && data[activeCategory]
        ? data[activeCategory].filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.info.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = isVisible(item);
            return matchesSearch && matchesFilter;
          })
        : [];

    return (
        <div className="plantopedia-page animate-fade-in" style={{ position: 'relative' }}>
            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)' }}>
                <img src="/leaf_nobg.png" style={{ position: 'absolute', width: '300px', height: '300px', top: '10vh', right: '5vw', opacity: 0.1, transform: `translate(${mouseX * 40}px, ${mouseY * 40}px) rotate(15deg)`, transition: 'transform 0.1s ease-out', mixBlendMode: 'multiply' }} alt="" />
                <img src="/leaf_nobg.png" style={{ position: 'absolute', width: '200px', height: '200px', top: '50vh', left: '2vw', opacity: 0.08, transform: `translate(${mouseX * -30}px, ${mouseY * -30}px) rotate(-10deg)`, transition: 'transform 0.1s ease-out', mixBlendMode: 'multiply' }} alt="" />
                <img src="/leaf_nobg.png" style={{ position: 'absolute', width: '250px', height: '250px', top: '75vh', right: '15vw', opacity: 0.06, transform: `translate(${mouseX * 20}px, ${mouseY * 20}px) rotate(45deg)`, transition: 'transform 0.1s ease-out', mixBlendMode: 'multiply' }} alt="" />
            </div>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '4rem', paddingBottom: '6rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-dark-green)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                        Plantopedia
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                        Your ultimate guide to plant health, sustainable farming, and agricultural excellence.
                    </p>
                </div>

                <div className="plantopedia-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '3rem' }}>
                    {/* Sidebar Tabs */}
                    <div className="plantopedia-sidebar" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-glass-input)',
                                    background: 'var(--color-glass-bg)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {data && Object.keys(data).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        setSearchTerm('');
                                        setFilterMode('all');
                                    }}
                                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: activeCategory === cat ? 'var(--color-lime)' : 'transparent',
                                        color: activeCategory === cat ? 'var(--color-dark-green)' : 'var(--color-text)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontWeight: activeCategory === cat ? 700 : 500,
                                        fontSize: '1rem'
                                    }}
                                >
                                    <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: activeCategory === cat ? 'rgba(255,255,255,0.4)' : 'var(--color-glass-input)',
                                        transition: 'all 0.3s'
                                    }}>
                                        {categoryIcons[cat]}
                                    </span>
                                    {cat}
                                    {activeCategory === cat && <ChevronRight size={18} style={{ marginLeft: 'auto' }} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="plantopedia-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 style={{ fontSize: '2rem', color: 'var(--color-text)' }}>{activeCategory}</h2>
                                <span style={{ 
                                    padding: '0.4rem 0.8rem', 
                                    background: 'var(--color-glass-input)', 
                                    borderRadius: '8px', 
                                    fontSize: '0.85rem', 
                                    color: 'var(--color-text-muted)',
                                    fontWeight: '600'
                                }}>
                                    {filteredItems.length} entries
                                </span>
                            </div>

                            {/* Sort/Filter Tabs */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '0.3rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', width: 'fit-content' }}>
                                <button 
                                    onClick={() => setFilterMode('all')}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: filterMode === 'all' ? '#fff' : 'transparent',
                                        color: filterMode === 'all' ? 'var(--color-dark-green)' : 'var(--color-text-muted)',
                                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                                    }}
                                >
                                    All
                                </button>
                                {activeCategory === 'Plant Diseases' && (
                                    <button 
                                        onClick={() => setFilterMode('common')}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none',
                                            background: filterMode === 'common' ? '#fff' : 'transparent',
                                            color: filterMode === 'common' ? 'var(--color-dark-green)' : 'var(--color-text-muted)',
                                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                                        }}
                                    >
                                        Most Common
                                    </button>
                                )}
                                {((activeCategory.includes('Crop') && activeCategory !== 'Waste Crops') || activeCategory === 'Vegetables') && (
                                    <>
                                        <button 
                                            onClick={() => setFilterMode('cultivated')}
                                            style={{
                                                padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none',
                                                background: filterMode === 'cultivated' ? '#fff' : 'transparent',
                                                color: filterMode === 'cultivated' ? 'var(--color-dark-green)' : 'var(--color-text-muted)',
                                                cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                                            }}
                                        >
                                            Most Cultivated
                                        </button>
                                        {activeCategory !== 'Industrial Crops' && (
                                            <button 
                                                onClick={() => setFilterMode('eaten')}
                                                style={{
                                                    padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none',
                                                    background: filterMode === 'eaten' ? '#fff' : 'transparent',
                                                    color: filterMode === 'eaten' ? 'var(--color-dark-green)' : 'var(--color-text-muted)',
                                                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                                                }}
                                            >
                                                Most Eaten
                                            </button>
                                        )}
                                    </>
                                )}
                                {(activeCategory === 'Farming Utilities' || activeCategory === 'Medicines/Chemicals' || activeCategory === 'Waste Crops') && (
                                    <button 
                                        onClick={() => setFilterMode('used')}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none',
                                            background: filterMode === 'used' ? '#fff' : 'transparent',
                                            color: filterMode === 'used' ? 'var(--color-dark-green)' : 'var(--color-text-muted)',
                                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s'
                                        }}
                                    >
                                        Most Used
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                            {filteredItems.map((item: PlantopediaItem, idx: number) => (
                                <div 
                                    key={idx} 
                                    className="info-card animate-slide-up" 
                                    style={{ 
                                        background: 'var(--color-glass-bg)',
                                        borderRadius: '20px',
                                        border: '1px solid var(--color-glass-border)',
                                        padding: '2rem',
                                        transition: 'all 0.3s',
                                        animationDelay: `${idx * 0.05}s`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Decorative background element */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: '-20px', 
                                        right: '-20px', 
                                        width: '100px', 
                                        height: '100px', 
                                        background: 'var(--color-lime)', 
                                        opacity: 0.1, 
                                        borderRadius: '50%',
                                        filter: 'blur(30px)' 
                                    }}></div>

                                    <div className="card-content-wrapper">
                                        <div className="image-shimmer-container">
                                            {(() => {
                                                const getThemedImage = (name: string, cat: string) => {
                                                    const themes: { [key: string]: string[] } = {
                                                        'Plant Diseases': [
                                                            '1530836361613-c51039f70935', '1528652284315-45732bb5aee3', 
                                                            '1628173147814-722165992984', '1609142821451-b844ba773062'
                                                        ],
                                                        'Food Crops': [
                                                            '1500382017468-9049fed747ef', '1523348837708-2c6b4120803c', 
                                                            '1501472312651-726afe119ff1', '1470058869958-2a77ada44c0b'
                                                        ],
                                                        'Fruit Crops': [
                                                            '1610832958506-aa56368176cf', '1436564989099-ce122e2e9874', 
                                                            '1563740286-9ac698063074', '1519999482648-25049ddd37b1'
                                                        ],
                                                        'Vegetables': [
                                                            '1566385102311-63300c732890', '1558905757-4fac8ca65a4e', 
                                                            '1610341592771-70220672f5ef', '1592924357228-91a1adade0a5'
                                                        ],
                                                        'Industrial Crops': [
                                                            '1560493674-f2ad367a7489', '1535498877543-ee8330de883b', 
                                                            '1590682283120-101016604db0', '1504915642871-3316e6fdb613'
                                                        ],
                                                        'Waste Crops': [
                                                            '1591114940562-b2d288ca78ab', '1622353139828-095cd434eabe', 
                                                            '1586790170083-2f9cefac774d', '1605374493393-2780e9cb9ca9'
                                                        ],
                                                        'Medicines/Chemicals': [
                                                            '1584308972272-9e60f4e13d9a', '1631548028753-48b456bd5c5d', 
                                                            '1564834724-1c6183e95088', '1587352342084-2a67e1014e76'
                                                        ],
                                                        'Farming Utilities': [
                                                            '1464226110216-321ab1c3cccb', '1586771107445-d3ca888129ff', 
                                                            '1589923188900-85da33e03de0', '1533518363829-dc562dddb19e'
                                                        ]
                                                    };
                                                    
                                                    const bank = themes[cat] || themes['Food Crops'];
                                                    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                    const id = bank[hash % bank.length];
                                                    return `https://images.unsplash.com/photo-${id}?w=400&q=80&fit=crop`;
                                                };

                                                const imgSrc = item.image || getThemedImage(item.name, activeCategory);

                                                return (
                                                    <img 
                                                        src={imgSrc} 
                                                        alt={item.name} 
                                                        loading="lazy"
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'cover',
                                                            opacity: 0,
                                                            transition: 'opacity 0.6s ease-in-out'
                                                        }}
                                                        className="info-card-image"
                                                        onLoad={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.opacity = '1';
                                                        }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            if (target.parentElement) {
                                                                target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg, var(--color-lime) 0%, var(--color-green) 100%)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>`;
                                                            }
                                                        }}
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="card-text-content">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-green)' }}>{item.name}</h3>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                        {item.type && <span className="tag type-tag">{item.type}</span>}
                                                        {item.category && <span className="tag cat-tag">{item.category}</span>}
                                                        {item.use && <span className="tag use-tag">{item.use}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                                                {item.info}
                                            </p>
                                        </div>
                                    </div>

                                    {(item.medicine || item.utility || item.target) && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '1.5rem', 
                                            paddingTop: '1.5rem', 
                                            borderTop: '1px solid var(--color-glass-border)',
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            {item.medicine && (
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '0.25rem' }}>Medicine/Treatment</span>
                                                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.medicine}</span>
                                                </div>
                                            )}
                                            {item.utility && (
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '0.25rem' }}>Recommended Utility</span>
                                                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.utility}</span>
                                                </div>
                                            )}
                                            {item.target && (
                                                <div>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '0.25rem' }}>Effective Against</span>
                                                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{item.target}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {filteredItems.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-glass-bg)', borderRadius: '20px', border: '1px dashed var(--color-glass-border)' }}>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>No results found for "{searchTerm}" in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .category-tab:hover {
                    transform: translateX(8px);
                    background: rgba(163, 230, 53, 0.1) !important;
                }
                .category-tab.active:hover {
                    background: var(--color-lime) !important;
                }
                .info-card {
                    overflow: hidden;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
                }
                .info-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--color-lime);
                    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);
                }
                .card-content-wrapper {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                    padding-top: 0.5rem;
                }
                .image-shimmer-container {
                    flex-shrink: 0;
                    width: 200px;
                    height: 150px;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    background: #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border: 1px solid rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .shimmer::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    transform: translateX(-100%);
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer-anim 2s infinite;
                }
                @keyframes shimmer-anim {
                    100% { transform: translateX(100%); }
                }
                .info-card-image {
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.5s ease;
                }
                .card-text-content {
                    flex: 1;
                    min-width: 0;
                }
                .tag {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 6px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .type-tag { background: #fee2e2; color: #991b1b; }
                .cat-tag { background: #dcfce7; color: #166534; }
                .use-tag { background: #fef9c3; color: #854d0e; }
                
                @media (max-width: 900px) {
                    .plantopedia-layout { grid-template-columns: 1fr; }
                    .plantopedia-sidebar { position: relative; top: 0; }
                    .card-content-wrapper { flex-direction: column; }
                    .image-shimmer-container { width: 100%; height: 180px; }
                }
            `}</style>
        </div>
    );
};

export default Plantopedia;
