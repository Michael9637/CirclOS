import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import CirclOSFlywheel from '../components/CirclOSFlywheel'
import { getListings, apiConfigError } from '../api'
import { useAuth } from '../components/useAuth'
import styles from './HomePage.module.css'

const navItems = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Resources', href: '#resources' },
]

const toolPages = [
  { id: 'waste', label: 'Waste', path: '/app/list' },
  { id: 'compliance', label: 'Compliance', path: '/app/compliance' },
  { id: 'scanner', label: 'Scanner', path: '/app/scanner' },
  { id: 'evidence', label: 'Evidence', path: '/app/evidence' },
]

const trustMetrics = [
  {
    id: 'sme-count',
    value: '500+',
    label: 'SMEs',
    description: 'Manufacturing teams onboarded',
  },
  {
    id: 'waste-value',
    value: 'EUR 12M+',
    label: 'Waste Value Unlocked',
    description: 'Recovered through circular transactions',
  },
  {
    id: 'compliance-ready',
    value: 'ECGT-Ready',
    label: 'Compliance Workflows',
    description: 'Structured for defensible claims',
  },
]

const valuePillars = [
  {
    id: 'waste-exchange',
    icon: 'waste',
    title: 'Waste Exchange',
    description: 'List and monetize industrial byproducts.',
  },
  {
    id: 'matching-engine',
    icon: 'matching',
    title: 'AI Matching Engine',
    description: 'Find optimal buyers using intelligent ranking.',
  },
  {
    id: 'compliance-dashboard',
    icon: 'compliance',
    title: 'Compliance Dashboard',
    description: 'Generate legally defensible sustainability claims automatically.',
  },
]

const flywheelSteps = [
  {
    id: 'step-1',
    title: 'List waste streams',
    detail: 'Upload material type, quality, and location.',
  },
  {
    id: 'step-2',
    title: 'AI finds matches',
    detail: 'Model ranks best-fit buyers by reuse and logistics.',
  },
  {
    id: 'step-3',
    title: 'Complete transaction',
    detail: 'Confirm quantity, timing, and transfer terms.',
  },
  {
    id: 'step-4',
    title: 'Evidence record generated',
    detail: 'System stores an auditable evidence trail.',
  },
  {
    id: 'step-5',
    title: 'Compliance automatically created',
    detail: 'Claims and compliance outputs are generated automatically.',
  },
]

const solutionSegments = [
  {
    id: 'smes',
    title: 'For SMEs',
    subtitle: 'Reduce cost pressure while staying compliant.',
    points: [
      'Lower disposal spend with faster byproduct resale.',
      'Track value recovery and compliance in one interface.',
      'Run with lean teams using guided workflows.',
    ],
  },
  {
    id: 'enterprise',
    title: 'For Enterprise / CSRD Teams',
    subtitle: 'Build trusted supply chain data at scale.',
    points: [
      'Connect sites and suppliers under shared standards.',
      'Surface transaction evidence for reporting and assurance.',
      'Integrate data pipelines through API-ready architecture.',
    ],
  },
]

const testimonials = [
  {
    id: 'testimonial-1',
    name: 'Amira Novak',
    role: 'Operations Director',
    company: 'NordFab Components',
    quote:
      'CirclOS cut our disposal spend and created a clear path to revenue from materials we used to treat as waste.',
  },
  {
    id: 'testimonial-2',
    name: 'Jonas Meyer',
    role: 'Head of Compliance',
    company: 'Helion Manufacturing',
    quote:
      'The compliance dashboard gives us defensible claims evidence without slowing down commercial teams.',
  },
  {
    id: 'testimonial-3',
    name: 'Laura Chen',
    role: 'Sustainability Manager',
    company: 'Arcus Industrial Group',
    quote:
      'The AI matching workflow improved transaction speed and gave leadership better visibility into circularity KPIs.',
  },
]

const resources = [
  {
    id: 'resource-1',
    category: 'Guide',
    title: 'ECGT Compliance Guide',
    description: 'Map your sustainability claims to verifiable evidence records.',
  },
  {
    id: 'resource-2',
    category: 'Playbook',
    title: 'Circular Economy Playbook',
    description: 'Practical rollout framework for plant-by-plant waste monetization.',
  },
  {
    id: 'resource-3',
    category: 'Case Studies',
    title: 'Case Studies',
    description: 'See how peers reduced cost, accelerated deals, and improved compliance.',
  },
]

