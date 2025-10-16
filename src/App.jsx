import React from "react";
import CalendarView from "./components/CalendarView/CalendarView";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.scss";

export default function App() {
  return (
    <div className="appRoot">
      <Sidebar />
      <div className="rightColumn">
        <Header />
        <main className="mainContent">
          <CalendarView />
        </main>
      </div>
    </div>
  );
}
