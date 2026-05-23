import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Globe, Star, ArrowRight, ArrowLeft, Gift, Recycle, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';
import etrashhubLogo from '../assets/images/logo etrashhub.png';

const ONBOARDING_STEPS = [
  {
    title: 'Selamat Datang di e-TrashHub',
    description: 'Solusi cerdas end-to-end terintegrasi untuk pengelolaan sampah modern dan berkelanjutan.',
    image: etrashhubLogo,
    color: '#10b981', // Emerald
    bgColor: '#ecfdf5',
  },
  {
    title: 'Tukar Sampah Jadi Berkah',
    description: 'Nggak perlu repot buang sampah anorganik. Cukup pesan lewat aplikasi, kurir kami akan menjemputnya langsung ke depan pintu rumahmu. Kamu dapat poin, rumah pun jadi bersih!',
    icon: Gift,
    color: '#3b82f6', // Blue
    bgColor: '#eff6ff',
  },
  {
    title: 'Terhubung Hingga ke Industri',
    description: 'Sampah yang terkumpul nggak berakhir di TPA. Kami menyalurkannya ke fasilitas TPS3R dan mitra industri daur ulang agar kembali menjadi barang yang bermanfaat.',
    icon: Recycle,
    color: '#f59e0b', // Amber
    bgColor: '#fffbeb',
  },
  {
    title: 'Satu Langkah Kecil untuk Bumi',
    description: 'Setiap botol dan kardus yang kamu pilah turut mengurangi emisi karbon dan menyelamatkan bumi kita. Yuk, mulai kebiasaan baik ini dari sekarang!',
    icon: Heart,
    color: '#ec4899', // Pink
    bgColor: '#fdf2f8',
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/roles');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate('/roles');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a2318', overflow: 'hidden', position: 'relative' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      
      <div className="auth-page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar for Skip */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <button 
              onClick={handleSkip}
              style={{ 
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', 
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: '0.5rem 1rem' 
              }}
              className="hover:bg-white/20 rounded-full transition-colors"
            >
              Lewati
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
          
          {/* Step Content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <div 
                  style={{ 
                    width: '120px', height: '120px', borderRadius: '50%', 
                    backgroundColor: ONBOARDING_STEPS[currentStep].bgColor, 
                    color: ONBOARDING_STEPS[currentStep].color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '2rem',
                    overflow: 'hidden'
                  }}
                >
                  {ONBOARDING_STEPS[currentStep].image ? (
                    <img src={ONBOARDING_STEPS[currentStep].image} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                  ) : (
                    ONBOARDING_STEPS[currentStep].icon && React.createElement(ONBOARDING_STEPS[currentStep].icon, { size: 64 })
                  )}
                </div>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ecfdf5', marginBottom: '1rem', lineHeight: 1.2 }}>
                  {ONBOARDING_STEPS[currentStep].title}
                </h1>
                <p style={{ fontSize: '1rem', color: '#a7f3d0', lineHeight: 1.6, padding: '0 1rem' }}>
                  {ONBOARDING_STEPS[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
            
            {/* Progress Indicators */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ONBOARDING_STEPS.map((_, index) => (
                <div 
                  key={index}
                  style={{
                    height: '8px',
                    width: index === currentStep ? '24px' : '8px',
                    borderRadius: '4px',
                    backgroundColor: index === currentStep ? '#4ade80' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handlePrev} 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleNext} 
                style={{ flex: currentStep > 0 ? 2 : 1, width: '100%', backgroundColor: '#4ade80', color: '#064e3b' }}
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Mulai Sekarang' : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Selanjutnya <ArrowRight size={20} />
                  </div>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
