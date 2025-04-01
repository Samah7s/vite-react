import React, { useState, useEffect } from "react";
import { useNewsStore } from "../../store/newsStore";
import { NewsItem } from "../../types";
import styles from "./NewsForm.module.scss";

interface NewsFormProps {
  newsItemToEdit: NewsItem | null;
  onFinishEditing: () => void;
  onClose: () => void;
}

export const NewsForm: React.FC<NewsFormProps> = ({
  newsItemToEdit,
  onFinishEditing,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const addNews = useNewsStore((state) => state.addNews);
  const editNews = useNewsStore((state) => state.editNews);
  const currentUser = useNewsStore((state) => state.currentUser);
  const formTitle = newsItemToEdit ? "Editing" : "Adding";

  useEffect(() => {
    if (newsItemToEdit) {
      if (currentUser === newsItemToEdit.authorId) {
        setTitle(newsItemToEdit.title);
        setContent(newsItemToEdit.content);
      } else {
        console.warn("Attempted to edit an item not owned by current user.");
        onFinishEditing();
      }
    } else {
      setTitle("");
      setContent("");
    }
  }, [newsItemToEdit, currentUser, onFinishEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and Content cannot be empty.");
      return;
    }
    if (!currentUser) {
      alert("Please log in to submit news.");
      return;
    }

    if (newsItemToEdit) {
      editNews(newsItemToEdit.id, title, content);
      onFinishEditing();
      onClose();
    } else {
      addNews(title, content);
      setTitle("");
      setContent("");
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    onFinishEditing();
    onClose();
  };

  const isDisabled =
    !currentUser ||
    (newsItemToEdit && newsItemToEdit.authorId !== currentUser) ||
    undefined;

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2>{formTitle}</h2>
      {isDisabled && !currentUser && (
        <p style={{ color: "var(--danger-color)" }}>
          Please log in to add or edit news.
        </p>
      )}
      {isDisabled &&
        newsItemToEdit &&
        newsItemToEdit.authorId !== currentUser && (
          <p style={{ color: "var(--danger-color)" }}>
            You cannot edit this item.
          </p>
        )}

      <div className={styles.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="News Title"
          required
          disabled={isDisabled}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="News Content"
          required
          disabled={isDisabled}
        />
      </div>
      <div className={styles.buttonGroup}>
        {newsItemToEdit && (
          <button type="button" onClick={handleCancel} disabled={isDisabled}>
            Cancel Edit
          </button>
        )}
        <button type="submit" disabled={isDisabled}>
          {newsItemToEdit ? "Save Changes" : "Add News"}
        </button>
      </div>
    </form>
  );
};
