import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import MedicalRecords from "./pages/MedicalRecordPage.jsx";

const useRouter = () => {
  // Initialize with the current pathname instead of '/'
  const [route, setRoute] = useState(window.location.pathname);
  const [state, setState] = useState(null);

  useEffect(() => {
    const handlePopState = (e) => {
      setRoute(window.location.pathname);
      setState(e.state);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path, options = {}) => {
    window.history.pushState(options.state || null, "", path);
    setRoute(path);
    if (options.state) setState(options.state);
  };

  return { route, state, navigate };
};

const App = () => {
  const { route, state, navigate } = useRouter();

  // Pages that should show the sidebar
  const pagesWithSidebar = ["/dashboard", "/search", "/medical-records"];
  const showSidebar = pagesWithSidebar.includes(route);

  // Render the appropriate page content
  const renderPage = () => {
    switch (route) {
      case "/dashboard":
        return <Dashboard navigate={navigate} />;
      case "/medical-records":
        return <MedicalRecords />;
      default:
        return null;
    }
  };

  // If login or signup, render without sidebar
  if (route === "/login") {
    return (
      <div className="app">
        <Login navigate={navigate} />
      </div>
    );
  }

  if (route === "/signup") {
    return (
      <div className="app">
        <Signup navigate={navigate} />
      </div>
    );
  }

  // For pages with sidebar, use the layout
  if (showSidebar) {
    return (
      <div className="app-layout">
        <Sidebar currentPage={route} onNavigate={navigate} />
        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    );
  }

  // Fallback for any other routes
  return (
    <div className="app">
      <div>Page not found</div>
    </div>
  );
};

export default App;