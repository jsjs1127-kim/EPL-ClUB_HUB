import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function CommunityDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/community/posts/${postId}/comments`, {
        withCredentials: true,
      });
      setComments(res.data.items || []);
    } catch (error) {
      console.error("커뮤니티 댓글 불러오기 실패:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [postRes, meRes] = await Promise.all([
        axios.get(`${API_BASE}/api/community/posts/${postId}`, {
          withCredentials: true,
        }),
        axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true,
        }),
      ]);

      setPost(postRes.data.item || null);
      setUser(meRes.data.user || null);
    } catch (error) {
      try {
        const postRes = await axios.get(`${API_BASE}/api/community/posts/${postId}`, {
          withCredentials: true,
        });
        setPost(postRes.data.item || null);
        setUser(null);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchComments();
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제할까?")) return;

    try {
      await axios.post(
        `${API_BASE}/api/community/posts/${postId}/delete`,
        {},
        { withCredentials: true }
      );
      alert("삭제 완료");
      navigate("/community");
    } catch (error) {
      alert(error.response?.data?.detail || "삭제 실패");
    }
  };

  const handleLikeToggle = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/community/posts/${postId}/like-toggle`,
        {},
        { withCredentials: true }
      );
      setPost(res.data.item || null);
    } catch (error) {
      alert(error.response?.data?.detail || "좋아요 실패");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentContent.trim()) return;

    try {
      const formData = new FormData();
      formData.append("content", commentContent);

      await axios.post(
        `${API_BASE}/api/community/posts/${postId}/comments`,
        formData,
        { withCredentials: true }
      );

      setCommentContent("");
      fetchComments();
    } catch (error) {
      alert(error.response?.data?.detail || "댓글 작성 실패");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!confirm("댓글을 삭제할까?")) return;

    try {
      await axios.post(
        `${API_BASE}/api/community/comments/${commentId}/delete`,
        {},
        { withCredentials: true }
      );
      fetchComments();
    } catch (error) {
      alert(error.response?.data?.detail || "댓글 삭제 실패");
    }
  };

  if (!post) {
    return (
      <main className="section">
        <div className="auth-card-react">
          <h1>게시글 불러오는 중...</h1>
        </div>
      </main>
    );
  }

  const isOwner = user && user.id === post.author_user_id;

  return (
    <main className="section">
      <div className="community-detail-card-react">
        <div className="community-detail-head-react">
          <h1>{post.title}</h1>
          <div className="community-detail-meta-react">
            <div>작성자: {post.author_username}</div>
            <div>작성일: {post.created_at}</div>
            <div>수정일: {post.updated_at || "-"}</div>
            <div>조회수: {post.views}</div>
          </div>
        </div>

        <div className="community-detail-actions-react">
          {user ? (
            <button className="detail-btn-react" onClick={handleLikeToggle}>
              {post.liked_by_current_user ? "좋아요 취소" : "좋아요"} ({post.likes_count})
            </button>
          ) : (
            <Link to="/login" className="detail-btn-react">
              로그인 후 좋아요
            </Link>
          )}

          {isOwner && (
            <>
              <Link to={`/community/${post.id}/edit`} className="detail-btn-react">
                수정
              </Link>
              <button className="detail-btn-react secondary" onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
        </div>

        <div className="community-detail-content-react">
          {post.content.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <section className="comment-box-react">
        <div className="home-card-header">
          <h3>Comments</h3>
        </div>

        {user ? (
          <form className="comment-form-react" onSubmit={handleCommentSubmit}>
            <div className="comment-user-react">
              {user.username} 로 댓글 작성 중
            </div>

            <textarea
              className="comment-textarea-react"
              placeholder="댓글을 입력해봐"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
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
                  <div className="comment-nickname-react">{comment.author_username}</div>
                  <div className="comment-date-react">{comment.created_at}</div>
                </div>

                <div className="comment-content-react">{comment.content}</div>

                {user && user.id === comment.author_user_id && (
                  <div style={{ marginTop: "10px" }}>
                    <button
                      className="detail-btn-react secondary"
                      onClick={() => handleCommentDelete(comment.id)}
                    >
                      댓글 삭제
                    </button>
                  </div>
                )}
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

export default CommunityDetailPage;