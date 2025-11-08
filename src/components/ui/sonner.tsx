// Native toast implementation without external dependencies
import * as React from "react";

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

let toastId = 0;

const toastContainer = (() => {
  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
  }
  return null;
})();

export function toast(props: ToastProps | string) {
  const options = typeof props === 'string' ? { message: props } : props;
  const { message, type = 'info', duration = 3000 } = options;
  
  if (!toastContainer) return;
  
  const id = `toast-${toastId++}`;
  const toastEl = document.createElement('div');
  toastEl.id = id;
  toastEl.style.cssText = `
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    animation: slideIn 0.3s ease-out;
    max-width: 400px;
  `;
  toastEl.textContent = message;
  
  toastContainer.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toastContainer.removeChild(toastEl);
    }, 300);
  }, duration);
}

toast.success = (message: string) => toast({ message, type: 'success' });
toast.error = (message: string) => toast({ message, type: 'error' });
toast.info = (message: string) => toast({ message, type: 'info' });

const Toaster = () => {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};

export { Toaster };
