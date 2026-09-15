import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginButton from '../features/auth/components/Auth';
import Friends, { FriendsButton } from '../features/friends/components/Friends';
import EditProfileContent from '../features/profile/components/EditProfileContent';
import LegalContent from '../features/legal/LegalContent';
import LegalModal from '../features/legal/LegalModal';

interface BottomBarProps {
  onOpenAuth: () => void;
}

function LegalButtons({ onOpenLegal }: { onOpenLegal: (tab: 'privacy' | 'terms') => void }) {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenLegal('privacy')}
        className="glass-panel px-3 py-1.5 text-sm whitespace-nowrap"
      >
        {t('legal.privacyButton')}
      </button>

      <button
        type="button"
        onClick={() => onOpenLegal('terms')}
        className="glass-panel px-3 py-1.5 text-sm whitespace-nowrap"
      >
        {t('legal.termsButton')}
      </button>
    </>
  );
}

export default function BottomBar({ onOpenAuth }: BottomBarProps) {
  const { t } = useTranslation();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<
    'menu' | 'friends' | 'profileMenu' | 'profile' | 'legal'
  >('menu');

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);

    if (window.innerWidth <= 900) {
      setMobileMenuOpen(true);
      setMobileView('legal');
    } else {
      setLegalModalOpen(true);
    }
  };

  return (
    <>
      <div dir="ltr" className="fixed bottom-2 w-full px-4 sm:px-6 z-[1000] pointer-events-none">
        {/* PC Version (md+) */}
        <div className="flex items-center justify-between w-full mobile-desktop">
          <div className="pointer-events-auto">
            <Friends />
          </div>

          <div className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto">
            <LoginButton onOpenAuth={onOpenAuth} />
          </div>

          <div className="pointer-events-auto flex items-center gap-4">
            <LegalButtons onOpenLegal={openLegalModal} />
          </div>
        </div>

        {/* Mobile Version (< md) - Adaptée aux small devices */}
        <div className="flex items-center justify-center w-full relative pointer-events-auto mobile-only">
          {/* Menu déroulant vertical compact */}
          {mobileMenuOpen && (
            <div
              className="glass-modal-overlay"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileView('menu');
              }}
            >
              <div
                className="glass-modal absolute bottom-14 left-1/2 -translate-x-1/2
                  glass-panel p-3 flex flex-col items-center gap-2.5
                  shadow-2xl rounded-2xl
                  w-[calc(100vw-2rem)] max-w-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {mobileView === 'menu' ? (
                  <>
                    <FriendsButton onClick={() => setMobileView('friends')} />

                    <div className="w-full h-[1px] bg-white/10" />

                    <LoginButton
                      onOpenAuth={onOpenAuth}
                      embedded
                      onOpenProfile={() => setMobileView('profileMenu')}
                    />

                    <div className="w-full h-[1px] bg-white/10" />

                    <LegalButtons onOpenLegal={openLegalModal} />
                  </>
                ) : mobileView === 'friends' ? (
                  <Friends embedded onBack={() => setMobileView('menu')} />
                ) : mobileView === 'profileMenu' ? (
                  <LoginButton
                    onOpenAuth={onOpenAuth}
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
          {/* Bouton de déclenchement */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setMobileView('menu');
            }}
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

      <LegalModal
        key={legalTab}
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}
