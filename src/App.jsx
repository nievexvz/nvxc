// src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import URLShortener from './components/URLShortener';
import Redirect from './components/Redirect';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const MainContent = () => (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'upload' && <FileUpload />}
      {activeTab === 'shortener' && <URLShortener />}
    </Layout>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/r/:slug" element={<Redirect />} />
      </Routes>
    </Router>
  );
}

export default App;
