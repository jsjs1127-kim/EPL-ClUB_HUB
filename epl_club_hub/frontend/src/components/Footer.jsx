function Footer() {
  return (
    <footer className="site-footer-react">
      <div className="site-footer-inner-react">
        <div className="site-footer-text-react">
          EPL Club Hub
        </div>

        <a
          href="http://127.0.0.1:8000/admin/login"
          target="_blank"
          rel="noreferrer"
          className="site-admin-link-react"
        >
          관리자
        </a>
      </div>
    </footer>
  );
}

export default Footer;