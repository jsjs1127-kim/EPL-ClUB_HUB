import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_BASE}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.detail || "로그인 실패");
    }
  };

  return (
    <main className="section">
      <div className="auth-page-react">
        <div className="auth-card-react">
          <h1>Login</h1>
          <p>댓글 작성이나 응원팀 저장을 하려면 로그인해야 해.</p>

          <form className="auth-form-react" onSubmit={handleLogin}>
            <input
              className="input"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="button" type="submit">
              로그인
            </button>
          </form>

          <p className="auth-link-react">
            계정이 없으면 <Link to="/signup">회원가입</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;