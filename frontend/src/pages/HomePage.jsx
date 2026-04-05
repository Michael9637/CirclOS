import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    code: '01',
    title: 'Green claims you can defend',
    text: 'Build compliant messaging with evidence trails, review checkpoints, and clearer approvals.',
  },
  {
    code: '02',
    title: 'Waste exchange that moves fast',
    text: 'Match reusable materials with buyers, reduce disposal friction, and track every handoff.',
  },
  {
    code: '03',
    title: 'Guidance that fits real operations',
    text: 'Keep policy, reporting, and sustainability work aligned without adding unnecessary overhead.',
  },
]

const services = [
  {
    title: 'Green Claims Compliance',
    text: 'Review sustainability statements before they create risk.',
  },
  {
    title: 'Waste Exchange Programs',
    text: 'List materials and connect them to verified reuse opportunities.',
  },
  {
    title: 'Sustainability Consulting',
    text: 'Get concise advice for operational and compliance decisions.',
  },
]

const testimonials = [
  {
    quote: 'CirclOS gave us a calmer, more defensible process for claims and approvals.',
    name: 'Compliance Lead',
    company: 'Manufacturing Client Placeholder',
  },
  {
    quote: 'We reduced waste handling delays and made our circular workflow much easier to manage.',
    name: 'Operations Director',
    company: 'Circularity Client Placeholder',
  },
  {
    quote: 'The platform is clear, practical, and focused on the exact work our team needs to do.',
    name: 'Sustainability Manager',
    company: 'Environmental Client Placeholder',
  },
]

const resources = [
  {
    category: 'Guide',
    title: 'How to substantiate green claims without overexplaining them',
  },
  {
    category: 'Checklist',
    title: 'Waste exchange readiness checklist for manufacturing teams',
  },
  {
    category: 'Update',
    title: 'What stronger compliance expectations mean for your workflow',
  },
]

const logos = ['NorthGrid', 'TerraWorks', 'BlueRoot', 'Alpine Eco']

