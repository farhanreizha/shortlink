import { Link } from "wouter"

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <span>&copy; {new Date().getFullYear()} Knot</span>
        <div className="landing-footer__links">
          <Link className="navbar__link" href="/login">
            Sign In
          </Link>
          <Link className="navbar__link" href="/register">
            Get Started
          </Link>
        </div>
      </div>
    </footer>
  )
}
