import React from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  modalType,
  children,
}) => {
  if (!isOpen) {
    return null;
  }
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      onClick={onClose}
    >
      <div className={styles.modal} onClick={handleModalContentClick}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.modalContent}>
          <h2>{modalType}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};