export default function HomePage() {
  useEffect(() => {
    document.title = 'CirclOS | Environmental Compliance and Waste Exchange'

    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.setAttribute('name', 'description')
      document.head.appendChild(descriptionTag)
    }
    descriptionTag.setAttribute(
      'content',
      'CirclOS helps businesses simplify green claims compliance, manage waste exchange, and move faster with trustworthy environmental operations.',
    )
  }, [])

  return (
    <div className="sp-home">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Compact sticky header with the two primary actions always visible. */}
      <header className="sp-header" aria-label="Primary">
        <Link className="sp-brand" to="/" aria-label="CirclOS home">
          <span className="sp-brand-mark" aria-hidden="true">
            C
          </span>
          <span className="sp-brand-text">CirclOS</span>
        </Link>

        <nav className="sp-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#resources">Resources</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="sp-actions">
          <Link className="btn btn-secondary btn-small" to="/login">
            Log In
          </Link>
          <Link className="btn btn-primary btn-small" to="/login?mode=signup">
            Sign Up
          </Link>
        </div>
      </header>

      <main id="main-content">
        {/* Hero stays centered, compact, and deliberately conversion-focused. */}
        <section className="sp-hero" id="home" aria-labelledby="hero-title">
          <div className="sp-hero-copy">
            <p className="sp-kicker">Environmental compliance for responsible businesses</p>
            <h1 id="hero-title">Green compliance and waste exchange, designed to help your team move faster.</h1>
            <p className="sp-subhead">
              CirclOS gives you one focused place to manage claims, documentation, and reuse opportunities with less
              confusion.
            </p>

            <div className="sp-cta-row" aria-label="Primary calls to action">
              <Link className="btn btn-primary" to="/login?mode=signup">
                Sign Up
              </Link>
              <Link className="btn btn-secondary" to="/login">
                Log In
              </Link>
              <a className="btn btn-secondary" href="#contact">
                Get a Free Consultation
              </a>
            </div>

            <p className="sp-urgency" aria-label="Urgency note">
              Limited onboarding support is available this month for new teams.
            </p>
          </div>

          <div className="sp-hero-visual" aria-label="Platform overview">
            <div className="sp-visual-board" aria-hidden="true">
              <div className="sp-board-top">
                <span>Claims</span>
                <strong>Evidence ready</strong>
              </div>
              <div className="sp-board-line" />
              <div className="sp-board-grid">
                <article>
                  <span>Compliance</span>
                  <strong>Review</strong>
                </article>
                <article>
                  <span>Exchange</span>
                  <strong>Match</strong>
                </article>
                <article>
                  <span>Operations</span>
                  <strong>Track</strong>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* Lightweight social proof strip keeps trust visible without extra clutter. */}
        <section className="sp-proof-strip" aria-label="Client logos">
          <p>Trusted by teams focused on practical sustainability and compliance</p>
          <div className="sp-logo-row">
            {logos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        {/* Three clear pillars summarize the value proposition fast. */}
        <section className="sp-pillars" aria-labelledby="pillars-title">
          <div className="sp-section-heading">
            <h2 id="pillars-title">What CirclOS helps you do</h2>
          </div>

          <div className="sp-pillars-grid">
            {pillars.map((pillar) => (
              <article className="card-surface sp-pillar-card" key={pillar.title}>
                <span className="sp-pill-number">{pillar.code}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Services section remains lean and easy to scan. */}
        <section className="sp-services" id="services" aria-labelledby="services-title">
          <div className="sp-section-heading">
            <h2 id="services-title">Services</h2>
          </div>
          <div className="sp-services-grid">
            {services.map((service) => (
              <article className="card-surface sp-service-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a className="sp-link" href="#contact">
                  Discover More
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* About remains short so the page keeps moving toward sign-up. */}
        <section className="sp-about" id="about" aria-labelledby="about-title">
          <div className="sp-about-grid">
            <div>
              <p className="sp-kicker">About CirclOS</p>
              <h2 id="about-title">A practical platform for environmental work that needs structure.</h2>
            </div>
            <div className="card-surface sp-about-copy">
              <p>
                CirclOS helps businesses handle green claims, waste exchange, and sustainability operations with a
                disciplined, easy-to-follow system built for clarity and trust.
              </p>
              <Link className="sp-link" to="/login?mode=signup">
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials are kept to a simple grid to avoid visual noise. */}
        <section className="sp-testimonials" aria-labelledby="testimonials-title">
          <div className="sp-section-heading">
            <h2 id="testimonials-title">What clients say</h2>
          </div>
          <div className="sp-testimonials-grid">
            {testimonials.map((testimonial) => (
              <blockquote className="card-surface sp-testimonial-card" key={testimonial.name + testimonial.company}>
                <p>“{testimonial.quote}”</p>
                <footer>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.company}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Resources offer a secondary path for visitors not ready to convert immediately. */}
        <section className="sp-resources" id="resources" aria-labelledby="resources-title">
          <div className="sp-section-heading">
            <h2 id="resources-title">Resources</h2>
          </div>

          <div className="sp-resources-grid" id="blog">
            {resources.map((resource) => (
              <article className="card-surface sp-resource-card" key={resource.title}>
                <span className="sp-resource-tag">{resource.category}</span>
                <h3>{resource.title}</h3>
                <a className="sp-link" href="#contact">
                  Read More
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Final CTA gives one last obvious conversion path. */}
        <section className="sp-cta" id="contact" aria-labelledby="cta-title">
          <div className="card-surface sp-cta-panel">
            <div>
              <p className="sp-kicker">Ready to start?</p>
              <h2 id="cta-title">Sign up now or log in to continue.</h2>
            </div>

            <div className="sp-cta-actions">
              <Link className="btn btn-primary" to="/login?mode=signup">
                Sign Up
              </Link>
              <Link className="btn btn-secondary" to="/login">
                Log In
              </Link>
              <a className="btn btn-secondary" href="mailto:hello@circlos.example">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="sp-footer" aria-label="Footer">
        <div>
          <Link className="sp-brand" to="/" aria-label="CirclOS home">
            <span className="sp-brand-mark" aria-hidden="true">
              C
            </span>
            <span className="sp-brand-text">CirclOS</span>
          </Link>
          <p>Environmental compliance, green claims, and waste exchange solutions.</p>
        </div>

        <div>
          <h3>Quick links</h3>
          <ul>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">FAQs</a>
            </li>
          </ul>
        </div>

        <div>
          <h3>Social</h3>
          <ul className="sp-social-list" aria-label="Social links">
            <li>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://www.x.com" target="_blank" rel="noreferrer">
                X
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
                YouTube
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3>Newsletter</h3>
          <form className="sp-newsletter" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="sp-newsletter-email">
              Email address
            </label>
            <input id="sp-newsletter-email" type="email" placeholder="Email address" />
            <button className="btn btn-secondary btn-small" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}
