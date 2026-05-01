import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClubCommunityPage from "./pages/ClubCommunityPage";
import ClubCommunityWritePage from "./pages/ClubCommunityWritePage";

import HomePage from "./pages/HomePage";
import ClubsPage from "./pages/ClubsPage";
import ClubDetailPage from "./pages/ClubDetailPage";
import StatsPage from "./pages/StatsPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import LoginPage from "./pages/LoginPage";
import NewsEditPage from "./pages/NewsEditPage";
import SignupPage from "./pages/SignupPage";
import NewsSubmitPage from "./pages/NewsSubmitPage";
import ComingSoonPage from "./pages/ComingSoonPage";

function App() {
  return (
    <div className="page">
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:newsId" element={<NewsDetailPage />} />
        <Route path="/news/submit" element={<NewsSubmitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/news/:newsId/edit" element={<NewsEditPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/clubs/:clubId/community" element={<ClubCommunityPage />} />
<Route path="/clubs/:clubId/community/write" element={<ClubCommunityWritePage />} />

        <Route path="/fixtures" element={<ComingSoonPage title="경기" />} />
        <Route path="/table" element={<ComingSoonPage title="순위" />} />
        <Route path="/injuries" element={<ComingSoonPage title="부상" />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;