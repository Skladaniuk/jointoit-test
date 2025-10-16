import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { HexColorPicker } from "react-colorful";
import styles from "./EventModal.module.scss";

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function EventModal({
  mode = "create",
  anchorRect,
  placement = "bottom",
  onClose,
  onSave,
  onDelete,
  value
}) {
  const wrapRef = useRef(null);
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const [draft, setDraft] = useState(() => ({
    title: value?.title || "",
    date: value?.date || todayISO(),
    time: value?.time || "",
    notes: value?.notes || "",
    color: value?.color || "#3b82f6"
  }));

  const isEdit = mode === "edit";
  const [popupH, setPopupH] = useState(360);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // CLICK (не mousedown) + capture: не конфликтует с кнопками внутри
  useEffect(() => {
    function onDoc(e) {
      const inside = wrapRef.current?.contains(e.target);
      const inPicker = e.target.closest?.(".flatpickr-calendar, .react-colorful");
      const inEvent = e.target.closest?.(".fc-event");
      const inClose = e.target.closest?.(`.${styles.close}`);
      if (!inside && !inPicker && !inEvent && !inClose) onClose?.();
    }
    document.addEventListener("click", onDoc, true);
    return () => document.removeEventListener("click", onDoc, true);
  }, [onClose]);

  useEffect(() => {
    const datePicker = flatpickr(dateInputRef.current, {
      dateFormat: "Y-m-d",
      defaultDate: draft.date || todayISO(),
      allowInput: true,
      onChange: (sel) => {
        const d = sel?.[0];
        const m = d ? String(d.getMonth() + 1).padStart(2, "0") : undefined;
        const day = d ? String(d.getDate()).padStart(2, "0") : undefined;
        setDraft((s) => ({ ...s, date: d ? `${d.getFullYear()}-${m}-${day}` : todayISO() }));
      }
    });

    const timePicker = flatpickr(timeInputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: false,
      allowInput: true,
      onChange: (_sel, str) => setDraft((s) => ({ ...s, time: str }))
    });

    return () => {
      datePicker.destroy();
      timePicker.destroy();
    };
  }, []);

  function computePosition(h) {
    const pad = 12;
    const vb = window.innerHeight - pad;
    const r = anchorRect || { top: window.innerHeight / 2, bottom: window.innerHeight / 2, left: window.innerWidth / 2, width: 0 };
    let top = placement === "top" ? r.top - 10 - h : r.bottom + 10;
    if (placement !== "top" && top + h > vb) top = r.top - 10 - h;
    top = Math.min(Math.max(top, pad), Math.max(pad, vb - h));
    const centerX = r.left + r.width / 2;
    const left = Math.min(Math.max(centerX, 160), window.innerWidth - 160);
    setPos({ top, left });
  }

  useLayoutEffect(() => {
    computePosition(popupH);
    requestAnimationFrame(() => {
      const h = wrapRef.current?.getBoundingClientRect?.().height || popupH;
      if (Math.abs(h - popupH) > 2) {
        setPopupH(h);
        computePosition(h);
      }
    });
  }, [anchorRect, placement, popupH]);

  function submit(e) {
    e.preventDefault();
    onSave?.(draft);
  }

  const presets = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

  return (
    <div
      className={`${styles.wrapper} ${isEdit ? styles.viewMode : ""}`}
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", width: 220, zIndex: 3000, maxHeight: "80vh", overflow: "auto" }}
      ref={wrapRef}
    >
      <span className={styles.arrow} />
      <button
        className={styles.close}
        onClick={onClose} 
        aria-label="Close"
        type="button"
      >
        <i className="bi bi-x-lg" />
      </button>

      <form className={styles.form} onSubmit={submit}>
        <label className={`${styles.field} ${isEdit ? styles.fieldView : ""}`}>
          <input
            className={isEdit ? styles.inputView : ""}
            name="title"
            placeholder={isEdit ? "Interview in Join.To.IT" : "event name"}
            value={draft.title}
            onChange={(e) => setDraft((s) => ({ ...s, title: e.target.value }))}
            maxLength={30}
          />
        </label>

        <label className={`${styles.fieldIcon} ${isEdit ? styles.fieldView : ""}`}>
          <input
            className={isEdit ? styles.inputView : ""}
            ref={dateInputRef}
            name="date"
            placeholder={isEdit ? "02/01/2019" : "event date"}
            value={draft.date}
            onChange={(e) => setDraft((s) => ({ ...s, date: e.target.value }))}
          />
          <i className="bi bi-calendar3" />
        </label>

        <label className={`${styles.fieldIcon} ${isEdit ? styles.fieldView : ""}`}>
          <input
            className={isEdit ? styles.inputView : ""}
            ref={timeInputRef}
            name="time"
            placeholder="event time"
            value={draft.time}
            onChange={(e) => setDraft((s) => ({ ...s, time: e.target.value }))}
          />
          <i className="bi bi-clock" />
        </label>

        <label className={`${styles.field} ${styles.fieldColor}`}>
          <div className={styles.colorHeader}>
            <span className={styles.colorLabel}>Color</span>
            <span className={styles.colorSwatch} style={{ background: draft.color }} />
          </div>
          <div className={styles.presets}>
            {presets.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.preset} ${draft.color === c ? styles.presetActive : ""}`}
                style={{ background: c }}
                onClick={() => setDraft((s) => ({ ...s, color: c }))}
                aria-label={`Pick ${c}`}
              />
            ))}
          </div>
        </label>

        <label className={`${styles.field} ${isEdit ? styles.fieldView : ""}`}>
          <input
            className={isEdit ? styles.inputViewItalic : ""}
            name="notes"
            placeholder={isEdit ? "take my PC with me" : "notes"}
            value={draft.notes}
            onChange={(e) => setDraft((s) => ({ ...s, notes: e.target.value }))}
          />
        </label>

        <div className={styles.colorPanel}>
          <HexColorPicker color={draft.color} onChange={(c) => setDraft((s) => ({ ...s, color: c }))} />
        </div>

        <div className={styles.actions}>
          {isEdit ? (
            <>
              <button type="button" className={styles.delete} onClick={() => { if (confirm("Delete this event?")) onDelete?.(); }}>
                DELETE
              </button>
              <button type="button" className={styles.discard} onClick={onClose}>
                DISCARD
              </button>
              <button type="submit" className={styles.edit}>
                EDIT
              </button>
            </>
          ) : (
            <>
              <button type="button" className={styles.cancel} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.save}>
                Save
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
