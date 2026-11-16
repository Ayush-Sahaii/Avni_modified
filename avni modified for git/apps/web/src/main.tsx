import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { HomePage } from "./pages/HomePage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { GamesPage } from "./pages/GamesPage";
import { CommandsPage } from "./pages/CommandsPage";
import { SetupPage } from "./pages/SetupPage";
import { LegalPage } from "./pages/LegalPage";
import { MiniApp } from "./mini/MiniApp";
import { DesignGuide } from "./pages/DesignGuide";
import { NotFound } from "./pages/NotFound";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/commands" element={<CommandsPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/design" element={<DesignGuide />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/app/*" element={<MiniApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
