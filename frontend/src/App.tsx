import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Result from './pages/Result';
import Encyclopedia from './pages/Encyclopedia';
import Plantopedia from './pages/Plantopedia';
import Funny from './pages/Funny';

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/result" element={<Result />} />
                    <Route path="/encyclopedia" element={<Encyclopedia />} />
                    <Route path="/plantopedia" element={<Plantopedia />} />
                    <Route path="/funny" element={<Funny />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
