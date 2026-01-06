"use client";

/**
 * Reusable Confirmation Modal
 *
 * Replaces native confirm() dialogs with a proper modal that has:
 * - Proper accessibility (focus trap, ARIA attributes)
 * - Keyboard navigation (Enter to confirm, Escape to cancel)
 * - Custom styling variants (danger, warning, info)
 * - Support for async operations
 *
 * @example
 * ```tsx
 * const [showConfirm, setShowConfirm] = useState(false);
 *
 * <ConfirmationModal
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={async () => {
 *     await deleteData();
 *     setShowConfirm(false);
 *   }}
 *   title="Delete All Data"
 *   message="Are you sure? This cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 *   cancelText="Cancel"
 * />
 * ```
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close (Cancel or X button) */
  onClose: () => void;
  /** Callback when user confirms (can be async) */
  onConfirm: () => void | Promise<void>;
  /** Modal title */
  title: string;
  /** Main message to display */
  message: string;
  /** Optional additional details or warning text */
  details?: string;
  /** Visual variant that determines styling and icon */
  variant?: "danger" | "warning" | "info";
  /** Text for confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for cancel button (default: "Cancel") */
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details,
  variant = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Variant styling configuration
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-400",
      iconBg: "bg-red-900/30",
      borderColor: "border-red-500/50",
      confirmBg: "bg-red-600 hover:bg-red-700",
      confirmText: "text-white",
    },
    warning: {
      icon: AlertCircle,
      iconColor: "text-yellow-400",
      iconBg: "bg-yellow-900/30",
      borderColor: "border-yellow-500/50",
      confirmBg: "bg-yellow-600 hover:bg-yellow-700",
      confirmText: "text-gray-900",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-900/30",
      borderColor: "border-blue-500/50",
      confirmBg: "bg-blue-600 hover:bg-blue-700",
      confirmText: "text-white",
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  // Handle confirm with async support
  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm]);

  // Focus trap: cycle focus between cancel and confirm buttons
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape" && !isProcessing) {
        onClose();
        return;
      }

      // Confirm on Enter
      if (e.key === "Enter" && !isProcessing) {
        e.preventDefault();
        handleConfirm();
        return;
      }

      // Tab navigation (focus trap)
      if (e.key === "Tab") {
        e.preventDefault();
        const focusableElements = [cancelButtonRef.current, confirmButtonRef.current];
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
          : (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose, handleConfirm]);

  // Auto-focus cancel button when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={!isProcessing ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-message"
    >
      <div
        ref={modalRef}
        className={`relative bg-gray-900 border ${config.borderColor} rounded-lg shadow-2xl max-w-md w-full mx-4 p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`inline-flex p-3 rounded-full ${config.iconBg} mb-4`}>
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h2
          id="confirmation-modal-title"
          className="text-xl font-display font-bold text-white mb-3"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirmation-modal-message"
          className="text-gray-300 mb-2"
        >
          {message}
        </p>

        {/* Optional details */}
        {details && (
          <p className="text-sm text-gray-400 mb-4 bg-gray-800/50 p-3 rounded border-l-2 border-gray-700">
            {details}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2 ${config.confirmBg} ${config.confirmText} rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait`}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
