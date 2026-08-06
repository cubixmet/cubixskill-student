import { AlertTriangle, Trash2, Info, ShieldAlert } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'primary';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const icons = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-sky-600" />,
    primary: <ShieldAlert className="w-6 h-6 text-[var(--theme-primary,#2563EB)]" />,
  };

  const iconBgs = {
    danger: 'bg-rose-50 border-rose-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-sky-50 border-sky-200',
    primary: 'bg-[var(--theme-primary-soft,#EFF6FF)] border-[var(--theme-primary,#2563EB)]/30',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'secondary' as const,
    info: 'primary' as const,
    primary: 'primary' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${iconBgs[variant]}`}>
            {icons[variant]}
          </div>
          <div className="space-y-1 min-w-0 pt-0.5">
            <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
            <div className="text-xs text-slate-500 font-normal leading-relaxed">{description}</div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className="font-semibold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
