import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

const NEXT_MATCHES_MOCK = {
  Arsenal: {
    competition: "Premier League",
    opponent: "Chelsea",
    date: "2026-04-27 20:30",
    venue: "Home",
  },
  Liverpool: {
    competition: "Premier League",
    opponent: "Tottenham Hotspur",
    date: "2026-04-28 21:00",
    venue: "Home",
  },
  "Manchester City": {
    competition: "Premier League",
    opponent: "Brighton & Hove Albion",
    date: "2026-04-29 20:30",
    venue: "Away",
  },
  "Tottenham Hotspur": {
    competition: "Premier League",
    opponent: "Liverpool",
    date: "2026-04-28 21:00",
    venue: "Away",
  },
};

function RankingMiniBoard({ title, items, valueKey, valueLabel }) {
  return (
    <section className="club-sub-card">
      <div className="home-card-header">
        <h3>{title}</h3>
      </div>

      <div className="mini-ranking-list">
        {items.length > 0 ? (
          items.map((player, index) => (
            <div className="mini-ranking-row" key={player.id}>
              <div className="mini-rank">{index + 1}</div>

              <div className="mini-player-info">
                <div className="mini-player-name">{player.name}</div>
                <div className="mini-player-meta">
                  {player.position} · 등번호 {player.number}
                </div>
              </div>

              <div className="mini-player-value">
                {player[valueKey]} {valueLabel}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-note">아직 데이터가 없어.</div>
        )}
      </div>
    </section>
  );
}

function ClubDetailPage() {
  const { clubId } = useParams();

  const [club, setClub] = useState(null);
  const [players, setPlayers] = useState([]);
  const [clubPosts, setClubPosts] = useState([]);

  const [user, setUser] = useState(null);
  const [favorite, setFavorite] = useState(null);
  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        const [clubRes, postsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/clubs/${clubId}`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/community/posts`, {
            params: { board_type: "club", club_id: clubId },
            withCredentials: true,
          }),
        ]);

        setClub(clubRes.data.club || null);
        setPlayers(clubRes.data.players || []);
        setClubPosts((postsRes.data.items || []).slice(0, 5));
      } catch (error) {
        console.error("club detail 불러오기 실패:", error);
      }
    };

    const fetchUserAndFavorite = async () => {
      try {
        const meRes = await axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true,
        });

        const currentUser = meRes.data.user || null;
        setUser(currentUser);

        if (currentUser) {
          const favRes = await axios.get(`${API_BASE}/api/favorites/team`, {
            withCredentials: true,
          });
          setFavorite(favRes.data.item || null);
        } else {
          setFavorite(null);
        }
      } catch (error) {
        setUser(null);
        setFavorite(null);
      }
    };

    fetchClubDetail();
    fetchUserAndFavorite();
  }, [clubId]);

  const handleSaveFavorite = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/favorites/team`,
        { club_id: clubId },
        { withCredentials: true }
      );

      setFavorite({ club_id: clubId, club_name: club?.name || "" });
      setFavoriteMessage("응원팀으로 저장했어.");
    } catch (error) {
      alert(error.response?.data?.detail || "응원팀 저장 실패");
    }
  };

  if (!club) {
    return (
      <main className="section">
        <div className="page-title-box">
          <h1>구단 정보를 불러오는 중...</h1>
        </div>
      </main>
    );
  }

  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const topAssists = [...players]
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  const nextMatch = NEXT_MATCHES_MOCK[club.name] || {
    competition: "Premier League",
    opponent: "Opponent TBD",
    date: "일정 준비 중",
    venue: "TBD",
  };

  const clubNewsMock = [
    `${club.name} 관련 주요 기사 자리 1`,
    `${club.name} 최근 이슈 기사 자리 2`,
    `${club.name} 경기 프리뷰 기사 자리 3`,
  ];

  const isFavorite = favorite?.club_id === club.id;

  return (
    <main className="section">
      <section className="club-detail-hero-react">
        <div className="club-detail-hero-left">
          <div className="club-logo-box-react">
            <img
              className="club-detail-logo-react"
              src={
                club.logo_url
                  ? club.logo_url
                  : "https://placehold.co/260x260?text=Club+Logo"
              }
              alt={club.name}
            />
          </div>
        </div>

        <div className="club-detail-hero-right">
          <h1>{club.name}</h1>
          <p className="club-detail-desc-react">
            {club.description || "구단 소개가 아직 입력되지 않았어."}
          </p>

          <div className="club-meta-react">
            <div><strong>약칭:</strong> {club.short_name}</div>
            <div><strong>감독:</strong> {club.manager}</div>
            <div><strong>홈구장:</strong> {club.stadium}</div>
            <div><strong>창단연도:</strong> {club.founded_year}</div>
          </div>

          <div className="club-user-action-react">
            {user ? (
              <>
                <button className="button" type="button" onClick={handleSaveFavorite}>
                  {isFavorite ? "응원팀 저장됨" : "내 응원팀으로 저장"}
                </button>
                {favoriteMessage && (
                  <p className="favorite-message-react">{favoriteMessage}</p>
                )}
              </>
            ) : (
              <p className="favorite-message-react">
                응원팀 저장은 <Link to="/login">로그인</Link> 후 가능해.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="club-detail-grid-react">
        <section className="club-sub-card">
          <div className="home-card-header">
            <h3>Next Match</h3>
          </div>

          <div className="club-info-block">
            <p><strong>대회:</strong> {nextMatch.competition}</p>
            <p><strong>상대:</strong> {nextMatch.opponent}</p>
            <p><strong>일시:</strong> {nextMatch.date}</p>
            <p><strong>장소:</strong> {nextMatch.venue}</p>
          </div>
        </section>

        <section className="club-sub-card">
          <div className="home-card-header">
            <h3>Club History</h3>
          </div>

          <div className="club-info-block">
            <p>
              {club.history ||
                club.description ||
                "여기에 구단 역사나 전통, 주요 우승 기록 같은 내용을 나중에 직접 넣으면 돼."}
            </p>
          </div>
        </section>

        <RankingMiniBoard
          title="Top Scorers"
          items={topScorers}
          valueKey="goals"
          valueLabel="G"
        />

        <RankingMiniBoard
          title="Top Assists"
          items={topAssists}
          valueKey="assists"
          valueLabel="A"
        />
      </div>

      <section className="club-sub-card kits-card-react">
        <div className="home-card-header">
          <h3>2025/26 Kits</h3>
        </div>

        <div className="kits-grid-react">
          <div className="kit-box-react">
            <div className="kit-label-react">Home</div>
            <img
              className="kit-image-react"
              src={
                club.home_kit_url
                  ? club.home_kit_url
                  : "https://placehold.co/280x320?text=Home+Kit"
              }
              alt={`${club.name} home kit`}
            />
          </div>

          <div className="kit-box-react">
            <div className="kit-label-react">Away</div>
            <img
              className="kit-image-react"
              src={
                club.away_kit_url
                  ? club.away_kit_url
                  : "https://placehold.co/280x320?text=Away+Kit"
              }
              alt={`${club.name} away kit`}
            />
          </div>

          <div className="kit-box-react">
            <div className="kit-label-react">Third</div>
            <img
              className="kit-image-react"
              src={
                club.third_kit_url
                  ? club.third_kit_url
                  : "https://placehold.co/280x320?text=Third+Kit"
              }
              alt={`${club.name} third kit`}
            />
          </div>
        </div>
      </section>

      <section className="club-sub-card">
        <div className="home-card-header">
          <h3>{club.name} News</h3>
        </div>

        <div className="club-news-list-react">
          {clubNewsMock.map((news, index) => (
            <div className="club-news-row-react" key={index}>
              {news}
            </div>
          ))}
        </div>
      </section>

      <section className="club-sub-card">
        <div className="home-card-header">
          <h3>{club.name} Community</h3>
        </div>

        <div className="club-news-list-react">
          {clubPosts.length > 0 ? (
            clubPosts.map((post) => (
              <Link
                to={`/community/${post.id}`}
                className="club-news-row-react"
                key={post.id}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <strong>{post.title}</strong>
                <div style={{ marginTop: "6px", color: "#9ca3af", fontSize: "0.9rem" }}>
                  {post.author_username} · 조회수 {post.views}
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">아직 팀 커뮤니티 글이 없어.</div>
          )}

          <div style={{ padding: "8px 16px 16px 16px" }}>
            <Link to={`/clubs/${club.id}/community`} className="detail-btn-react">
              팀 커뮤니티 전체 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ClubDetailPage;