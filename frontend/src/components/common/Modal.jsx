import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  overlayClassName = "",
  ...props
}) => {
  const modalRef = useRef(null);

  const sizes = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm",
        overlayClassName,
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={twMerge(
          "relative w-full rounded-lg shadow-xl transform transition-all",
          sizes[size],
          className,
        )}
        style={{
          backgroundColor: "var(--color-surface-primary)",
          color: "var(--color-text-primary)",
        }}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  color: "var(--color-text-tertiary)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor =
                    "var(--color-background-secondary)";
                  e.target.style.color = "var(--color-text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--color-text-tertiary)";
                }}
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className="px-6 py-4"
          style={{ backgroundColor: "var(--color-surface-primary)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Footer component for consistent footer styling
export const ModalFooter = ({ children, className = "", ...props }) => (
  <div
    className={twMerge(
      "flex items-center justify-end gap-3 px-6 py-4 border-t rounded-b-lg",
      className,
    )}
    style={{
      borderTopColor: "var(--color-border-primary)",
      backgroundColor: "var(--color-background-secondary)",
    }}
    {...props}
  >
    {children}
  </div>
);

// Modal Header component for custom header content
export const ModalHeader = ({ children, className = "", ...props }) => (
  <div
    className={twMerge("px-6 py-4 border-b", className)}
    style={{
      borderBottomColor: "var(--color-border-primary)",
    }}
    {...props}
  >
    {children}
  </div>
);

// Modal Body component for custom body content
export const ModalBody = ({ children, className = "", ...props }) => (
  <div className={twMerge("px-6 py-4", className)} {...props}>
    {children}
  </div>
);

export default Modal;
