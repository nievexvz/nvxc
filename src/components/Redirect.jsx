// src/components/Redirect.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOriginalURL, incrementClick } from '../lib/github';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const Redirect = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const redirectToOriginalURL = async () => {
      try {
        const originalUrl = await getOriginalURL(slug);
        
        if (originalUrl) {
          // Increment click count
          await incrementClick(slug);
          
          // Redirect after a short delay to show loading animation
          setTimeout(() => {
            window.location.href = originalUrl;
          }, 1500);
        } else {
          setError('URL tidak ditemukan');
          setLoading(false);
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengalihkan');
        setLoading(false);
      }
    };

    redirectToOriginalURL();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 text-center max-w-md w-full"
        >
          <Icon icon="mdi:alert-circle-outline" className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Kembali ke Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-r from-indigo-700 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center"
        >
          <Icon icon="mdi:link-variant" className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Mengalihkan...</h1>
        <p className="text-slate-300 mb-2">Sedang mengarahkan ke URL tujuan</p>
        <p className="text-slate-400 text-sm">Slug: {slug}</p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full mt-6"
        />
      </motion.div>
    </div>
  );
};

export default Redirect;
