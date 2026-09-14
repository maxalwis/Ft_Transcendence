import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoginButton from '../features/auth/components/Auth';
import Friends from '../features/friends/components/Friends';
import LegalModal from '../features/legal/LegalModal';

interface BottomBarProps {
  onOpenAuth: () => void;
}

export default function BottomBar({ onOpenAuth }: BottomBarProps) {
  const { t } = useTranslation();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Ferme la modale légale au clic n'importe où sur l'écran
  useEffect(() => {
    if (!legalModalOpen) return;

    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('button')) {
        setLegalModalOpen(false);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [legalModalOpen]);

  const LegalButtons = () => (
    <>
      <button
        type="button"
        onClick={() => openLegalModal('privacy')}
        className="glass-panel px-3 py-1.5 text-sm whitespace-nowrap"
      >
        {t('legal.privacyButton')}
      </button>
      <button
        type="button"
        onClick={() => openLegalModal('terms')}
        className="glass-panel px-3 py-1.5 text-sm whitespace-nowrap"
      >
        {t('legal.termsButton')}
      </button>
    </>
  );

  return (
    <>
      <div
        dir="ltr"
        className="fixed bottom-2 w-full px-4 sm:px-6 z-[500] pointer-events-none"
      >
        {/* PC Version (md+) */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="pointer-events-auto">
            <Friends />
          </div>

          <div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto">
            <LoginButton onOpenAuth={onOpenAuth} />
          </div>

          <div className="pointer-events-auto flex items-center gap-4">
            <LegalButtons />
          </div>
        </div>

        {/* Mobile Version (< md) - Adaptée aux small devices */}
        <div className="md:hidden flex items-center justify-center w-full relative pointer-events-auto">
          {/* Menu déroulant vertical compact */}
          {mobileMenuOpen && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel p-3 flex flex-col items-center gap-2.5 shadow-2xl rounded-2xl z-[501] w-[calc(100vw-2rem)] max-w-xs">
              <div className="relative z-[502] w-full flex justify-center">
                <Friends />
              </div>

              <div className="w-full h-[1px] bg-white/10" />

              <div className="relative z-[502] w-full flex justify-center">
                <LoginButton onOpenAuth={onOpenAuth} />
              </div>

              <div className="w-full h-[1px] bg-white/10" />

              <div className="flex items-center justify-center gap-2 w-full">
                <LegalButtons />
              </div>
            </div>
          )}

          {/* Bouton de déclenchement */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="glass-panel px-4 py-2 font-semibold text-sm flex items-center gap-2 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
            {t('nav.menu', 'Menu')}
          </button>
        </div>
      </div>

      <LegalModal
        key={legalTab}
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}
