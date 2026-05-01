import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function NewsEditPage() {
  const { newsId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [newsItem, setNewsItem] = useState(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Rumor");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true,
        });
        const currentUser = meRes.data.user || null;
        setUser(currentUser);

        const newsRes = await axios.get(`${API_BASE}/api/news/${newsId}`, {
          withCredentials: true,
        });

        const item = newsRes.data.item || null;
        setNewsItem(item);

        if (item) {
          setTitle(item.title || "");
          setSummary(item.summary || "");
          setCategory(item.category || "Rumor");
          setContent(item.content || "");
          setSourceName(item.source_name || "");
          setSourceUrl(item.source_url || "");
        }
      } catch (error) {
        console.error("뉴스 수정 데이터 불러오기 실패:", error);
        setNewsItem(null);
      }
    };

    fetchData();
  }, [newsId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !summary.trim() ||
      !content.trim() ||
      !sourceName.trim() ||
      !sourceUrl.trim()
    ) {
      alert("필수 항목을 모두 입력해줘.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("summary", summary);
      formData.append("category", category);
      formData.append("content", content);
      formData.append("source_name", sourceName);
      formData.append("source_url", sourceUrl);

      if (imageFile) {
        formData.append("image_file", imageFile);
      }

      await axios.post(`${API_BASE}/api/news/${newsId}/edit`, formData, {
        withCredentials: true,
      });

      alert("수정 완료");
      navigate(`/news/${newsId}`);
    } catch (error) {
      alert(error.response?.data?.detail || "수정 실패");
    }
  };

  if (!user || !newsItem) {
    return (
      <main className="section">
        <div className="auth-page-react">
          <div className="auth-card-react">
            <h1>News Edit</h1>
            <p>기사를 불러오는 중이야.</p>
          </div>
        </div>
      </main>
    );
  }

  if (newsItem.author_user_id !== user.id) {
    return (
      <main className="section">
        <div className="auth-page-react">
          <div className="auth-card-react">
            <h1>수정 불가</h1>
            <p>자기 글만 수정할 수 있어.</p>
            <p className="auth-link-react">
              <Link to={`/news/${newsId}`}>기사로 돌아가기</Link>
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
          <h1>뉴스 수정</h1>

          <form className="submit-form-react" onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="input"
              type="text"
              placeholder="한 줄 요약"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />

            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Global News">Global News</option>
              <option value="Club News">Club News</option>
              <option value="Transfer">Transfer</option>
              <option value="Rumor">Rumor</option>
              <option value="Stats">Stats</option>
            </select>

            <input
              className="input"
              type="text"
              placeholder="출처명"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />

            <input
              className="input"
              type="text"
              placeholder="출처 링크"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />

            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
            />

            <textarea
              className="comment-textarea-react"
              placeholder="본문"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="button" type="submit">
              수정 저장
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default NewsEditPage;