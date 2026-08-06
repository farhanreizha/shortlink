import { Waypoints } from "lucide-react"
import { Link } from "wouter"

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <Link className="landing-footer__logo" href="/">
            <span className="landing-footer__logo-mark">
              <Waypoints size={16} />
            </span>
            Knot
          </Link>
          <p className="landing-footer__tagline">
            Shorten your URLs instantly.
          </p>
        </div>

        <div className="landing-footer__col">
          <span className="landing-footer__heading">Product</span>
          <Link className="landing-footer__link" href="/login">
            Login
          </Link>
          <Link className="landing-footer__link" href="/register">
            Get Started
          </Link>
        </div>

        <div className="landing-footer__col" id="resources">
          <span className="landing-footer__heading">Resources</span>
          <a className="landing-footer__link" href="#features">
            Features
          </a>
          <a className="landing-footer__link" href="#reliability">
            Reliability
          </a>
        </div>
      </div>

      <div className="landing-footer__bottom">
        &copy; {new Date().getFullYear()} Knot Infrastructure Inc. All rights
        reserved.
      </div>
    </footer>
  )
}
