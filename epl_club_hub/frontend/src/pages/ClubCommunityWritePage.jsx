import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function ClubCommunityWritePage() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubRes, meRes] = await Promise.all([
          axios.get(`${API_BASE}/api/clubs/${clubId}`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/api/auth/me`, {
            withCredentials: true,
          }),
        ]);

        setClub(clubRes.data.club || null);
        setUser(meRes.data.user || null);
      } catch (error) {
        console.error("팀 커뮤니티 글쓰기 준비 실패:", error);
      }
    };

    fetchData();
  }, [clubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해줘.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/community/posts`,
        {
          title,
          content,
          board_type: "club",
          club_id: clubId,
        },
        { withCredentials: true }
      );

      alert("글 작성 완료");
      navigate(`/clubs/${clubId}/community`);
    } catch (error) {
      alert(error.response?.data?.detail || "글 작성 실패");
    }
  };

  if (!user) {
    return (
      <main className="section">
        <div className="auth-page-react">
          <div className="auth-card-react">
            <h1>팀 커뮤니티 글쓰기</h1>
            <p>로그인 후 글을 쓸 수 있어.</p>
            <p className="auth-link-react">
              <Link to="/login">로그인하러 가기</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="submit-page-react">
        <div className="submit-card-react">
          <h1>{club ? `${club.name} 커뮤니티 글쓰기` : "팀 커뮤니티 글쓰기"}</h1>

          <form className="submit-form-react" onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="comment-textarea-react"
              placeholder="내용"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="button" type="submit">
              글 등록
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ClubCommunityWritePage;