import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function NewsSubmitPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("Rumor");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
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

    fetchMe();
  }, []);

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

      await axios.post(`${API_BASE}/api/news/submit`, formData, {
        withCredentials: true,
      });

      alert("뉴스가 등록됐어.");
      navigate("/news");
    } catch (error) {
      alert(error.response?.data?.detail || "뉴스 제보 실패");
    }
  };

  if (!user) {
    return (
      <main className="section">
        <div className="auth-page-react">
          <div className="auth-card-react">
            <h1>News Submit</h1>
            <p>뉴스 제보는 로그인한 사용자만 가능해.</p>
            <p className="auth-link-react">
              먼저 <Link to="/login">로그인</Link> 해줘.
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
          <h1>뉴스 제보</h1>
          <p>출처만 명확하면 바로 공개돼. 메인뉴스 선택은 관리자만 해.</p>

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
              placeholder="출처명 (예: BBC Sport)"
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
              뉴스 제출
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default NewsSubmitPage;