import React from "react";
import { useNewsStore } from "../../store/newsStore";
import styles from "./LoginSimulator.module.scss";

const USER_1_ID = "user-Peter-123";
const USER_2_ID = "user-Jonah-456";
const USER_3_ID = "user-DeadMan-789";

export const LoginSimulator: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const setCurrentUser = useNewsStore((state) => state.setCurrentUser);

  const handleLogin = (userId: string) => {
    setCurrentUser(userId);
    onClose();
  };

  return (
    <div className={styles.loginContainer}>
      <p>User Login:</p>
      <div className={styles.loginButtons}>
        <button onClick={() => handleLogin(USER_1_ID)}>
          Login as Peter P.
        </button>
        <button onClick={() => handleLogin(USER_2_ID)}>
          Login as J. Jonah Jameson
        </button>
        <button onClick={() => handleLogin(USER_3_ID)}>Login as Uncle</button>
      </div>
    </div>
  );
};
