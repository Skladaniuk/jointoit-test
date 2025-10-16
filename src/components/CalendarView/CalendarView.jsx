import React, { useRef, useState, useLayoutEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useDispatch, useSelector } from "react-redux";
import { addEvent, updateEvent, deleteEvent } from "../../features/events/eventsSlice";
import styles from "./CalendarView.module.scss";
import EventModal from "../EventModal/EventModal";

export default function CalendarView() {
  const calendarRef = useRef(null);
  const lastAnchorRef = useRef(null);
  const dispatch = useDispatch();
  const events = useSelector((s) => s.events.items);

  const [popover, setPopover] = useState(null);
  const api = () => calendarRef.current?.getApi();

  const toISODate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const clickAnchorRect = (e) =>
    e
      ? { left: e.clientX - 1, right: e.clientX + 1, top: e.clientY, bottom: e.clientY + 2, width: 2, height: 2 }
      : null;

  const domCenterRect = (el) => {
    if (!el?.getBoundingClientRect) return null;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    return { left: cx - 1, right: cx + 1, top: r.top, bottom: r.bottom, width: 2, height: r.height };
  };

  function addMinutesISO(localStartISO, minutes = 60) {
    const dt = new Date(localStartISO);
    return new Date(dt.getTime() + minutes * 60000).toISOString();
  }

  function selectHandler(info) {
    let rect = clickAnchorRect(info.jsEvent);
    if (!rect) rect = domCenterRect(document.querySelector(".fc .fc-highlight"));
    if (!rect) rect = domCenterRect(document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 20));
    if (!rect) {
      const x = window.scrollX + window.innerWidth / 2;
      const y = window.scrollY + window.innerHeight - 140;
      rect = { left: x - 1, right: x + 1, top: y, bottom: y + 2, width: 2, height: 2 };
    }
    lastAnchorRef.current = rect;

    const midY = window.scrollY + window.innerHeight / 2;
    const placement = rect.top > midY ? "top" : "bottom";

    const date = info.start ? toISODate(info.start) : info.startStr.slice(0, 10);
    const time =
      info.start && !info.allDay
        ? info.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        : "";

    setPopover({
      mode: "create",
      anchorRect: rect,
      placement,
      draft: { title: "", date, time, notes: "", color: "#3b82f6" }
    });
  }

  function eventClickHandler(clickInfo) {
    const ev = clickInfo.event;
    const rectFromEvent = () => {
      const el = clickInfo.el || clickInfo.jsEvent?.target;
      const node = el?.closest ? el.closest(".fc-event, .fc-timegrid-event, .fc-daygrid-event") : el;
      return domCenterRect(node) || clickAnchorRect(clickInfo.jsEvent);
    };
    const rect =
      rectFromEvent() || lastAnchorRef.current || { left: window.innerWidth / 2 - 1, right: window.innerWidth / 2 + 1, top: 100, bottom: 102, width: 2, height: 2 };
    lastAnchorRef.current = rect;

    const midY = window.scrollY + window.innerHeight / 2;
    const placement = rect.top > midY ? "top" : "bottom";

    const s = ev.start;
    const date = s ? toISODate(s) : "";
    const time = s && !ev.allDay ? s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) : "";
    const color = ev.backgroundColor || ev.extendedProps?.color || "#3b82f6";

    setPopover({
      mode: "edit",
      eventId: ev.id,
      anchorRect: rect,
      placement,
      draft: { title: ev.title || "", date, time, notes: ev.extendedProps?.notes || "", color }
    });
  }

  function onClose() {
    setPopover(null);
    api()?.unselect();
  }

  function onDeleteEvent(id) {
    dispatch(deleteEvent(id));
    onClose();
  }

  function saveDraft(draft) {
    const title = (draft.title || "").trim().slice(0, 30);
    const date = (draft.date || "").trim();
    const time = (draft.time || "").trim();
    const color = (draft.color || "#3b82f6").trim();
    if (!title || !date) return onClose();

    const hasTime = Boolean(time);
    const start = hasTime ? `${date}T${time}` : date;

    if (popover?.mode === "create") {
      const payload = {
        title,
        start,
        end: hasTime ? addMinutesISO(start, 60) : undefined,
        allDay: !hasTime,
        color,
        notes: draft.notes || "",
      };
      dispatch(addEvent(payload));
      onClose();
      return;
    }

    if (popover?.mode === "edit" && popover?.eventId) {
      const fc = api()?.getEventById(popover.eventId);
      let nextEnd;
      if (fc?.end && fc?.start && hasTime) {
        const dur = fc.end.getTime() - fc.start.getTime();
        if (dur > 0) nextEnd = new Date(new Date(start).getTime() + dur).toISOString();
      } else if (hasTime && !fc?.end) {
        nextEnd = addMinutesISO(start, 60);
      }
      dispatch(
        updateEvent({
          id: popover.eventId,
          title,
          start,
          end: nextEnd,
          allDay: !hasTime,
          color,
          notes: draft.notes || "",
        })
      );
      onClose();
    }
  }

  useLayoutEffect(() => {
    // коли Redux змінює events, FullCalendar отримає їх через проп нижче
    // додатково синхронізуємо розмір після перемикання вью
    api()?.updateSize();
  }, [events]);

  return (
    <div className={styles.card}>
      <div className={styles.headerLine}>
        <span className={styles.smallTitle}>Calendar View</span>
      </div>

      <div className={styles.fixedShell}>
        <div className={styles.fill}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            initialDate={new Date()}
            headerToolbar={{ left: "today prev,next", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,agendaBtn" }}
            customButtons={{
              agendaBtn: {
                text: "Agenda",
                click: () => {
                  api()?.changeView("listWeek");
                  requestAnimationFrame(() => api()?.updateSize());
                }
              }
            }}
            buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day", prev: "Back", next: "Next", listWeek: "Agenda" }}
            buttonIcons={false}
            height="auto"
            contentHeight="auto"
            handleWindowResize
            datesSet={() => api()?.updateSize()}
            selectable
            selectMirror
            editable
            expandRows
            stickyHeaderDates
            allDaySlot
            slotMinTime="00:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelFormat={{ hour: "numeric", minute: "2-digit", hour12: true }}
            dragScroll
            longPressDelay={1}
            unselectAuto={false}
            eventOrder="start,-duration,allDay,title"
            eventOrderStrict
            events={events}
            select={selectHandler}
            eventClick={eventClickHandler}
            eventDrop={({ event }) =>
              dispatch(
                updateEvent({
                  id: event.id,
                  start: event.start?.toISOString(),
                  end: event.end?.toISOString(),
                  color: event.backgroundColor
                })
              )
            }
            eventResize={({ event }) =>
              dispatch(
                updateEvent({
                  id: event.id,
                  start: event.start?.toISOString(),
                  end: event.end?.toISOString()
                })
              )
            }
            eventContent={(arg) => {
              const el = document.createElement("div");
              el.className = styles.eventChip;
              el.textContent = arg.event.title;
              const c = arg.event.backgroundColor || arg.event.extendedProps?.color;
              if (c) {
                el.style.setProperty("--event-color", c);
                el.style.borderColor = c;
              }
              return { domNodes: [el] };
            }}
          />
        </div>
      </div>

      {popover && (
        <EventModal
          mode={popover.mode}
          anchorRect={popover.anchorRect}
          placement={popover.placement}
          value={popover.draft}
          onClose={onClose}
          onSave={saveDraft}
          onDelete={() => onDeleteEvent(popover.eventId)}
        />
      )}
    </div>
  );
}
