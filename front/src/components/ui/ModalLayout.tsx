import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { BackIcon, CloseIcon } from '../../types/icons';
import styles from './ModalLayout.module.css';

export type ModalLayoutVariant = 'sidebar' | 'menu' | 'legal' | 'popover' | 'sheet';

// Shared glass surface applied on top of the structure defined in ModalLayout.module.css
const surfaceClass: Record<ModalLayoutVariant, string> = {
  sidebar: 'glass-panel',
  menu: 'glass-modal',
  legal: 'glass-modal',
  popover: 'glass-panel',
  sheet: 'glass-modal glass-panel',
};

// Variants displayed over a dimmed backdrop; clicking the backdrop closes the modal
const hasOverlay: ModalLayoutVariant[] = ['menu', 'legal', 'sheet'];

/** Props controlling the shell around the header/body. */
export interface ModalShellProps {
  variant?: ModalLayoutVariant;
  size?: 'sm';
  /** Skip the shell: the parent already provides the surface (e.g. mobile sheet). */
  embedded?: boolean;
  /** Render the shell into document.body. */
  portal?: boolean;
  /** Drives the open/close animation. */
  dataState?: 'open' | 'closed';
  onAnimationEnd?: () => void;
  /** Extra classes for positioning owned by the feature (popover anchoring, animations). */
  className?: string;
}

interface ModalLayoutProps extends ModalShellProps {
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  bodyClassName?: string;
}

/** Overlay + surface only, for containers that host several ModalLayout views. */
export function ModalShell({
  children,
  onClose,
  variant = 'menu',
  size,
  portal = false,
  dataState,
  onAnimationEnd,
  className = '',
}: ModalShellProps & { children: ReactNode; onClose: () => void }) {
  const overlaid = hasOverlay.includes(variant);

  const shell = (
    <div
      data-variant={variant}
      data-size={size}
      data-state={dataState}
      onAnimationEnd={onAnimationEnd}
      onClick={overlaid ? (e) => e.stopPropagation() : undefined}
      className={`${styles.shell} ${surfaceClass[variant]} ${className}`}
    >
      {children}
    </div>
  );

  const node = overlaid ? (
    <div className={styles.overlay} onClick={onClose}>
      {shell}
    </div>
  ) : (
    shell
  );

  return portal ? createPortal(node, document.body) : node;
}

export default function ModalLayout({
  children,
  onClose,
  onBack,
  title,
  variant = 'menu',
  size,
  embedded = false,
  portal,
  dataState,
  onAnimationEnd,
  className,
  bodyClassName = '',
}: ModalLayoutProps) {
  const { t } = useTranslation();

  const content = (
    <div className={styles.content} data-variant={variant}>
      <header className={styles.header}>
        {onBack && (
          <Button
            variant="icon"
            type="button"
            onClick={onBack}
            aria-label={t('common.back')}
            className="modal-button back"
          >
            <BackIcon className="h-6 w-6" />
          </Button>
        )}

        {title && <h2 className={styles.title}>{title}</h2>}

        <Button
          variant="icon"
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="modal-button close"
        >
          <CloseIcon className="h-6 w-6" />
        </Button>
      </header>

      <div className={`${styles.body} ${bodyClassName}`}>{children}</div>
    </div>
  );

  if (embedded) return content;

  return (
    <ModalShell
      variant={variant}
      size={size}
      portal={portal}
      dataState={dataState}
      onAnimationEnd={onAnimationEnd}
      className={className}
      onClose={onClose}
    >
      {content}
    </ModalShell>
  );
}
