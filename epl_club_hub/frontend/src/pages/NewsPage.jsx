import { useEffect, useState } from "react";
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

function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/news`, {
          withCredentials: true,
        });
        setNewsItems(res.data.items || []);
      } catch (error) {
        console.error("news 불러오기 실패:", error);
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

    fetchNews();
    fetchMe();
  }, []);

  return (
    <main className="section">
      <div className="page-title-box news-page-top-react">
        <div>
          <h1>News</h1>
          <p>EPL 기사와 이적설, 주요 이슈를 보여주는 페이지야.</p>
        </div>

        {user ? (
          <Link to="/news/submit" className="detail-btn-react">
            뉴스 제보하기
          </Link>
        ) : (
          <Link to="/login" className="detail-btn-react secondary">
            로그인 후 제보
          </Link>
        )}
      </div>

      <div className="news-grid-react">
        {newsItems.map((item) => (
          <Link to={`/news/${item.id}`} className="news-card-react" key={item.id}>
            <img
              className="news-card-image-react"
              src={getImageUrl(item.image_url)}
              alt={item.title}
              />

            <div className="news-card-body-react">
              <span className="featured-news-category">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default NewsPage;