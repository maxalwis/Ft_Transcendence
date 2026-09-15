import LegalContent from './LegalContent';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = 'privacy',
}: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="glass-modal-overlay">
      <div className="glass-modal max-w-2xl w-full max-h-[85vh] z-[600] glass-animate-in">
        <LegalContent
          initialTab={initialTab}
          onClose={onClose}
        />
      </div>
    </div>
  );
}