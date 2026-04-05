import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const services = [
  {
    title: 'Green Claims Compliance',
    description:
      'Review sustainability messaging, certify claims, and reduce greenwashing risk with clear substantiation workflows.',
    benefits: ['Claim reviews', 'Evidence trails', 'Risk reduction'],
    badge: 'GC',
  },
  {
    title: 'Waste Exchange Services',
    description:
      'Match reusable materials with trusted buyers and generators to unlock circular value from industrial side streams.',
    benefits: ['Buyer matching', 'Material exchange', 'Transaction records'],
    badge: 'WX',
  },
  {
    title: 'Environmental Compliance Consulting',
    description:
      'Get practical guidance on environmental obligations, policies, reporting, and operational compliance readiness.',
    benefits: ['Policy support', 'Audit readiness', 'Tailored advice'],
    badge: 'EC',
  },
]

const resources = [
  {
    title: 'Guide to substantiating eco-friendly product claims',
    category: 'Resources',
    date: 'Updated weekly',
  },
  {
    title: 'How waste exchange reduces disposal costs and emissions',
    category: 'News',
    date: 'Read time: 4 min',
  },
  {
    title: 'Preparing for a stronger environmental compliance audit',
    category: 'Insights',
    date: 'Read time: 6 min',
  },
]

const testimonials = [
  {
    quote:
      'Circlos helped us structure our green claims and align our materials exchange process with a clearer compliance standard.',
    name: 'Operations Director',
    company: 'Regional Manufacturing Group',
  },
  {
    quote:
      'The team understood both sustainability and practical business constraints. Their recommendations were immediate and actionable.',
    name: 'Sustainability Lead',
    company: 'Circular Materials Partner',
  },
]

const clientLogos = ['NorthGrid', 'TerraWorks', 'BlueRoot', 'Alpine Eco', 'NovaCircular']

