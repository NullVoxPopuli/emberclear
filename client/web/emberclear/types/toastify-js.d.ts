interface ToastifyToast {
  showToast(): void;
  hideToast(): void;
  toastElement: HTMLElement;
}

interface ToastifyOptions {
  text: string;
  duration?: 3000;
  destination?: string;
  newWindow?: boolean;
  close?: boolean;
  gravity?: 'top' | 'bottom';
  position?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  className?: string;
  stopOnFocus?: boolean;
  onClick?: () => void;
}

export default function Toastify(options: ToastifyOptions): ToastifyToast;
