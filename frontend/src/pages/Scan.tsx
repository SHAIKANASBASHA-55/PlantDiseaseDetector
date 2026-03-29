import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Camera, X, Info, Sprout } from 'lucide-react';

const Scan: React.FC = () => {
    const [mode, setMode] = useState<'upload' | 'camera'>('upload');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [noPlantError, setNoPlantError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

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

    const DEMO_IMAGES: Record<string, { localPath: string; backendClass: string; label: string }> = {
        Apple_Scab:    { localPath: '/demo/Apple___Apple_scab.jpg',                    backendClass: 'Apple___Apple_scab',                    label: 'Apple Scab' },
        Tomato_Blight: { localPath: '/demo/Tomato___Late_blight.jpg',                  backendClass: 'Tomato___Late_blight',                  label: 'Tomato Blight' },
        Healthy_Cherry:{ localPath: '/demo/Cherry_(including_sour)___healthy.jpg',      backendClass: 'Cherry_(including_sour)___healthy',      label: 'Healthy Cherry' },
    };

    const handleDemoImage = async (key: string) => {
        setIsLoading(true);
        const demo = DEMO_IMAGES[key];
        try {
            // Try backend first (for variety), fall back to bundled local image
            let blob: Blob | null = null;
            try {
                const response = await fetch(`http://localhost:8000/image/${demo.backendClass}`);
                if (response.ok) {
                    const ct = response.headers.get('content-type') ?? '';
                    if (!ct.includes('application/json')) {
                        blob = await response.blob();
                    }
                }
            } catch (_) { /* backend not reachable – use local fallback */ }

            if (!blob) {
                // Load from bundled public/demo/ asset
                const fallbackRes = await fetch(demo.localPath);
                blob = await fallbackRes.blob();
            }

            const file = new File([blob], 'demo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setPreviewSrc(URL.createObjectURL(blob));
            setMode('upload');
        } catch (err) {
            console.error('Demo image load error:', err);
            alert('Could not load demo image.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeChange = async (newMode: 'upload' | 'camera') => {
        setMode(newMode);
        setSelectedImage(null);
        setPreviewSrc(null);

        if (newMode === 'camera') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                alert("Camera access denied or unavailable.");
                setMode('upload');
            }
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], 'camera-capture.png', { type: 'image/png' });
                        setSelectedImage(file);
                        setPreviewSrc(URL.createObjectURL(blob));
                        handleModeChange('upload'); // stop camera
                        setMode('upload');
                    }
                }, 'image/png');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewSrc(URL.createObjectURL(file));
            setNoPlantError(null); // clear previous error
        }
    };

    const submitImage = async () => {
        if (!selectedImage) return;
        setIsLoading(true);
        setNoPlantError(null);

        const formData = new FormData();
        formData.append('file', selectedImage);

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            // Backend flagged this as a non-plant image
            if (data.error === 'no_plant') {
                setNoPlantError(data.message || 'No plant detected. Please upload a clear leaf photo.');
                setIsLoading(false);
                return;
            }

            navigate('/result', { state: { result: data, imageSrc: previewSrc } });
        } catch (err) {
            console.error(err);
            alert('Failed to connect to the backend server. Is it running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', marginLeft: 'calc(-50vw + 50%)' }}>
                <Sprout color="var(--color-green)" style={{ position: 'absolute', width: '160px', height: '160px', top: '15vh', left: '10vw', opacity: 0.12, transform: `translate(${mouseX * -40}px, ${mouseY * -40}px) rotate(25deg)`, transition: 'transform 0.1s ease-out' }} />
                <Sprout color="var(--color-green)" style={{ position: 'absolute', width: '220px', height: '220px', top: '50vh', right: '10vw', opacity: 0.08, transform: `translate(${mouseX * 50}px, ${mouseY * 50}px) rotate(-35deg)`, transition: 'transform 0.1s ease-out' }} />
                <Sprout color="var(--color-green)" style={{ position: 'absolute', width: '120px', height: '120px', top: '80vh', left: '15vw', opacity: 0.15, transform: `translate(${mouseX * -20}px, ${mouseY * -20}px) rotate(80deg)`, transition: 'transform 0.1s ease-out' }} />
            </div>

            <div className="upload-container animate-fade-in delay-100">
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <h2 style={{ margin: 0, color: 'var(--color-dark-green)' }}>
                            Scan a Leaf
                        </h2>
                        <div className="tooltip-container">
                            <Info size={22} color="var(--color-lime)" style={{ opacity: 0.8 }} />
                            <span className="tooltip-text">
                                For best results, get close to the leaf, ensure good lighting, and make sure the leaf takes up the majority of the frame.
                            </span>
                        </div>
                    </div>

                    <div className="toggle-container">
                        <button className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`} onClick={() => handleModeChange('upload')}>
                            <UploadCloud size={20} /> Upload
                        </button>
                        <button className={`toggle-btn ${mode === 'camera' ? 'active' : ''}`} onClick={() => handleModeChange('camera')}>
                            <Camera size={20} /> Camera
                        </button>
                    </div>

                    {mode === 'camera' && !previewSrc && (
                        <div className="camera-preview" style={{ position: 'relative' }}>
                            <video ref={videoRef} autoPlay playsInline muted />
                            <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', backdropFilter: 'blur(4px)' }}>
                                <span style={{ width: 10, height: 10, background: '#ff4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span> LIVE
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '1rem', position: 'absolute', bottom: 10, left: 0, right: 0 }}>
                                <button className="btn-primary" onClick={capturePhoto} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>Capture Photo</button>
                            </div>
                        </div>
                    )}

                    {mode === 'upload' && !previewSrc && (
                        <>
                            <div
                                className={`upload-box${isDragging ? ' dragging' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file && file.type.startsWith('image/')) {
                                        setSelectedImage(file);
                                        setPreviewSrc(URL.createObjectURL(file));
                                        setNoPlantError(null);
                                    }
                                }}
                            >
                                <div style={{ background: isDragging ? 'rgba(106, 191, 75, 0.3)' : 'rgba(106, 191, 75, 0.15)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem', transition: 'background 0.2s' }}>
                                    <UploadCloud className="upload-icon" style={{ margin: 0, width: 48, height: 48 }} />
                                </div>
                                <p style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-dark-green)' }}>{isDragging ? 'Drop it here!' : 'Click or drag to upload'}</p>
                                <p style={{ opacity: 0.6, fontSize: '0.95rem', marginTop: '0.25rem' }}>Supports JPG, PNG (Max 10MB)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '1rem', marginBottom: '1rem', fontWeight: 500 }}>No leaf nearby? Try a sample image:</p>
                                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {Object.entries(DEMO_IMAGES).map(([key, demo]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleDemoImage(key)}
                                            style={{ border: '2px solid var(--color-glass-input)', background: 'white', borderRadius: '14px', cursor: 'pointer', overflow: 'hidden', padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(106,191,75,0.25)'; e.currentTarget.style.borderColor = 'var(--color-lime)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--color-glass-input)'; }}
                                        >
                                            <img
                                                src={demo.localPath}
                                                alt={demo.label}
                                                style={{ width: '90px', height: '80px', objectFit: 'cover', display: 'block' }}
                                            />
                                            <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 600, padding: '4px 6px', whiteSpace: 'nowrap' }}>{demo.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {previewSrc && (
                        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={previewSrc} alt="Preview" style={{ maxWidth: '100%', borderRadius: '16px', border: '3px solid var(--color-lime)', boxShadow: '0 10px 30px rgba(106, 191, 75, 0.2)' }} />

                                {isLoading && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: '14px', zIndex: 5 }}>
                                        <div style={{ width: '100%', height: '4px', background: 'var(--color-lime)', boxShadow: '0 0 20px 8px var(--color-lime)', animation: 'scanline 2s cubic-bezier(0.4, 0, 0.2, 1) infinite', position: 'absolute', top: 0 }} />
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(106, 191, 75, 0.1)', animation: 'pulse 2s infinite' }}></div>
                                    </div>
                                )}

                                {!isLoading && (
                                    <button
                                        onClick={() => { setSelectedImage(null); setPreviewSrc(null); setNoPlantError(null); }}
                                        style={{ position: 'absolute', top: -15, right: -15, background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(255, 68, 68, 0.4)', zIndex: 10 }}
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* No-plant error banner */}
                            {noPlantError && (
                                <div style={{ marginTop: '1.25rem', background: '#fff5f5', border: '1.5px solid #feb2b2', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🌿</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#c53030', fontSize: '0.95rem' }}>No Plant Detected</p>
                                        <p style={{ margin: '0.2rem 0 0', color: '#742a2a', fontSize: '0.88rem', lineHeight: 1.5 }}>{noPlantError}</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '1.5rem' }}>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 8px 20px rgba(106, 191, 75, 0.4)' }}
                                    onClick={submitImage}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Analyzing Leaf Cells...' : 'Diagnose Plant'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Scan;
