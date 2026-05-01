import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

function SignupPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE}/api/auth/signup`, {
        username,
        email,
        password,
      });

      alert("회원가입 완료! 이제 로그인해.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.detail || "회원가입 실패");
    }
  };

  return (
    <main className="section">
      <div className="auth-page-react">
        <div className="auth-card-react">
          <h1>Signup</h1>
          <p>일반 사용자 계정을 만들어서 댓글과 응원팀 기능을 쓸 수 있어.</p>

          <form className="auth-form-react" onSubmit={handleSignup}>
            <input
              className="input"
              type="text"
              placeholder="닉네임"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

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
              회원가입
            </button>
          </form>

          <p className="auth-link-react">
            이미 계정이 있으면 <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default SignupPage;