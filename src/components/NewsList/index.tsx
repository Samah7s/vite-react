import React from "react";
import { useNewsStore } from "../../store/newsStore";
import { NewsItemCard } from "../NewsItemCard";
import { NewsItem } from "../../types";
import styles from "./NewsList.module.scss";

interface NewsListProps {
  onEditItem: (item: NewsItem) => void;
}

export const NewsList: React.FC<NewsListProps> = ({ onEditItem }) => {
  const news = useNewsStore((state) => state.news);
  const isLoading = useNewsStore((state) => state.isLoading);
  const hasHydrated = useNewsStore((state) => state._hydrated);

  if (!hasHydrated) {
    return (
      <div className={styles.loading}>Loading news from local storage...</div>
    );
  }

  if (isLoading) {
    return <div className={styles.loading}>Simulating news fetch...</div>;
  }

  if (news.length === 0) {
    return <div className={styles.empty}>Now news for you {":("}</div>;
  }

  return (
    <div className={styles.listContainer}>
      {news.map((item) => (
        <NewsItemCard key={item.id} item={item} onEdit={onEditItem} />
      ))}
    </div>
  );
};
