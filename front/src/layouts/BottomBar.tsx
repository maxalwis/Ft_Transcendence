import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoginButton from '../features/auth/components/Auth';
import AuthModal from '../features/auth/components/AuthModal';
import Friends from '../features/friends/components/Friends';
import EditProfileContent from '../features/profile/components/EditProfileContent';
import LegalContent from '../features/legal/LegalContent';
import LegalModal from '../features/legal/LegalModal';

function LegalButtons({
  onOpenLegal,
  mobileMenuOpen,
}: {
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
  mobileMenuOpen: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={`flex gap-2 ${mobileMenuOpen ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => onOpenLegal('privacy')}
        className={mobileMenuOpen ? 'menuButton' : 'bottomBarButton glass-panel'}
      >
        {t('legal.privacyButton')}
      </button>

      <button
        type="button"
        onClick={() => onOpenLegal('terms')}
        className={mobileMenuOpen ? 'menuButton' : 'bottomBarButton glass-panel'}
      >
        {t('legal.termsButton')}
      </button>
    </div>
  );
}

export default function BottomBar() {
  const { t } = useTranslation();

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mobileView, setMobileView] = useState<
    'menu' | 'friends' | 'auth' | 'profileMenu' | 'profile' | 'legal'
  >('menu');

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = () => {
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);

    if (window.innerWidth <= 900) {
      setMobileMenuOpen(true);
      setMobileView('legal');
    } else {
      setLegalModalOpen(true);
    }
  };

  const openMobileAuth = () => {
    setIsAuthOpen(true);
    setMobileMenuOpen(true);
    setMobileView('auth');
  };

  const closeMobileAuth = () => {
    setIsAuthOpen(false);
    setMobileView('menu');
  };

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest('button')) {
        setLegalModalOpen(false);
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
        setMobileView('menu');
        setIsAuthOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div dir="ltr" className="fixed bottom-2 w-full px-4 sm:px-6 z-[1000] pointer-events-none">
        {/* PC Version */}
        <div className="flex items-center justify-between w-full mobile-desktop">
          <div className="pointer-events-auto">
            <Friends />
          </div>

          <div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto">
            <LoginButton onOpenAuth={openAuth} />
          </div>

          <LegalButtons onOpenLegal={openLegalModal} mobileMenuOpen={mobileMenuOpen} />
        </div>

        {/* Mobile Version */}
        <div className="flex items-center justify-center w-full relative pointer-events-auto">
          <div className="mobile-only">
            {mobileMenuOpen && (
              <div
                className="glass-modal-overlay"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setMobileView('menu');
                  setIsAuthOpen(false);
                }}
              >
                <div
                  className="
                    glass-modal absolute bottom-14 left-1/2 -translate-x-1/2
                    glass-panel p-5 flex flex-col items-center gap-2.5
                    shadow-2xl rounded-2xl
                    min-w-xs max-w-md
                    max-h-[70vh]
                  "
                  onClick={(e) => e.stopPropagation()}
                >
                  {mobileView === 'menu' ? (
                    <>
                      <LoginButton
                        onOpenAuth={openMobileAuth}
                        embedded
                        onOpenProfile={() => setMobileView('profileMenu')}
                      />

                      <button
                        type="button"
                        className="menuButton"
                        onClick={() => setMobileView('friends')}
                      >
                        {t('friends.buttonTitle', 'Friends')}
                      </button>

                      <LegalButtons onOpenLegal={openLegalModal} mobileMenuOpen={mobileMenuOpen} />
                    </>
                  ) : mobileView === 'friends' ? (
                    <Friends embedded onBack={() => setMobileView('menu')} />
                  ) : mobileView === 'auth' ? (
                    <AuthModal isOpen={isAuthOpen} onClose={closeMobileAuth} embedded />
                  ) : mobileView === 'profileMenu' ? (
                    <LoginButton
                      onOpenAuth={openMobileAuth}
                      embedded
                      mobileProfileMenu
                      onOpenProfile={() => setMobileView('profileMenu')}
                      onBack={() => setMobileView('menu')}
                      onOpenEditProfile={() => setMobileView('profile')}
                    />
                  ) : mobileView === 'profile' ? (
                    <EditProfileContent onClose={() => setMobileView('profileMenu')} />
                  ) : (
                    <LegalContent initialTab={legalTab} onClose={() => setMobileView('menu')} />
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileView('menu');
                setIsAuthOpen(false);
              }}
              className="glass-panel px-4 py-2 font-semibold flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>

              {t('nav.menu', 'Menu')}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop auth modal */}
      {!mobileMenuOpen && <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />}

      {/* Desktop legal modal */}
      <LegalModal
        key={legalTab}
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}
