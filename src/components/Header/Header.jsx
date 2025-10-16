import React from "react";
import styles from "./Header.module.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.searchWrap}>
        <i className={`bi bi-search ${styles.searchIcon}`} aria-hidden />
        <input
          className={styles.input}
          placeholder="Search transactions, invoices or help"
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} aria-label="Language">
          <i className="bi bi-globe2" />
        </button>

        <button className={`${styles.iconBtn} ${styles.iconBtnMuted}`} aria-label="Help">
          <i className="bi bi-question-circle" />
        </button>

        <button className={`${styles.iconBtn} ${styles.iconBtnMuted} ${styles.notify}`} aria-label="Notifications">
          <i className="bi bi-bell" />
          <span className={styles.dot} />
        </button>

        <div className={styles.user}>
          <span className={styles.name}>John Doe</span>
          <i className={`bi bi-caret-down-fill ${styles.caret}`} />
          <img className={styles.avatar} src="https://i.pravatar.cc/44?img=5" alt="user" />
        </div>
      </div>
    </header>
  );
}
