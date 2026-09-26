import LegalContent from './LegalContent';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy' }: LegalModalProps) {
  if (!isOpen) return null;

  return <LegalContent initialTab={initialTab} onClose={onClose} />;
}
