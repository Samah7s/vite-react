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
  const isEditing = Boolean(newsItemToEdit);
  const formTitle = newsItemToEdit ? "Editing" : "Adding";

  useEffect(() => {
    if (isEditing && newsItemToEdit) {
      setTitle(newsItemToEdit.title);
      setContent(newsItemToEdit.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [newsItemToEdit, isEditing]);

  const isDisabled =
    !currentUser || (isEditing && newsItemToEdit?.authorId !== currentUser);

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
    if (isEditing && newsItemToEdit?.authorId !== currentUser) {
      alert("You cannot save changes to another user's news item.");
      return;
    }

    if (isEditing && newsItemToEdit) {
      editNews(newsItemToEdit.id, title, content);
      onFinishEditing();
    } else {
      addNews(title, content);
    }
  };

  const handleCancel = () => {
    onClose();
    if (isEditing) {
      onFinishEditing();
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <h2>{formTitle}</h2>
      {isDisabled && !currentUser && <p>Please log in to add or edit news.</p>}
      {isDisabled &&
        newsItemToEdit &&
        newsItemToEdit.authorId !== currentUser && (
          <p>You cannot edit this item.</p>
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
