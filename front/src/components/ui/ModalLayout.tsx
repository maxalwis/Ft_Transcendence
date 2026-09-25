import { ReactNode } from 'react';
import Button from './Button';
import { BackIcon, CloseIcon } from '../../types/icons';

interface ModalLayoutProps {
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
}

export default function ModalLayout({
  children,
  onClose,
  onBack,
  title,
}: ModalLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="relative flex min-h-16 shrink-0 items-center justify-center px-16">
        {onBack && (
          <Button
            variant="icon"
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="modal-button absolute left-3 top-1/2 -translate-y-1/2"
          >
            <BackIcon className="h-6 w-6" />
          </Button>
        )}

        {title && (
          <h2 className="truncate text-center text-base font-semibold">
            {title}
          </h2>
        )}

        <Button
          variant="icon"
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="modal-button absolute right-3 top-1/2 -translate-y-1/2"
        >
          <CloseIcon className="h-6 w-6" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}