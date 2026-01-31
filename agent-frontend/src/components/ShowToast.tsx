import { enqueueSnackbar, closeSnackbar, VariantType } from 'notistack';
import {
  CircleCheck,
  XIcon,
  OctagonAlert,
  Info,
  TriangleAlert,
} from 'lucide-react';
import { ToastVariants } from '@/enums/global.enum';

interface IShowToastOptions {
  message: string;
  variant?: VariantType;
  duration?: number;
}

export const showToast = ({
  message,
  variant = ToastVariants.INFO,
  duration = 2000,
}: IShowToastOptions): void => {
  const getIcon = () => {
    switch (variant) {
      case ToastVariants.SUCCESS:
        return (
          <CircleCheck
            strokeWidth={3}
            style={{ color: 'var(--white-default)' }}
          />
        );
      case ToastVariants.ERROR:
        return (
          <OctagonAlert
            strokeWidth={3}
            style={{ color: 'var(--white-default)' }}
          />
        );
      case ToastVariants.WARNING:
        return (
          <TriangleAlert
            strokeWidth={3}
            style={{ color: 'var(--white-default)' }}
          />
        );
      case ToastVariants.INFO:
      default:
        return (
          <Info strokeWidth={3} style={{ color: 'var(--white-default)' }} />
        );
    }
  };

  enqueueSnackbar(
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {getIcon()}
      <strong>{message}</strong>
    </div>,
    {
      variant,
      hideIconVariant: true,
      autoHideDuration: duration,
      preventDuplicate: true,
      action: (key) => (
        <button
          onClick={() => closeSnackbar(key)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <XIcon strokeWidth={3} />
        </button>
      ),
    },
  );
};
