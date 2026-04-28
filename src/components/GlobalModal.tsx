// src/components/GlobalModal.tsx
import { useEffect, useRef, useState } from "react";

export interface ModalOptions {
  title?: string;
  content?: React.ReactNode;
  size?: "small" | "medium" | "large" | "full";
  showClose?: boolean;
  closeOnOverlay?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
    autoClose?: boolean;
  }>;
  onClose?: () => void;
}

interface ModalState extends ModalOptions {
  isOpen: boolean;
}

// Global modal instance
let modalRef: {
  open: (options: ModalOptions) => void;
  close: () => void;
  update: (options: Partial<ModalOptions>) => void;
} | null = null;

export const modal = {
  open: (options: ModalOptions) => {
    if (modalRef) {
      modalRef.open(options);
    } else {
      console.warn("Modal not mounted yet");
    }
  },
  close: () => {
    if (modalRef) {
      modalRef.close();
    }
  },
  update: (options: Partial<ModalOptions>) => {
    if (modalRef) {
      modalRef.update(options);
    }
  },
  alert: (message: string, title?: string) => {
    modal.open({
      title: title || "Alert",
      content: <p>{message}</p>,
      showClose: true,
      actions: [{ label: "OK", onClick: () => modal.close(), variant: "primary", autoClose: true }],
    });
  },
  confirm: (message: string, onConfirm: () => void, title?: string) => {
    modal.open({
      title: title || "Confirm",
      content: <p>{message}</p>,
      showClose: true,
      actions: [
        { label: "Cancel", onClick: () => modal.close(), variant: "secondary", autoClose: true },
        { label: "Confirm", onClick: onConfirm, variant: "primary", autoClose: true },
      ],
    });
  },
};

export function GlobalModal() {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    title: "",
    content: null,
    size: "medium",
    showClose: true,
    closeOnOverlay: true,
    actions: [],
  });
  const modalRefInternal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef = {
      open: (options: ModalOptions) => {
        setState({
          isOpen: true,
          title: options.title,
          content: options.content,
          size: options.size || "medium",
          showClose: options.showClose !== false,
          closeOnOverlay: options.closeOnOverlay !== false,
          actions: options.actions || [],
          onClose: options.onClose,
        });
      },
      close: () => {
        if (state.onClose) {
          state.onClose();
        }
        setState((prev) => ({ ...prev, isOpen: false }));
      },
      update: (options: Partial<ModalOptions>) => {
        setState((prev) => ({ ...prev, ...options }));
      },
    };

    return () => {
      modalRef = null;
    };
  }, [state.onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (state.closeOnOverlay && e.target === e.currentTarget) {
      modal.close();
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && state.closeOnOverlay && state.isOpen) {
      modal.close();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.closeOnOverlay, state.isOpen]);

  if (!state.isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    full: "max-w-4xl w-[90%]",
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRefInternal}
        className={`modal-container ${sizeClasses[state.size || "medium"]}`}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Header */}
        {(state.title || state.showClose) && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {state.title && (
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>{state.title}</h3>
            )}
            {state.showClose && (
              <button
                onClick={() => modal.close()}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "8px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>{state.content}</div>

        {/* Footer Actions */}
        {state.actions && state.actions.length > 0 && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            {state.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (action.onClick) action.onClick();
                  if (action.autoClose !== false) modal.close();
                }}
                className={`btn-${action.variant || "primary"}`}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: action.variant === "secondary" ? "1px solid #d1d5db" : "none",
                  backgroundColor:
                    action.variant === "danger"
                      ? "#dc2626"
                      : action.variant === "secondary"
                      ? "white"
                      : "#2c3e50",
                  color:
                    action.variant === "secondary" ? "#374151" : action.variant === "danger" ? "white" : "white",
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}