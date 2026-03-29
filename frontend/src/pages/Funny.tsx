import React from 'react';

const Funny: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden', background: '#080c08' }}>
            <iframe 
                src="/Funny.html" 
                title="PlantDaddy 3000"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                }}
            />
        </div>
    );
};

export default Funny;
