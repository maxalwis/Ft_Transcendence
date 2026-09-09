import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginButton from '../features/auth/components/Auth';
import Friends from '../features/friends/components/Friends';
import LegalModal from '../features/legal/LegalModal'; // Adjust import path to match your structure

interface BottomBarProps {
  onOpenAuth: () => void;
}

export default function BottomBar({ onOpenAuth }: BottomBarProps) {
  const { t } = useTranslation();
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <>
      <div
        dir="ltr"
        className="fixed bottom-2 w-full flex flex-row items-center justify-between px-6 z-[500] pointer-events-none"
      >
        {/* Left side position */}
        <div className="pointer-events-auto">
          <Friends />
        </div>

        {/* Centered actions */}
        <div
          dir="ltr"
          className="flex items-center absolute bottom-0 left-1/2 -translate-x-1/2 gap-2 pointer-events-auto"
        >
          <LoginButton onOpenAuth={onOpenAuth} />

          <button type="button" className="glass-panel" aria-label="Notifications">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
        </div>

        {/* Right side legal links */}
        <div className="pointer-events-auto flex items-center gap-4">
          <button type="button" onClick={() => openLegalModal('privacy')} className="glass-panel">
            {t('legal.privacyButton')}
          </button>
          <button type="button" onClick={() => openLegalModal('terms')} className="glass-panel">
            {t('legal.termsButton')}
          </button>
        </div>
      </div>

      {/* Render Modal */}
      <LegalModal
        key={legalTab}
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
}
