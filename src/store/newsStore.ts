import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { NewsItem, User } from "../types";

const getThreeDaysAgo = (): number => {
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return Date.now() - threeDays;
};

const generateMockNews = (count: number = 3): NewsItem[] => {
  const news: NewsItem[] = [];
  const users = ["user-b", "user-a"];
  const now = Date.now();
  const fourDaysAgo = now - 4 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const isOld = Math.random() > 0.6;
    const createdAt = isOld
      ? fourDaysAgo + Math.random() * 1000 * 60 * 60 * 20
      : now - Math.random() * 1000 * 60 * 60 * 60;

    news.push({
      id: uuidv4(),
      title: `Simulated News ${i + 1} (${isOld ? "Old" : "Recent"})`,
      content: `This is fake content for news item ${
        i + 1
      }. Timestamp: ${new Date(createdAt).toLocaleString()}`,
      createdAt: createdAt,
      authorId: users[Math.floor(Math.random() * users.length)],
    });
  }
  return news;
};

interface NewsState {
  news: NewsItem[];
  currentUser: User;
  isLoading: boolean;
  setCurrentUser: (userId: User) => void;
  addNews: (title: string, content: string) => void;
  editNews: (id: string, title: string, content: string) => void;
  deleteNews: (id: string) => void;
  cutAndSortNews: (items: NewsItem[]) => NewsItem[];
  simulateFetchNews: () => Promise<void>;
  _hydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      news: [],
      currentUser: null,
      isLoading: false,
      _hydrated: false,
      setHasHydrated: (state) => {
        set({
          _hydrated: state,
        });
      },
      setCurrentUser: (userId) => set({ currentUser: userId }),
      cutAndSortNews: (items) => {
        const threeDaysAgo = getThreeDaysAgo();
        return items
          .filter((item) => item.createdAt >= threeDaysAgo)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
      addNews: (title, content) => {
        const currentUser = get().currentUser;
        if (!currentUser) {
          console.warn("Cannot add news: No user logged in.");
          alert('Please "log in" first to add news.');
          return;
        }
        const newItem: NewsItem = {
          id: uuidv4(),
          title,
          content,
          createdAt: Date.now(),
          authorId: currentUser,
        };
        set((state) => ({
          news: state.cutAndSortNews([newItem, ...state.news]),
        }));
      },

      editNews: (id, title, content) => {
        const currentUser = get().currentUser;
        set((state) => {
          const newsToEdit = state.news.find((item) => item.id === id);
          if (newsToEdit?.authorId !== currentUser) {
            console.warn(
              `User ${currentUser} cannot edit news item ${id} created by ${newsToEdit?.authorId}`
            );
            alert("You can only edit your own news items.");
            return {};
          }
          const updatedNews = state.news.map((item) =>
            item.id === id ? { ...item, title, content } : item
          );
          return { news: state.cutAndSortNews(updatedNews) };
        });
      },

      deleteNews: (id) => {
        const currentUser = get().currentUser;
        set((state) => {
          const newsToDelete = state.news.find((item) => item.id === id);
          if (!newsToDelete) return {};

          if (newsToDelete.authorId !== currentUser) {
            console.warn(
              `User ${currentUser} cannot delete news item ${id} created by ${newsToDelete.authorId}`
            );
            alert("You can only delete your own news items.");
            return {};
          }
          const filteredNews = state.news.filter((item) => item.id !== id);
          return { news: state.cutAndSortNews(filteredNews) };
        });
      },

      simulateFetchNews: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));

        const fetchedNews = generateMockNews(9);
        const currentNews = get().news;

        const combinedNewsMap = new Map<string, NewsItem>();
        [...currentNews, ...fetchedNews].forEach((item) => {
          const existing = combinedNewsMap.get(item.id);
          if (!existing || item.createdAt > existing.createdAt) {
            combinedNewsMap.set(item.id, item);
          }
        });

        const combinedNews = Array.from(combinedNewsMap.values());
        const finalNews = get().cutAndSortNews(combinedNews);

        set({ news: finalNews, isLoading: false });
        console.log("Simulation completed. News updated and pruned.");
      },
    }),
    {
      name: "news-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        news: state.news,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => {
        console.log("Hydration starting");
        return (state, error) => {
          if (error) {
            console.error("An error happened during hydration", error);
          } else {
            state?.setHasHydrated(true);
            if (state) {
              const cutted = state.cutAndSortNews(state.news);
              if (cutted.length !== state.news.length) {
                console.log("Cutted old news on hydration.");
                state.news = cutted;
              }
            }
          }
        };
      },
    }
  )
);
