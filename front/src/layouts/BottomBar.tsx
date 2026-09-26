import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoginButton from '../features/auth/components/Auth';
import AuthModal from '../features/auth/components/AuthModal';
import Friends from '../features/friends/components/Friends';
import EditProfileContent from '../features/profile/components/EditProfileContent';
import LegalContent from '../features/legal/LegalContent';
import LegalModal from '../features/legal/LegalModal';
import Button from '../components/ui/Button';
import ModalLayout, { ModalShell } from '../components/ui/ModalLayout';
import { MenuIcon } from '../types/icons';

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
      <Button
        variant="ghost"
        type="button"
        onClick={() => onOpenLegal('privacy')}
        className={mobileMenuOpen ? 'menuButton' : 'bottomBarButton glass-panel'}
      >
        {t('legal.privacyButton')}
      </Button>

      <Button
        variant="ghost"
        type="button"
        onClick={() => onOpenLegal('terms')}
        className={mobileMenuOpen ? 'menuButton' : 'bottomBarButton glass-panel'}
      >
        {t('legal.termsButton')}
      </Button>
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileView('menu');
    setIsAuthOpen(false);
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
              <ModalShell variant="sheet" onClose={closeMobileMenu}>
                {mobileView === 'menu' ? (
                  <ModalLayout
                    embedded
                    variant="sheet"
                    onClose={closeMobileMenu}
                    bodyClassName="flex flex-col items-center gap-2.5"
                  >
                    <LoginButton
                      onOpenAuth={openMobileAuth}
                      embedded
                      onOpenProfile={() => setMobileView('profileMenu')}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      className="menuButton"
                      onClick={() => setMobileView('friends')}
                    >
                      {t('friends.buttonTitle', 'Friends')}
                    </Button>
                    <LegalButtons onOpenLegal={openLegalModal} mobileMenuOpen={mobileMenuOpen} />
                  </ModalLayout>
                ) : mobileView === 'friends' ? (
                  <ModalLayout
                    embedded
                    variant="sheet"
                    onBack={() => setMobileView('menu')}
                    onClose={closeMobileMenu}
                  >
                    <Friends embedded />
                  </ModalLayout>
                ) : mobileView === 'auth' ? (
                  <AuthModal isOpen={isAuthOpen} onClose={closeMobileAuth} embedded />
                ) : mobileView === 'profileMenu' ? (
                  <ModalLayout
                    embedded
                    variant="sheet"
                    onBack={() => setMobileView('menu')}
                    onClose={closeMobileMenu}
                  >
                    <LoginButton
                      onOpenAuth={openMobileAuth}
                      embedded
                      mobileProfileMenu
                      onOpenProfile={() => setMobileView('profileMenu')}
                      onBack={() => setMobileView('menu')}
                      onOpenEditProfile={() => setMobileView('profile')}
                    />
                  </ModalLayout>
                ) : mobileView === 'profile' ? (
                  <EditProfileContent
                    onClose={() => setMobileView('profileMenu')}
                    shell={{ embedded: true, variant: 'sheet' }}
                  />
                ) : (
                  <LegalContent
                    initialTab={legalTab}
                    onClose={closeMobileMenu}
                    onBack={() => setMobileView('menu')}
                    shell={{ embedded: true, variant: 'sheet' }}
                  />
                )}
              </ModalShell>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setMobileView('menu');
                setIsAuthOpen(false);
              }}
              className="glass-panel px-4 py-2 font-semibold flex items-center gap-2"
            >
              <MenuIcon open={mobileMenuOpen} className="w-5 h-5" />

              {t('nav.menu', 'Menu')}
            </Button>
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
