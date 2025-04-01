import { useState, useEffect, useRef } from "react";
import { useNewsStore } from "./store/newsStore";
import { NewsList } from "./components/NewsList";
import { NewsForm } from "./components/NewsForm";
import { NewsItem } from "./types";
import styles from "./App.module.scss";
// import { LoginModal } from "./components/LoginModal";
import { Modal } from "./components/Modal";
import { LoginSimulator } from "./components/LoginSimulator";

function App() {
  const [editingNewsItem, setEditingNewsItem] = useState<NewsItem | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNewsModalOpen, setNewsModalOpen] = useState(false);
  const simulateFetchNews = useNewsStore((state) => state.simulateFetchNews);
  const isHydrated = useNewsStore((state) => state._hydrated);
  const currentUser = useNewsStore((state) => state.currentUser);
  const setCurrentUser = useNewsStore((state) => state.setCurrentUser);
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
    if (!currentUser && editingNewsItem) {
      setEditingNewsItem(null);
    }
  }, [currentUser, editingNewsItem]);

  const handleEditItem = (item: NewsItem) => {
    if (currentUser === item.authorId) {
      setEditingNewsItem(item);
      setNewsModalOpen(true);
    } else {
      alert("You cannot edit another user's news item.");
    }
  };

  const handleFinishEditing = () => {
    setEditingNewsItem(null);
    setNewsModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEditingNewsItem(null);
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
              <button onClick={() => setNewsModalOpen(true)}>Add News</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsLoginModalOpen(true)}>Login</button>
            </>
          )}
        </div>
      </header>
      {/* <NewsForm
        newsItemToEdit={editingNewsItem}
        onFinishEditing={handleFinishEditing}
      /> */}

      <h2>News Feed</h2>
      <NewsList onEditItem={handleEditItem} />
      {/* <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      /> */}
      <Modal
        onClose={() => setIsLoginModalOpen(false)}
        isOpen={isLoginModalOpen}
        children={<LoginSimulator onClose={()=>setIsLoginModalOpen(false)} />}
        modalType={"Login"}
      />
      <Modal
        onClose={() => setNewsModalOpen(false)}
        isOpen={isNewsModalOpen}
        children={
          <NewsForm
            onClose={() => setNewsModalOpen(false)}
            newsItemToEdit={editingNewsItem}
            onFinishEditing={handleFinishEditing}
          />
        }
        modalType={"Add News"}
      />
    </div>
  );
}

export default App;
