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
        console.log("Hydration complete, calling simulated fetch.");
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
      console.log("Effect [currentUser]: User logged out.");

      if (activeModal === "news") {
        console.log("Effect [currentUser]: Closing news modal due to logout.");
        closeModal();
      }

    }
  }, [currentUser, activeModal, closeModal]); 

  const handleEditItem = (item: NewsItem) => {
    if (currentUser === item.authorId) {
      console.log("handleEditItem: Setting item and opening modal", item.id);
      setEditingNewsItem(item); 
      openModal("news"); 
    } else {
      alert("You cannot edit another user's news item.");
    }
  };

  const handleFinishEditing = () => {
    console.log("handleFinishEditing called (Resetting item state)");
    setEditingNewsItem(null);
  };

  const handleAddNewsClick = () => {
    console.log(
      "handleAddNewsClick called (Resetting item state if any, opening modal)"
    );
    setEditingNewsItem(null); 
    openModal("news");
  };

  const handleLogout = () => {
    console.log("handleLogout called");
    setCurrentUser(null); 
  };

  const handleCloseModal = () => {
    const modalTypeBeingClosed = activeModal;
    console.log(
      "handleCloseModal called for modal type:",
      modalTypeBeingClosed
    );

    closeModal(); 

    if (modalTypeBeingClosed === "news") {
      console.log(
        "handleCloseModal: Resetting edit item because news modal closed."
      );
      setEditingNewsItem(null);
    }
  };

  console.log(
    "App RENDER, currentUser:",
    currentUser,
    "activeModal:",
    activeModal,
    "editingNewsItem:",
    editingNewsItem
  );
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
        <Modal
          onClose={handleCloseModal}
          isOpen={true} 
          modalType={"Login"}
        >
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