const steps = [
  {
    title: 'Create your account',
    description: 'Sign up with your company details so we can tailor the workspace to your needs.',
  },
  {
    title: 'Review your priorities',
    description: 'Tell us where you need support: claims, waste exchange, or wider compliance guidance.',
  },
  {
    title: 'Move forward with confidence',
    description: 'Start using Circlos with evidence-driven workflows and expert support.',
  },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'Circlos | Green Compliance & Waste Exchange'
  }, [])

  return (
    <div className="home-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="site-header" aria-label="Primary">
        <Link className="site-brand" to="/" aria-label="Circlos home">
          <span className="site-brand-mark">C</span>
          <span>
            Circl<span>os</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About Us</a>
          <a href="#resources">Resources</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="site-header-actions">
          <a className="btn btn-secondary btn-small" href="#contact">
            Contact Us
          </a>
          <Link className="btn btn-primary btn-small" to="/login?mode=signup">
            Get Started
          </Link>
        </div>
      </header>

      <main id="main-content">
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="eyebrow">Trusted compliance and circular economy support</p>
            <h1>Your Partner in Green Compliance &amp; Waste Exchange</h1>
            <p className="hero-lead">
              Helping businesses meet environmental standards and promote sustainability with clear guidance,
              practical tools, and auditable records.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-primary" to="/login?mode=signup">
                Get Started
              </Link>
              <a className="btn btn-secondary" href="#services">
                Learn More
              </a>
            </div>

            <div className="hero-conversion-card card-surface">
              <strong>Start in minutes</strong>
              <p>
                Create your account, add your company details, and begin reviewing sustainability claims or
                matching material streams.
              </p>
              <Link className="btn btn-primary btn-small" to="/login?mode=signup">
                Create Account
              </Link>
            </div>

            <ul className="hero-highlights" aria-label="Key benefits">
              <li>Evidence-backed green claim reviews</li>
              <li>Smarter material exchange workflows</li>
              <li>Practical environmental compliance support</li>
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80"
                alt=""
              />
            </div>
            <div className="hero-note hero-note-top">
              <strong>Compliance ready</strong>
              <span>Policy, claims, and evidence in one workflow.</span>
            </div>
            <div className="hero-note hero-note-bottom">
              <strong>Circular exchange</strong>
              <span>Connect materials with the right partner faster.</span>
            </div>
          </div>
        </section>

        <section className="stats-strip" aria-label="Circlos highlights">
          <div>
            <strong>24/7</strong>
            <span>Accessibility-focused workflows</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Designed for traceable evidence</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Core service lines for sustainability</span>
          </div>
        </section>

        <section className="info-section" id="about">
          <div className="section-heading">
            <p className="section-kicker">About Us</p>
            <h2>Built for businesses that want trust, clarity, and measurable sustainability.</h2>
          </div>

          <div className="about-grid">
            <div className="about-copy card-surface">
              <p>
                Circlos supports organizations that need to communicate environmental performance clearly while
                keeping compliance practical. We combine compliance guidance, waste exchange processes, and
                sustainability consulting so your team can move with confidence.
              </p>
              <a className="text-link" href="#services">
                Read More
              </a>
            </div>

            <div className="service-points card-surface">
              <ul>
                <li>Green Claim Compliance</li>
                <li>Waste Exchange Programs</li>
                <li>Sustainability Consulting</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <p className="section-kicker">Services Overview</p>
            <h2>Flexible support for compliance, circularity, and environmental operations.</h2>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card card-surface">
                <div className="service-badge" aria-hidden="true">
                  {service.badge}
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul>
                  {service.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
                <a className="text-link" href="#contact">
                  Learn More
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="steps-section" aria-label="Getting started">
          <div className="section-heading">
            <p className="section-kicker">How It Works</p>
            <h2>A simple path from sign-up to action.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="card-surface step-card">
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="credibility-section">
          <div className="section-heading">
            <p className="section-kicker">Why Choose Circlos</p>
            <h2>Experienced, tailored, and built for teams that need practical outcomes.</h2>
          </div>

          <div className="credibility-grid">
            <div className="card-surface credibility-panel">
              <h3>What makes us different</h3>
              <ul className="check-list">
                <li>Experienced team with sustainability and compliance knowledge</li>
                <li>Tailored solutions for different industries and operations</li>
                <li>Certified experts focused on clarity and traceability</li>
              </ul>
            </div>

            <div className="card-surface testimonials-panel">
              <h3>Client feedback</h3>
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.name}>
                  <p>“{testimonial.quote}”</p>
                  <footer>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.company}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="logo-row" aria-label="Client logos">
            {clientLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className="resources-section" id="resources">
          <div className="section-heading">
            <p className="section-kicker">Resources &amp; News</p>
            <h2>Stay current on green claims, waste exchange, and environmental updates.</h2>
          </div>

          <div className="resources-grid">
            {resources.map((resource) => (
              <article key={resource.title} className="resource-card card-surface">
                <span className="resource-tag">{resource.category}</span>
                <h3>{resource.title}</h3>
                <p>{resource.date}</p>
                <a className="text-link" href="#contact">
                  Visit Resources
                </a>
              </article>
            ))}
          </div>
          <div className="section-cta">
            <a className="btn btn-primary" href="#contact">
              Read Our Blog
            </a>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="section-heading">
            <p className="section-kicker">Contact &amp; Call to Action</p>
            <h2>Schedule a consultation with Circlos.</h2>
          </div>

          <div className="contact-grid">
            <form className="card-surface contact-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" placeholder="Your name" />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@company.com" />
              </div>
              <div className="form-field">
                <label htmlFor="message">How can we help?</label>
                <textarea id="message" name="message" rows="5" placeholder="Tell us about your compliance or sustainability goals" />
              </div>
              <button className="btn btn-primary" type="submit">
                Schedule a Consultation
              </button>
            </form>

            <aside className="card-surface contact-details" aria-label="Contact details">
              <h3>Connect with us</h3>
              <p>
                We help teams build a cleaner, more credible path for green claims and circular operations.
              </p>
              <ul>
                <li><strong>Email:</strong> hello@circlos.example</li>
                <li><strong>Phone:</strong> +1 (555) 012-3456</li>
                <li><strong>Office:</strong> 100 Sustainability Way, Klagenfurt</li>
              </ul>
              <a className="btn btn-secondary" href="mailto:hello@circlos.example">
                Contact Us
              </a>
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <div className="site-brand footer-brand">
            <span className="site-brand-mark">C</span>
            <span>
              Circl<span>os</span>
            </span>
          </div>
          <p>
            Compliance services for green claims, waste exchange, and environmental sustainability.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#resources">Resources</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3>Follow</h3>
          <ul>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://www.x.com" target="_blank" rel="noreferrer">X</a></li>
            <li><a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube</a></li>
          </ul>
        </div>

        <div>
          <h3>Newsletter</h3>
          <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Email address" />
            <button className="btn btn-primary" type="submit">Sign Up</button>
          </form>
        </div>
      </footer>
    </div>
  )
}
