import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "https://placehold.co/1200x600?text=News";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${API_BASE}${imageUrl}`;
}

function NewsDetailPage() {
  const { newsId } = useParams();
  const [newsItem, setNewsItem] = useState(null);

  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/comments/${newsId}`, {
        withCredentials: true,
      });
      setComments(res.data.items || []);
    } catch (error) {
      console.error("comments 불러오기 실패:", error);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data.user || null);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/news/${newsId}`, {
          withCredentials: true,
        });
        setNewsItem(res.data.item || null);
      } catch (error) {
        console.error("news detail 불러오기 실패:", error);
      }
    };

    fetchNewsDetail();
    fetchComments();
    fetchMe();
  }, [newsId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", content);

      await axios.post(`${API_BASE}/api/comments/${newsId}`, formData, {
        withCredentials: true,
      });

      setContent("");
      fetchComments();
    } catch (error) {
      alert(error.response?.data?.detail || "댓글 저장 실패");
    }
  };

  if (!newsItem) {
    return (
      <main className="section">
        <div className="page-title-box">
          <h1>기사를 불러오는 중...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <article className="news-detail-react">
        <img
          className="news-detail-image-react"
          src={getImageUrl(newsItem.image_url)}
          alt={newsItem.title}
        />

        <div className="news-detail-body-react">
          <div className="news-meta-top-react" style={{ marginBottom: "14px" }}>
            <span className="featured-news-category">{newsItem.category}</span>
            <span className="news-type-badge-react">
              {newsItem.submission_type === "user_submission"
                ? "User Submitted"
                : "Official"}
            </span>
          </div>

          <h1>{newsItem.title}</h1>
          <p className="news-detail-summary-react">{newsItem.summary}</p>

          <div className="news-detail-info-react">
            <div><strong>작성자:</strong> {newsItem.author_username || "관리자"}</div>
            <div><strong>작성일:</strong> {newsItem.created_at || "-"}</div>
            <div><strong>출처명:</strong> {newsItem.source_name || "미입력"}</div>
            <div>
              <strong>출처링크:</strong>{" "}
              {newsItem.source_url ? (
                <a
                  href={newsItem.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="source-link-react"
                >
                  원문 보기
                </a>
              ) : (
                "미입력"
              )}
            </div>
          </div>

          {user && newsItem.author_user_id === user.id && (
            <div style={{ marginBottom: "20px" }}>
              <Link to={`/news/${newsItem.id}/edit`} className="detail-btn-react">
                내 뉴스 수정
              </Link>
            </div>
          )}

          <div className="news-detail-content-react">
            {newsItem.content.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </article>

      <section className="comment-box-react">
        <div className="home-card-header">
          <h3>Comments</h3>
        </div>

        {user ? (
          <form className="comment-form-react" onSubmit={handleSubmitComment}>
            <div className="comment-user-react">
              {user.username} 로 댓글 작성 중
            </div>

            <textarea
              className="comment-textarea-react"
              placeholder="댓글을 입력해봐"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="button" type="submit">
              댓글 작성
            </button>
          </form>
        ) : (
          <div className="comment-login-guide-react">
            댓글 작성은 <Link to="/login">로그인</Link> 후 가능해.
          </div>
        )}

        <div className="comment-list-react">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div className="comment-row-react" key={comment.id}>
                <div className="comment-head-react">
                  <div className="comment-nickname-react">
                    {comment.username}
                  </div>
                  <div className="comment-date-react">
                    {comment.created_at}
                  </div>
                </div>
                <div className="comment-content-react">{comment.content}</div>
              </div>
            ))
          ) : (
            <div className="comment-empty-react">아직 댓글이 없어.</div>
          )}
        </div>
      </section>
    </main>
  );
}

export default NewsDetailPage;