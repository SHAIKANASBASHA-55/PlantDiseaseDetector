import React, { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html,
  MeshDistortMaterial,
  Sparkles
} from '@react-three/drei';
import * as THREE from 'three';
import { Droplet, RefreshCcw } from 'lucide-react';

// Extend ThreeElements for TS
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// --- 3D Components ---

const Soil = () => (
  <mesh rotation-x={-Math.PI / 2} position-y={-0.1} receiveShadow>
    <circleGeometry args={[1.5, 32]} />
    <meshStandardMaterial color="#3d2b1f" roughness={1} metalness={0} />
  </mesh>
);

const Seed = ({ visible }: { visible: boolean }) => (
  <group visible={visible}>
    <mesh position={[0, 0.05, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#5c4033" roughness={0.6} />
    </mesh>
  </group>
);

const Plant = ({ growth }: { growth: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const isSprout = growth > 0.1 && growth <= 0.4;
  const isStem = growth > 0.4 && growth <= 0.7;
  const isFull = growth > 0.7;

  return (
    <group ref={meshRef}>
      {/* Sprout Stage */}
      {isSprout && (
        <group scale={growth * 2.5}>
          <mesh castShadow position={[0.02, 0.1, 0]} rotation={[0, 0, 0.2]}>
            <sphereGeometry args={[0.05, 12, 12]}/>
            <meshStandardMaterial color="#8aff8a" />
          </mesh>
          <mesh castShadow position={[-0.02, 0.1, 0]} rotation={[0, 0, -0.2]}>
            <sphereGeometry args={[0.05, 12, 12]}/>
            <meshStandardMaterial color="#8aff8a" />
          </mesh>
        </group>
      )}

      {/* Growing Stem */}
      {(isStem || isFull) && (
        <mesh position={[0, growth * 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, Math.max(0.1, growth * 1.2), 16]} />
          <meshStandardMaterial color="#2d5a27" />
        </mesh>
      )}

      {/* Leaves Cluster */}
      {isFull && (
        <group position={[0, growth * 1.1, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh 
              key={i} 
              rotation={[Math.PI / 4, 0, (i * Math.PI) / 2]} 
              position={[Math.cos((i * Math.PI) / 2) * 0.3, 0, Math.sin((i * Math.PI) / 2) * 0.3]}
              castShadow
            >
              <sphereGeometry args={[0.25, 16, 16]} />
              <MeshDistortMaterial 
                color="#4a7c44" 
                distort={0.3} 
                speed={2} 
                roughness={0.2}
              />
            </mesh>
          ))}
          {/* Fruit */}
          <mesh position={[0, 0.2, 0]} castShadow>
             <sphereGeometry args={[0.15, 16, 16]} />
             <meshStandardMaterial color="#ff4444" roughness={0.1} metalness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
};

const Experience = ({ 
  stage, 
  growth, 
  isWatering, 
  onPlant, 
  onGrowthUpdate 
}: { 
  stage: string, 
  growth: number, 
  isWatering: boolean, 
  onPlant: () => void,
  onGrowthUpdate: (val: number) => void 
}) => {
  useFrame((_state, delta) => {
    if (isWatering && stage !== 'idle' && growth < 1) {
      onGrowthUpdate(Math.min(growth + delta * 0.15, 1));
    }
  });

  return (
    <>
      <group onClick={onPlant}>
        <Soil />
        <Seed visible={stage === 'planted'} />
        <Plant growth={growth} />
        {isWatering && (
          <Sparkles 
            count={40} 
            scale={[1, 2, 1] as any} 
            size={4} 
            speed={2} 
            opacity={0.6} 
            color="#4a9eff" 
            position={[0, 1.5, 0] as any}
          />
        )}
      </group>
      
      <Html position={[0, 2, 0]} center>
            <div style={{ pointerEvents: 'none', color: 'var(--color-lime)', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', width: '250px', textAlign: 'center' }}>
              {stage === 'idle' && "Click the soil to plant a seed"}
              {stage === 'planted' && "Hold 'Water Plant' button"}
              {stage === 'growing' && "Growing..."}
              {stage === 'full' && "🎉 Harvest Ready!"}
            </div>
      </Html>
    </>
  );
};

// --- Main Page Component ---

const Funny: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'planted' | 'growing' | 'full'>('idle');
  const [growth, setGrowth] = useState(0);
  const [isWatering, setIsWatering] = useState(false);

  useEffect(() => {
    if (growth > 0.1 && growth < 1 && stage === 'planted') setStage('growing');
    if (growth >= 1) setStage('full');
  }, [growth, stage]);

  const handlePlant = () => {
    if (stage === 'idle') {
      setStage('planted');
      setGrowth(0.05);
    }
  };

  const handleReset = () => {
    setStage('idle');
    setGrowth(0);
    setIsWatering(false);
  };

  return (
    <div className="page-container glass-card" style={{ height: '80vh', position: 'relative', overflow: 'hidden', padding: 0 }}>
      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [4, 4, 4], fov: 40 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2.1} />
          <Environment preset="city" />

          <Experience 
            stage={stage} 
            growth={growth} 
            isWatering={isWatering} 
            onPlant={handlePlant}
            onGrowthUpdate={setGrowth}
          />

          <ContactShadows 
            position={[0, -0.11, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={1} 
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem' }}>
        <button 
          className="btn btn-secondary"
          onMouseDown={() => setIsWatering(true)}
          onMouseUp={() => setIsWatering(false)}
          onMouseLeave={() => setIsWatering(false)}
          onTouchStart={() => setIsWatering(true)}
          onTouchEnd={() => setIsWatering(false)}
          disabled={stage === 'idle' || stage === 'full'}
          style={{ padding: '1rem 2rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#2d3748', border: '1px solid #4a5568' }}
        >
          <Droplet size={20} color="#4a9eff" fill={isWatering ? "#4a9eff" : "none"} />
          Water Plant
        </button>
        
        <button 
          className="btn"
          onClick={handleReset}
          style={{ padding: '0.8rem', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: 'white' }}
          title="Reset"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
         <div className="badge lime" style={{ padding: '0.5rem 1rem', background: 'var(--color-lime)', color: '#000', fontWeight: 'bold', borderRadius: '8px' }}>
           Growth: {Math.round(growth * 100)}%
         </div>
      </div>
    </div>
  );
};

export default Funny;
