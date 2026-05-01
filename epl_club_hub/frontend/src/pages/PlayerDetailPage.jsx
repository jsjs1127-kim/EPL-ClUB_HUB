import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

function PlayerDetailPage() {
  const { playerId } = useParams();

  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/players/${playerId}`);
        setPlayer(res.data.player || null);
      } catch (error) {
        console.error("player detail 불러오기 실패:", error);
      }
    };

    fetchPlayer();
  }, [playerId]);

  if (!player) {
    return (
      <main className="section">
        <div className="page-title-box">
          <h1>선수 정보를 불러오는 중...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="player-detail-react">
        <div className="player-detail-left-react">
          <img
            className="player-detail-image-react"
            src={
              player.image_url
                ? player.image_url
                : "https://placehold.co/320x420?text=No+Image"
            }
            alt={player.name}
          />
        </div>

        <div className="player-detail-right-react">
          <span className="position">{player.position}</span>
          <h1 className="player-detail-title-react">{player.name}</h1>
          <p className="player-detail-meta-react">
            {player.club_name} · {player.nationality} · {player.age}세 · 등번호 {player.number}
          </p>

          <div className="player-detail-stats-react">
            <div className="detail-stat-box-react">
              <div className="detail-stat-label-react">출전</div>
              <div className="detail-stat-value-react">{player.appearances}</div>
            </div>

            <div className="detail-stat-box-react">
              <div className="detail-stat-label-react">골</div>
              <div className="detail-stat-value-react">{player.goals}</div>
            </div>

            <div className="detail-stat-box-react">
              <div className="detail-stat-label-react">도움</div>
              <div className="detail-stat-value-react">{player.assists}</div>
            </div>

            <div className="detail-stat-box-react">
              <div className="detail-stat-label-react">클린시트</div>
              <div className="detail-stat-value-react">{player.clean_sheets}</div>
            </div>
          </div>

          <div className="player-detail-actions-react">
            <Link to={`/clubs/${player.club_id}`} className="detail-btn-react">
              소속 구단 보기
            </Link>
            <Link to="/" className="detail-btn-react secondary">
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PlayerDetailPage;