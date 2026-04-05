import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  useEffect(() => {
  document.title = 'CirclOS | Transforming Waste & Green Claims'
  let desc = document.querySelector('meta[name="description"]')
  if (!desc) {
    desc = document.createElement('meta')
    desc.setAttribute('name', 'description')
    document.head.appendChild(desc)
  }
  desc.setAttribute(
    'content',
    'CirclOS helps businesses simplify green claims compliance, manage waste exchange, and move faster with trustworthy environmental operations.'
  )
}, [])
  return (
    <div className="container">
      {/* Accessibility skip link for keyboard navigation */}
      <a href="#main" className="skip-link">Skip to Content</a>

      {/* Header: Sticky top nav with logo & actions */}
      <header className="header">
        <div className="logo-container">
          <Link to="/" aria-label="CirclOS Home" className="logo">
            <span className="logo-icon">C</span>
            <span className="logo-text">CirclOS</span>
          </Link>
        </div>
        <nav className="main-nav" aria-label="Main Navigation">
          <a href="#about">About</a>
          <a href="#solutions">Solutions</a>
          <a href="#resources">Resources</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="auth-buttons">
          <Link to="/login" className="btn secondary">Log In</Link>
          <Link to="/login?mode=signup" className="btn primary">Get Started</Link>
        </div>
      </header>

      {/* Main hero section */}
      <main id="main" className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1 className="headline">Reduce Waste & Save Up To 30%</h1>
            <p className="subheadline">
              CirclOS empowers responsible businesses to streamline environmental compliance and waste management—saving costs and boosting sustainability.
            </p>
            <div className="cta-group">
              <Link to="/login?mode=signup" className="btn primary large">Get Started</Link>
              <Link to="/login" className="btn secondary large">Learn More</Link>
            </div>
            <p className="urgency-note">Limited onboarding slots available this month—join now!</p>
          </div>
          <div className="hero-visual">
            {/* A clean, animated abstract graphic or image */}
            <div className="graphic-container">
              {/* Placeholder for SVG or image */}
              <svg viewBox="0 0 600 400" className="hero-svg" aria-hidden="true">
                {/* Example animated shapes for visual appeal */}
                <circle cx="100" cy="200" r="50" fill="#4CAF50" opacity="0.8" />
                <circle cx="500" cy="150" r="70" fill="#81C784" opacity="0.6" />
                <rect x="250" y="300" width="100" height="50" fill="#388E3C" rx="8" />
              </svg>
            </div>
          </div>
        </section>

        {/* Trusted by logos / social proof */}
        <section className="trust-section">
          <p className="trust-intro">Trusted by industry leaders committed to sustainability</p>
          <div className="logos-row">
            {/* Replace with actual logos or images */}
            <div className="logo">NorthGrid</div>
            <div className="logo">TerraWorks</div>
            <div className="logo">BlueRoot</div>
            <div className="logo">Alpine Eco</div>
          </div>
        </section>

        {/* Core value pillars */}
        <section className="pillars" id="solutions">
          <h2 className="section-heading">What CirclOS Enables You To Achieve</h2>
          <div className="pillar-cards">
            {[
              {
                code: '01',
                title: 'Defend Green Claims',
                text: 'Build compliant messaging with clear evidence trails and review checkpoints.',
              },
              {
                code: '02',
                title: 'Accelerate Waste Exchange',
                text: 'Match reusable materials with verified buyers, reducing friction and delays.',
              },
              {
                code: '03',
                title: 'Operational Guidance',
                text: 'Keep policies, reporting, and sustainability aligned without added overhead.',
              },
            ].map((pillar) => (
              <div key={pillar.code} className="pillar-card">
                <div className="pill-code">{pillar.code}</div>
                <h3 className="pill-title">{pillar.title}</h3>
                <p className="pill-text">{pillar.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services overview */}
        <section className="services" id="solutions">
          <h2 className="section-heading">Our Solutions</h2>
          <div className="service-cards">
            {[
              {
                title: 'Green Claims Compliance',
                text: 'Review sustainability claims before they create risk.',
              },
              {
                title: 'Waste Exchange Programs',
                text: 'Connect materials with verified reuse opportunities.',
              },
              {
                title: 'Sustainability Consulting',
                text: 'Get expert advice tailored to your operational needs.',
              },
            ].map((service) => (
              <div key={service.title} className="service-card">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-text">{service.text}</p>
                <a href="#contact" className="link-cta">Discover More</a>
              </div>
            ))}
          </div>
        </section>

        {/* About section */}
        <section className="about" id="about">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-heading">About CirclOS</h2>
              <p>
                CirclOS provides a disciplined, transparent platform to streamline green claims, waste exchange, and sustainability operations—all designed for clarity and trust.
              </p>
              <Link to="/login?mode=signup" className="btn secondary">Learn More</Link>
            </div>
            <div className="about-image">
              {/* Placeholder for illustration */}
              <img src="https://via.placeholder.com/400x300?text=Eco+Platform" alt="Eco platform illustration" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials" id="testimonials">
          <h2 className="section-heading">Customer Success Stories</h2>
          <div className="testimonial-grid">
            {[
              {
                quote: 'CirclOS gave us a calmer, more defensible process for claims and approvals.',
                name: 'Compliance Lead',
                company: 'Manufacturing Client',
              },
              {
                quote: 'We reduced waste handling delays and made our circular workflow easier.',
                name: 'Operations Director',
                company: 'Circularity Client',
              },
              {
                quote: 'The platform is clear, practical, and focused on our team’s needs.',
                name: 'Sustainability Manager',
                company: 'Environmental Client',
              },
            ].map((t, idx) => (
              <blockquote key={idx} className="testimonial-card">
                <p className="quote">“{t.quote}”</p>
                <footer>
                  <strong>{t.name}</strong> <span>{t.company}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="resources" id="resources">
          <h2 className="section-heading">Resources for Your Team</h2>
          <div className="resource-grid">
            {[
              { category: 'Guide', title: 'Substantiating Green Claims' },
              { category: 'Checklist', title: 'Waste Exchange Readiness' },
              { category: 'Update', title: 'Compliance Expectations' },
            ].map((res, idx) => (
              <div key={idx} className="resource-card">
                <span className="resource-category">{res.category}</span>
                <h3 className="resource-title">{res.title}</h3>
                <a href="#contact" className="link-cta">Read More</a>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="call-to-action" id="contact">
          <h2 className="section-heading">Ready to Transform Your Waste & Claims?</h2>
          <div className="cta-buttons">
            <Link to="/login?mode=signup" className="btn primary large">Sign Up</Link>
            <Link to="/login" className="btn secondary large">Log In</Link>
            <a href="mailto:hello@circlos.example" className="btn secondary large">Contact Us</a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" aria-label="CirclOS Home" className="footer-logo">
              <span className="footer-logo-icon">C</span>
              <span className="footer-logo-text">CirclOS</span>
            </Link>
            <p>Leading platform for environmental compliance, waste exchange, and sustainable claims management.</p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>
          <div className="footer-social">
            <h3>Follow Us</h3>
            <ul>
              <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><a href="https://www.x.com" target="_blank" rel="noreferrer">X</a></li>
              <li><a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube</a></li>
            </ul>
          </div>
          <div className="footer-newsletter">
            <h3>Subscribe</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletterEmail" className="sr-only">Email</label>
              <input type="email" id="newsletterEmail" placeholder="Your Email" />
              <button className="btn secondary" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CirclOS. All rights reserved.</p>
        </div>
      </footer>

      {/* Styles (for demonstration, embed or move to CSS files as needed) */}
      <style jsx>{`
        /* Reset & base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #fff;
        }
        a {
          text-decoration: none;
          color: inherit;
        }
        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        /* Skip link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px;
          z-index: 1000;
        }
        .skip-link:focus {
          top: 0;
        }

        /* Header styles */
        .header {
          position: sticky;
          top: 0;
          background: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 999;
        }
        .logo {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
        }
        .logo-icon {
          background-color: #4caf50;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-right: 0.5rem;
        }
        .main-nav {
          display: flex;
          gap: 1.5rem;
        }
        .auth-buttons {
          display: flex;
          gap: 1rem;
        }
        /* Main content styles */
        .main-content {
          padding: 3rem 1rem;
        }
        /* Hero */
        .hero {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          padding: 4rem 2rem;
          background: #f0f4f8;
        }
        .hero-content {
          flex: 1 1 50%;
          max-width: 600px;
        }
        .headline {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          animation: fadeInUp 1s ease forwards;
        }
        .subheadline {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          color: #555;
          animation: fadeInUp 1.2s ease forwards;
        }
        .cta-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn.primary {
          background-color: #4caf50;
          color: #fff;
        }
        .btn.primary:hover {
          background-color: #388e3c;
        }
        .btn.secondary {
          background-color: transparent;
          border: 2px solid #4caf50;
          color: #4caf50;
        }
        .btn.secondary:hover {
          background-color: #4caf50;
          color: #fff;
        }
        .large {
          font-size: 1.25rem;
        }
        .urgency-note {
          font-size: 0.9rem;
          color: #d32f2f;
          font-weight: 600;
          animation: fadeIn 1.5s ease forwards;
        }

        /* Visual graphic */
        .hero-visual {
          flex: 1 1 45%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }
        .graphic-container {
          width: 100%;
          max-width: 400px;
        }
        /* trust logos */
        .trust-section {
          text-align: center;
          padding: 3rem 1rem;
        }
        .trust-intro {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
        }
        .logos-row {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .logo {
          font-weight: bold;
          font-size: 1.1rem;
        }

        /* Pillars & solutions */
        .pillars, .services {
          padding: 4rem 2rem;
          background: #fff;
        }
        .section-heading {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
          font-weight: 700;
        }
        .pillar-cards, .service-cards {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        .pillar-card, .service-card {
          background: #fafafa;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .pillar-card:hover, .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .pill-code {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #4caf50;
          color: #fff;
          font-weight: bold;
          padding: 0.3rem 0.6rem;
          border-radius: 50%;
          font-size: 0.8rem;
        }
        .pill-title {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        /* Testimonials & resources */
        .testimonials, .resources {
          padding: 4rem 2rem;
          background: #f9f9f9;
        }
        .testimonial-grid, .resource-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        .testimonial-card, .resource-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .quote {
          font-style: italic;
          margin-bottom: 1rem;
        }
        footer {
          background: #222;
          color: #fff;
          padding: 3rem 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-top {
          display: flex;
          flex: 1 1 100%;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .footer-brand, .footer-links, .footer-social, .footer-newsletter {
          flex: 1 1 200px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          font-size: 1.8rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .footer-logo-icon {
          background-color: #4caf50;
          width: 2.2rem;
          height: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-right: 0.5rem;
          color: #fff;
        }
        h3 {
          margin-bottom: 0.75rem;
        }
        ul {
          list-style: none;
        }
        ul li {
          margin-bottom: 0.5rem;
        }
        .sp-newsletter input {
          padding: 0.5rem;
          width: calc(100% - 100px);
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .sp-newsletter button {
          padding: 0.5rem 1rem;
          margin-left: 1rem;
        }
        /* Responsive & animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: fadeInUp 1s forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1.5s forwards;
        }
        /* Buttons hover effect */
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Media Queries for responsiveness */
        @media(max-width: 768px){
          .hero {
            flex-direction: column;
            padding: 2rem 1rem;
          }
          .hero-content, .hero-visual {
            flex: 1 1 100%;
            max-width: 100%;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }
          .main-nav {
            margin-top: 1rem;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}