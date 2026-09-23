import LegalContent from './LegalContent';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div
        className="glass-modal modalContent relative p-6 w-full flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <LegalContent initialTab={initialTab} onClose={onClose} />
      </div>
    </div>
  );
}
