import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "https://placehold.co/1200x600?text=News";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${API_BASE}${imageUrl}`;
}


function HomePage() {
  const [featuredNews, setFeaturedNews] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [table, setTable] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [overallPopularPosts, setOverallPopularPosts] = useState([]);
  const [clubPopularPosts, setClubPopularPosts] = useState([]);

  const [playerSearch, setPlayerSearch] = useState("");
  const [playerResults, setPlayerResults] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [
           featuredRes,
           newsRes,
           tableRes,
           matchRes,
           overallPopularRes,
           clubPopularRes,  
        ] = await Promise.all([
           axios.get(`${API_BASE}/api/home/featured-news`, { withCredentials: true }),
           axios.get(`${API_BASE}/api/news`, { withCredentials: true }),
           axios.get(`${API_BASE}/api/home/table`, { withCredentials: true }),
           axios.get(`${API_BASE}/api/home/recent-matches`, { withCredentials: true }),
           axios.get(`${API_BASE}/api/community/popular`, {
             params: { board_type: "general", limit: 5, days: 7 },
             withCredentials: true,
           }),
           axios.get(`${API_BASE}/api/community/popular`, {
             params: { board_type: "club", limit: 5, days: 7 },
             withCredentials: true,
           }),  
        ]);

        setFeaturedNews(featuredRes.data.item || null);
        setNewsItems(newsRes.data.items || []);
        setTable(tableRes.data.items || []);
        setRecentMatches(matchRes.data.items || []);
        setOverallPopularPosts(overallPopularRes.data.items || []);
        setClubPopularPosts(clubPopularRes.data.items || []);
      } catch (error) {
        console.error("home data 불러오기 실패:", error);
      }
    };

    fetchHomeData();
  }, []);

  const subNews = useMemo(() => {
    const globalNews = newsItems.filter(
      (item) =>
        item.id !== featuredNews?.id &&
        (item.category === "Global News" ||
          item.category === "Featured" ||
          item.category === "Transfer")
    );

    if (globalNews.length >= 3) {
      return globalNews.slice(0, 3);
    }

    return newsItems.filter((item) => item.id !== featuredNews?.id).slice(0, 3);
  }, [newsItems, featuredNews]);

  const handlePlayerSearch = async (e) => {
    e.preventDefault();

    if (!playerSearch.trim()) {
      setPlayerResults([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/players`, {
        params: {
          search: playerSearch,
          sort: "name",
        },
        withCredentials: true,
      });

      setPlayerResults((res.data.items || []).slice(0, 5));
    } catch (error) {
      console.error("선수 검색 실패:", error);
    }
  };

  return (
    <main className="section">
      <div className="home-portal-grid-react">
        <div className="home-main-area-react">
          <section className="portal-main-news-section-react">
            {featuredNews ? (
              <Link
                to={`/news/${featuredNews.id}`}
                className="portal-main-news-card-react"
              >
                <img
                  className="portal-main-news-image-react"
                  src={getImageUrl(featuredNews.image_url)}
                  alt={featuredNews.title}
                  />

                <div className="portal-main-news-body-react">
                  <div className="portal-news-badges-react">
                    <span className="featured-news-category">
                      {featuredNews.category}
                    </span>
                    <span className="news-type-badge-react">
                      {featuredNews.submission_type === "user_submission"
                        ? "User Submitted"
                        : "Official"}
                    </span>
                  </div>

                  <h2>{featuredNews.title}</h2>
                  <p>{featuredNews.summary}</p>

                  <div className="news-meta-bottom-react">
                    <div>출처: {featuredNews.source_name || "미입력"}</div>
                    <div>작성자: {featuredNews.author_username || "관리자"}</div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="portal-empty-card-react">
                대표기사로 지정된 글로벌 뉴스가 아직 없어.
              </div>
            )}
          </section>

          <section className="portal-subnews-grid-react">
            {subNews.map((item) => (
              <Link
                to={`/news/${item.id}`}
                className="portal-subnews-card-react"
                key={item.id}
              >
                <img
                  className="portal-subnews-image-react"
                  src={getImageUrl(item.image_url)}
                  alt={item.title}
                  />

                <div className="portal-subnews-body-react">
                  <span className="featured-news-category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              </Link>
            ))}
          </section>

          <div className="portal-double-grid-react">
            <section className="home-card">
              <div className="home-card-header">
                <h3>경기 일정 / 결과</h3>
              </div>

              <div className="match-list">
                {recentMatches.map((match, index) => (
                  <div className="match-row" key={index}>
                    <div className="match-teams">
                      {match.home} vs {match.away}
                    </div>
                    <div className="match-score">{match.score}</div>
                    <div className="match-status">{match.status}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="home-card">
              <div className="home-card-header">
                <h3>리그 순위</h3>
              </div>

              <div className="table-list">
                {table.map((item) => (
                  <div className="table-row" key={item.rank}>
                    <div className="table-rank">{item.rank}</div>
                    <div className="table-club">{item.club}</div>
                    <div className="table-played">P {item.played}</div>
                    <div className="table-points">{item.points} pts</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="portal-double-grid-react">
            <section className="home-card">
              <div className="home-card-header">
                <h3>전체 커뮤니티 인기글 TOP 5</h3>
              </div>

              <div className="community-list-react">
                {overallPopularPosts.map((post) => (
                  <div className="community-row-react" key={post.id}>
                    <div className="community-title-react">{post.title}</div>
                    <div className="community-meta-react">
                      {post.author_username} · 좋아요 {post.likes_count} · 조회수 {post.views}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="home-card">
              <div className="home-card-header">
                <h3>팀 커뮤니티 인기글 TOP 5</h3>
              </div>

              <div className="community-list-react">
                {clubPopularPosts.map((post) => (
                  <div className="community-row-react" key={post.id}>
                    <div className="community-title-react">{post.title}</div>
                    <div className="community-meta-react">
                      {post.author_username} · 좋아요 {post.likes_count} · 조회수 {post.views}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="home-sidebar-area-react">
          <section className="home-card">
            <div className="home-card-header">
              <h3>선수 검색</h3>
            </div>

            <form className="side-search-form" onSubmit={handlePlayerSearch}>
              <input
                className="input"
                type="text"
                placeholder="선수 이름 검색"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
              />
              <button className="button" type="submit">
                검색
              </button>
            </form>

            {playerResults.length > 0 && (
              <div className="search-result-list">
                {playerResults.map((player) => (
                  <Link
                    to={`/players/${player.id}`}
                    className="search-result-row"
                    key={player.id}
                  >
                    <div className="search-result-name">{player.name}</div>
                    <div className="search-result-meta">
                      {player.club_name} · {player.position}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="home-card">
            <div className="home-card-header">
              <h3>운영 메모</h3>
            </div>

            <div className="home-note-box-react">
              <p>메인뉴스는 관리자에서 대표기사 체크한 글로벌 뉴스가 올라가.</p>
              <p>작은 뉴스 3개도 되도록 Global News로 넣어줘.</p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default HomePage;