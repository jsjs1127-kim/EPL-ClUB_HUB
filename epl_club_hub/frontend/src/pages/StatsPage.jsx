import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function StatsTable({ title, items, valueKey, valueLabel }) {
  return (
    <section className="stats-board">
      <div className="stats-board-header">
        <h2>{title}</h2>
      </div>

      <div className="stats-list">
        {items.map((player, index) => (
          <div className="stats-row" key={player.id}>
            <div className="stats-rank">{index + 1}</div>

            <div className="stats-player-info">
              <div className="stats-player-name">{player.name}</div>
              <div className="stats-player-meta">
                {player.club_name} · {player.position}
              </div>
            </div>

            <div className="stats-player-value">
              <div className="stats-value">{player[valueKey]}</div>
              <div className="stats-value-label">{valueLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsPage() {
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const scorersRes = await axios.get(`${API_BASE}/api/stats/top-scorers`);
        const assistsRes = await axios.get(`${API_BASE}/api/stats/top-assists`);

        setTopScorers(scorersRes.data.items || []);
        setTopAssists(assistsRes.data.items || []);
      } catch (error) {
        console.error("stats 불러오기 실패:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="section">
      <div className="page-title-box">
        <h1>Player Stats</h1>
        <p>골 순위와 도움 순위를 한눈에 보는 페이지야.</p>
      </div>

      <div className="stats-grid">
        <StatsTable
          title="Top Scorers"
          items={topScorers}
          valueKey="goals"
          valueLabel="Goals"
        />

        <StatsTable
          title="Top Assists"
          items={topAssists}
          valueKey="assists"
          valueLabel="Assists"
        />
      </div>
    </main>
  );
}

export default StatsPage;