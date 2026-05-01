import { useEffect, useState } from "react";
import axios from "axios";
import ClubCard from "../components/ClubCard";

const API_BASE = "http://127.0.0.1:8000";

function ClubsPage() {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/clubs`);
        setClubs(res.data.items || []);
      } catch (error) {
        console.error("clubs 불러오기 실패:", error);
      }
    };

    fetchClubs();
  }, []);

  return (
    <main className="section">
      <div className="page-title-box">
        <h1>All Clubs</h1>
        <p>EPL 전체 구단 목록 페이지야.</p>
      </div>

      <div className="clubs-grid-react">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </main>
  );
}

export default ClubsPage;