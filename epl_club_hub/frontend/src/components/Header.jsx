import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);

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
    fetchMe();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      window.location.href = "/";
    } catch (error) {
      alert("로그아웃 실패");
    }
  };

  return (
    <header className="site-header-react">
      <div className="site-header-top-react">
        <Link to="/" className="site-brand-react">
          EPL Club Hub
        </Link>

        <div className="site-auth-react">
          {user ? (
            <>
              <span className="nav-user-react">{user.username}</span>
              <button className="nav-logout-btn-react" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-auth-link-react">Login</Link>
              <Link to="/signup" className="site-auth-link-react">Signup</Link>
            </>
          )}
        </div>
      </div>

      <nav className="site-nav-react">
        <Link to="/fixtures">경기</Link>
        <Link to="/table">순위</Link>
        <Link to="/stats">기록</Link>
        <Link to="/news">뉴스</Link>
        <Link to="/injuries">부상</Link>
        <Link to="/clubs">팀페이지</Link>
      </nav>
    </header>
  );
}

export default Header;