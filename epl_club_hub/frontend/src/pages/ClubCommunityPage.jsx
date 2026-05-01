import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function ClubCommunityPage() {
  const { clubId } = useParams();

  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubRes, postsRes, meRes] = await Promise.all([
          axios.get(`${API_BASE}/api/clubs/${clubId}`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/community/posts`, {
            params: { board_type: "club", club_id: clubId },
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/auth/me`, {
            withCredentials: true,
          }),
        ]);

        setClub(clubRes.data.club || null);
        setPosts(postsRes.data.items || []);
        setUser(meRes.data.user || null);
      } catch (error) {
        console.error("팀 커뮤니티 불러오기 실패:", error);
      }
    };

    fetchData();
  }, [clubId]);

  if (!club) {
    return (
      <main className="section">
        <div className="auth-card-react">
          <h1>팀 커뮤니티 불러오는 중...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="page-title-box news-page-top-react">
        <div>
          <h1>{club.name} 커뮤니티</h1>
          <p>{club.name} 팬들이 자유롭게 이야기하는 공간이야.</p>
        </div>

        {user ? (
          <Link to={`/clubs/${clubId}/community/write`} className="detail-btn-react">
            글쓰기
          </Link>
        ) : (
          <Link to="/login" className="detail-btn-react secondary">
            로그인 후 글쓰기
          </Link>
        )}
      </div>

      <div className="community-board-list-react">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Link
              to={`/community/${post.id}`}
              className="community-board-row-react"
              key={post.id}
            >
              <div className="community-board-main-react">
                <h3>{post.title}</h3>
                <p>{post.content.slice(0, 120)}...</p>
              </div>

              <div className="community-board-meta-react">
                <div>작성자: {post.author_username}</div>
                <div>조회수: {post.views}</div>
                <div>좋아요: {post.likes_count}</div>
                <div>작성일: {post.created_at}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="home-card" style={{ padding: "20px" }}>
            아직 팀 커뮤니티 글이 없어.
          </div>
        )}
      </div>
    </main>
  );
}

export default ClubCommunityPage;