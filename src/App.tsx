import { useState, useEffect, useRef } from "react";
import { useNewsStore } from "./store/newsStore";
import { NewsList } from "./components/NewsList";
import { NewsForm } from "./components/NewsForm";
import { NewsItem } from "./types";
import styles from "./App.module.scss";
import { Modal } from "./components/Modal";
import { LoginSimulator } from "./components/LoginSimulator";

function App() {
  const [editingNewsItem, setEditingNewsItem] = useState<NewsItem | null>(null);

  const simulateFetchNews = useNewsStore((state) => state.simulateFetchNews);
  const isHydrated = useNewsStore((state) => state._hydrated);
  const currentUser = useNewsStore((state) => state.currentUser);
  const setCurrentUser = useNewsStore((state) => state.setCurrentUser);
  const activeModal = useNewsStore((state) => state.activeModal);
  const openModal = useNewsStore((state) => state.openModal);
  const closeModal = useNewsStore((state) => state.closeModal);
  const didSimulateFetch = useRef(false);

  useEffect(() => {
    if (isHydrated && !didSimulateFetch.current) {
      const currentNewsCount = useNewsStore.getState().news.length;

      if (currentNewsCount === 0) {
        simulateFetchNews();
      } else {
        console.log(
          "Hydration complete, news already present in local storage."
        );
      }
      didSimulateFetch.current = true;
    }
  }, [isHydrated, simulateFetchNews]);

  useEffect(() => {
    if (!currentUser) {
      if (activeModal === "news") {
        closeModal();
      }
    }
  }, [currentUser, activeModal, closeModal]);

  const handleEditItem = (item: NewsItem) => {
    if (currentUser === item.authorId) {
      setEditingNewsItem(item);
      openModal("news");
    } else {
      alert("You cannot edit another user's news item.");
    }
  };

  const handleFinishEditing = () => {
    setEditingNewsItem(null);
  };

  const handleAddNewsClick = () => {
    setEditingNewsItem(null);
    openModal("news");
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCloseModal = () => {
    const modalTypeBeingClosed = activeModal;
    closeModal();
    if (modalTypeBeingClosed === "news") {
      setEditingNewsItem(null);
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>The Daily Bugle</h1>
        <div className={styles.authControls}>
          {currentUser ? (
            <>
              <span className="userInfo">
                Logged in as: {currentUser.split("-")[1]}
              </span>
              <button onClick={handleAddNewsClick}>Add News</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => openModal("login")}>Login</button>
            </>
          )}
        </div>
      </header>
      <h2>News Feed</h2>
      <NewsList onEditItem={handleEditItem} />
      {activeModal === "login" && (
        <Modal onClose={handleCloseModal} isOpen={true} modalType={"Login"}>
          <LoginSimulator onClose={handleCloseModal} />
        </Modal>
      )}

      {activeModal === "news" && (
        <Modal
          onClose={handleCloseModal}
          isOpen={true}
          modalType={editingNewsItem ? "Edit News" : "Add News"}
        >
          <NewsForm
            onClose={handleCloseModal}
            newsItemToEdit={editingNewsItem}
            onFinishEditing={handleFinishEditing}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