const footerLinks = [
  { label: 'Solutions', href: '#solutions' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
]

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'social-icon' },
  { label: 'X', href: 'https://www.x.com', icon: 'x-icon' },
  { label: 'YouTube', href: 'https://www.youtube.com', icon: 'social-icon' },
]

const sectionReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

function PillarIcon({ name }) {
  if (name === 'matching') {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="AI Matching icon">
        <path d="M5 12h5l2-4 3 8 2-4h2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="19" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }

  if (name === 'compliance') {
    return (
      <svg viewBox="0 0 24 24" role="img" aria-label="Compliance icon">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="Waste Exchange icon">
      <path d="M8 7h8l1 11H7L8 7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 7V5a2 2 0 114 0v2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9 11h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function FooterSocialIcon({ symbolId }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.socialIconGraphic}>
      <use href={`/icons.svg#${symbolId}`} />
    </svg>
  )
}

function SectionHeader({ kicker, title, description, center = false }) {
  return (
    <div className={`${styles.sectionHeader} ${center ? styles.centered : ''}`}>
      {kicker ? <p className={styles.sectionKicker}>{kicker}</p> : null}
      <h2 className={styles.sectionTitle}>{title}</h2>
      {description ? <p className={styles.sectionDescription}>{description}</p> : null}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user, supabase } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [liveListingCount, setLiveListingCount] = useState(null)
  const [isListingCountLoading, setIsListingCountLoading] = useState(false)

  const accountName = user?.email?.split('@')[0] || 'User'
  const isLoggedIn = Boolean(user)

  const visibleTrustMetrics = useMemo(() => {
    if (typeof liveListingCount !== 'number') {
      return trustMetrics
    }

    return trustMetrics.map((metric) => {
      if (metric.id !== 'sme-count') {
        return metric
      }

      return {
        ...metric,
        value: `${liveListingCount}+`,
        label: 'Active Listings',
        description: 'Live supply listings synced from the CirclOS API',
      }
    })
  }, [liveListingCount])

  useEffect(() => {
    document.title = 'CirclOS | Industrial Waste Exchange and ECGT Compliance'

    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.setAttribute('name', 'description')
      document.head.appendChild(descriptionTag)
    }

    descriptionTag.setAttribute(
      'content',
      'CirclOS helps manufacturing SMEs turn industrial waste into revenue while creating legally defensible sustainability claims.',
    )
  }, [])

  useEffect(() => {
    const closeMenuOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeMenuOnEscape)
    return () => window.removeEventListener('keydown', closeMenuOnEscape)
  }, [])

  useEffect(() => {
    let ignore = false

    if (apiConfigError) {
      return () => {
        ignore = true
      }
    }

    setIsListingCountLoading(true)

    getListings()
      .then((listings) => {
        if (ignore || !Array.isArray(listings)) {
          return
        }

        setLiveListingCount(listings.length)
      })
      .catch(() => {
        if (!ignore) {
          setLiveListingCount(null)
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsListingCountLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const goTo = (path) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  const logout = async () => {
    setIsMenuOpen(false)

    if (supabase?.auth) {
      await supabase.auth.signOut()
    }

    navigate('/')
  }

  const openToolPage = (path) => {
    if (user) {
      goTo(path)
      return
    }

    goTo('/login')
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className={`${styles.page} ${isLoggedIn ? styles.pageSignedIn : ''}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => goTo('/')}
            aria-label="Go to CirclOS homepage"
          >
            <span className={styles.brandMark}>C</span>
            <span className={styles.brandName}>CirclOS</span>
          </button>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={styles.menuToggleBar} />
            <span className={styles.menuToggleBar} />
            <span className={styles.menuToggleBar} />
          </button>

          <nav
            id="primary-navigation"
            aria-label="Primary"
            className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}
          >
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={closeMenu} className={styles.navLink}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={`${styles.actions} ${isMenuOpen ? styles.actionsOpen : ''}`}>
            {isLoggedIn ? (
              <>
                <p className={styles.headerGreeting} aria-live="polite">
                  Welcome, {accountName}!
                </p>
                <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={logout}>
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button type="button" className={`${styles.button} ${styles.buttonGhost}`} onClick={() => goTo('/login')}>
                  Log In
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={() => goTo('/login?mode=signup')}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {isLoggedIn ? (
        <section className={styles.sessionStrip} aria-label="Logged in navigation shortcuts">
          <div className={styles.sessionStripInner}>
            <p className={styles.sessionStripStatus}>
              Signed in. Move between tools quickly and return to Home any time.
            </p>
            <div className={styles.sessionStripActions}>
              {toolPages.map((toolPage) => (
                <button
                  key={toolPage.id}
                  type="button"
                  className={`${styles.button} ${styles.buttonGhost} ${styles.sessionToolButton}`}
                  onClick={() => openToolPage(toolPage.path)}
                >
                  {toolPage.label}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary} ${styles.sessionHomeButton}`}
                onClick={() => goTo('/')}
              >
                Home
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <main id="main-content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className={styles.heroKicker}>Dual-product platform for circular manufacturing growth</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Turn Industrial Waste into Revenue - and Verified Compliance
            </h1>
            <p className={styles.heroSubtitle}>
              Reduce disposal costs, generate new revenue from byproducts, and stay compliant with EU anti-greenwashing
              requirements through evidence-backed workflows.
            </p>
            <p className={styles.heroStatus} role="status" aria-live="polite">
              {isLoggedIn ? `Signed in as ${accountName}` : 'Sign in to access Waste, Compliance, Scanner, and Evidence tools.'}
            </p>
            <div className={styles.heroCtas}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLarge} ${styles.heroCtaFull}`}
                onClick={() => goTo(isLoggedIn ? '/app/dashboard' : '/login?mode=signup')}
              >
                {isLoggedIn ? 'Open Dashboard' : 'Get Started'}
              </button>
            </div>
            <ul className={styles.heroFlowList} aria-label="Core CirclOS flow">
              <li>Waste</li>
              <li>AI Matching</li>
              <li>Transaction</li>
              <li>Evidence Record</li>
              <li>Compliance</li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.12 }}
          >
            <CirclOSFlywheel />
          </motion.div>
        </section>

        <motion.section
          className={styles.trustBar}
          aria-label="Trust metrics"
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <ul className={styles.metricGrid}>
            {visibleTrustMetrics.map((metric) => (
              <li key={metric.id} className={styles.metricCard}>
                <p className={styles.metricValue}>{metric.value}</p>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricDescription}>{metric.description}</p>
              </li>
            ))}
          </ul>
          {isListingCountLoading ? <p className={styles.liveDataHint}>Syncing live listing data...</p> : null}
          {!isListingCountLoading && typeof liveListingCount === 'number' ? (
            <p className={styles.liveDataHint}>Live API data connected: {liveListingCount} active listings.</p>
          ) : null}
        </motion.section>

        <motion.section
          id="solutions"
          className={styles.sectionShell}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <SectionHeader
            kicker="Core capabilities"
            title="One platform for circular transactions and defensible compliance"
            description="CirclOS connects operational teams, commercial workflows, and compliance requirements across a single data foundation."
            center
          />

          <motion.div
            className={styles.pillarGrid}
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {valuePillars.map((pillar) => (
              <motion.article
                key={pillar.id}
                className={styles.pillarCard}
                variants={cardReveal}
                whileHover={{ y: -8, boxShadow: '0 18px 30px rgba(31, 122, 99, 0.18)' }}
              >
                <div className={styles.pillarIconWrap}>
                  <PillarIcon name={pillar.icon} />
                </div>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarText}>{pillar.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="how-it-works"
          className={styles.sectionShell}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <SectionHeader
            kicker="How it works"
            title="A flywheel where every transaction strengthens future compliance"
            description="CirclOS transforms each waste transaction into richer evidence, smarter matching inputs, and stronger compliance outputs."
          />

          <div className={styles.flowLayout}>
            <ol className={styles.flowList}>
              {flywheelSteps.map((step, index) => (
                <li key={step.id} className={styles.flowItem}>
                  <span className={styles.flowNumber}>{index + 1}</span>
                  <div className={styles.flowContent}>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <aside className={styles.flywheelPanel} aria-label="Data flywheel explanation">
              <h3>Data Flywheel + Shared Profit</h3>
              <p>
                Waste sellers create new revenue while buyers lower input costs. Each confirmed exchange writes
                evidence records that make sustainability claims safer and faster.
              </p>
              <ul className={styles.flywheelBenefitList}>
                <li>Seller converts disposal spend into sales income.</li>
                <li>Buyer secures lower cost industrial feedstock.</li>
                <li>Both sides get auditable compliance proof.</li>
              </ul>
              <p className={styles.flywheelLine}>Waste -&gt; Sale -&gt; Shared profit -&gt; Evidence -&gt; Better next match</p>
            </aside>
          </div>
        </motion.section>

        <motion.section
          className={styles.sectionShell}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <SectionHeader
            kicker="Solutions"
            title="Built for SMEs and enterprise sustainability programs"
            description="Deploy the same core workflow across lean operations teams and complex CSRD reporting environments."
            center
          />

          <div className={styles.solutionGrid}>
            {solutionSegments.map((segment) => (
              <motion.article key={segment.id} className={styles.solutionCard} whileHover={{ y: -6 }}>
                <img
                  src="/favicon.svg"
                  alt={`${segment.title} illustration`}
                  loading="lazy"
                  decoding="async"
                  className={styles.solutionImage}
                />
                <h3>{segment.title}</h3>
                <p className={styles.solutionSubtitle}>{segment.subtitle}</p>
                <ul>
                  {segment.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.sectionShell}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <SectionHeader
            kicker="Testimonials"
            title="Teams use CirclOS to cut costs and simplify compliance"
            center
          />

          <motion.div
            className={styles.testimonialGrid}
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {testimonials.map((testimonial) => (
              <motion.blockquote key={testimonial.id} className={styles.testimonialCard} variants={cardReveal}>
                <p className={styles.quoteMark}>"</p>
                <p className={styles.testimonialQuote}>{testimonial.quote}</p>
                <footer>
                  <p className={styles.testimonialName}>{testimonial.name}</p>
                  <p className={styles.testimonialMeta}>
                    {testimonial.role} - {testimonial.company}
                  </p>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="resources"
          className={styles.sectionShell}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <SectionHeader
            kicker="Resources"
            title="Tools to help your team ship circularity faster"
            center
          />

          <div className={styles.resourceGrid}>
            {resources.map((resource) => (
              <motion.article key={resource.id} className={styles.resourceCard} whileHover={{ y: -6 }}>
                <p className={styles.resourceCategory}>{resource.category}</p>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a href="#contact" className={styles.resourceLink}>
                  Explore Resource
                </a>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className={styles.finalCta}
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2>Start Building a Circular Operation Today</h2>
          <p>Launch quickly with guided onboarding, then scale to enterprise-grade reporting when you are ready.</p>
          <div className={styles.finalCtaActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonLarge}`}
              onClick={() => goTo(isLoggedIn ? '/app/dashboard' : '/login?mode=signup')}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </button>
            <a href="mailto:sales@circlos.com" className={`${styles.button} ${styles.buttonGhost}`}>
              Contact Sales
            </a>
          </div>
        </motion.section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <button
              type="button"
              className={styles.brand}
              onClick={() => goTo('/')}
              aria-label="Go to CirclOS homepage"
            >
              <span className={styles.brandMark}>C</span>
              <span className={styles.brandName}>CirclOS</span>
            </button>
            <p className={styles.footerCopy}>
              Turn industrial waste into revenue and legally defensible sustainability claims.
            </p>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Navigation</h3>
            <ul className={styles.footerList}>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Follow</h3>
            <ul className={styles.socialList}>
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noreferrer" className={styles.socialLink}>
                    <span className={styles.socialIcon}>
                      <FooterSocialIcon symbolId={social.icon} />
                    </span>
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={styles.footerHeading}>Newsletter</h3>
            <form className={styles.newsletterForm} onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="newsletter-email" className={styles.srOnly}>
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Work email"
                className={styles.newsletterInput}
              />
              <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>{new Date().getFullYear()} CirclOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
