import React from "react";
import { NewsItem } from "../../types";
import { useNewsStore } from "../../store/newsStore";
import styles from "./NewsItemCard.module.scss";

interface NewsItemCardProps {
  item: NewsItem;
  onEdit: (item: NewsItem) => void; 
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export const NewsItemCard: React.FC<NewsItemCardProps> = ({ item, onEdit }) => {
  const deleteNews = useNewsStore((state) => state.deleteNews);
  const currentUser = useNewsStore((state) => state.currentUser);

  const isAuthor = currentUser === item.authorId;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteNews(item.id);
    }
  };

  const handleEdit = () => {
    onEdit(item); 
  };

  return (
    <div className={styles.card}>
      <h3>{item.title}</h3>
      <p className={styles.content}>{item.content}</p>
      <div className={styles.meta}>
        <span className={styles.author}>By: {item.authorId}</span>
        <span>Posted: {formatDate(item.createdAt)}</span>
      </div>
      {isAuthor && (
        <div className={styles.actions}>
          <button onClick={handleEdit} className={styles.editButton}>
            Edit
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
