import React from "react";
import styles from "./Sidebar.module.scss";

const ICONS = [
  { key: "home", label: "Home", icon: "bi-house" },
  { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { key: "inbox", label: "Inbox", icon: "bi-inbox" },
  { key: "products", label: "Products", icon: "bi-box-seam" },
  { key: "invoices", label: "Invoices", icon: "bi-receipt" },
  { key: "customers", label: "Customers", icon: "bi-people" },
  { key: "chat", label: "Chat Room", icon: "bi-chat-dots" },
  { key: "calendar", label: "Calendar", icon: "bi-calendar3", active: true },
  { key: "help", label: "Help Center", icon: "bi-life-preserver", sectionTop: true },
  { key: "settings", label: "Settings", icon: "bi-gear" }
];

export default function Sidebar() {
  return (
    <aside className={styles.root}>
      <div className={styles.brandRow}>
        <span className={styles.brand}>IMPEKABLE</span>
      </div>

      <nav className={styles.nav}>
        {ICONS.map(({ key, label, icon, active, sectionTop }) => (
          <a
            key={key}
            href="#"
            className={`${styles.item} ${active ? styles.active : ""} ${sectionTop ? styles.sectionTop : ""}`}
          >
            <i className={`bi ${icon} ${styles.biIcon}`} aria-hidden="true" />
            <span className={styles.label}>{label}</span>
            {active && <span className={styles.activeBar} aria-hidden />}
          </a>
        ))}
      </nav>
    </aside>
  );
}
