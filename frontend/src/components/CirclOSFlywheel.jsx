import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import styles from './CirclOSFlywheel.module.css'

const FLOW_DURATION_SECONDS = 8
const VIEW_BOX_SIZE = 560
const CENTER = VIEW_BOX_SIZE / 2
const RADIUS = 172
const START_ANGLE = -Math.PI / 2
const TAU = Math.PI * 2
const NODE_ACTIVE_WINDOW = 0.075

const steps = [
  { id: 1, label: 'Waste', description: 'List byproducts' },
  { id: 2, label: 'Matching', description: 'AI finds buyers' },
  { id: 3, label: 'Transaction', description: 'Exchange materials' },
  { id: 4, label: 'Evidence', description: 'Record proof' },
  { id: 5, label: 'Compliance', description: 'Generate claims' },
]

function buildCircularPath(cx, cy, radius) {
  return [
    `M ${cx} ${cy - radius}`,
    `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
    `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
  ].join(' ')
}

function circularDistance(a, b) {
  const difference = Math.abs(a - b)
  return Math.min(difference, 1 - difference)
}

export default function CirclOSFlywheel() {
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)

  const progress = useMotionValue(0)
  const cycleProgress = useTransform(progress, (value) => ((value % 1) + 1) % 1)

  const activeRef = useRef(0)
  const mobileRef = useRef(0)

  const nodePoints = useMemo(() => {
    return steps.map((step, index) => {
      const phase = index / steps.length
      const angle = START_ANGLE + phase * TAU

      const directionX = Math.cos(angle)
      const directionY = Math.sin(angle)

      let labelAnchor = 'middle'
      let labelShiftX = 0

      if (directionX > 0.35) {
        labelAnchor = 'start'
        labelShiftX = 8
      } else if (directionX < -0.35) {
        labelAnchor = 'end'
        labelShiftX = -8
      }

      const labelShiftY = directionY > 0.45 ? 8 : directionY < -0.45 ? -8 : 3

      return {
        ...step,
        phase,
        x: CENTER + RADIUS * directionX,
        y: CENTER + RADIUS * directionY,
        connectorX: CENTER + (RADIUS + 24) * directionX,
        connectorY: CENTER + (RADIUS + 24) * directionY,
        labelX: CENTER + (RADIUS + 62) * directionX,
        labelY: CENTER + (RADIUS + 62) * directionY,
        labelAnchor,
        labelShiftX,
        labelShiftY,
      }
    })
  }, [])

  const pathDefinition = useMemo(() => buildCircularPath(CENTER, CENTER, RADIUS), [])

  const dotX = useTransform(cycleProgress, (value) => CENTER + RADIUS * Math.cos(START_ANGLE + value * TAU))
  const dotY = useTransform(cycleProgress, (value) => CENTER + RADIUS * Math.sin(START_ANGLE + value * TAU))

  useEffect(() => {
    if (isPaused) {
      return undefined
    }

    const controls = animate(progress, progress.get() + 1, {
      duration: FLOW_DURATION_SECONDS,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    })

    return () => controls.stop()
  }, [isPaused, progress])

  useMotionValueEvent(cycleProgress, 'change', (value) => {
    const currentMobileIndex = Math.floor(value * steps.length) % steps.length
    if (mobileRef.current !== currentMobileIndex) {
      mobileRef.current = currentMobileIndex
      setMobileActiveIndex(currentMobileIndex)
    }

    let nearestNodeIndex = 0
    let nearestDistance = 1

    nodePoints.forEach((node, index) => {
      const distance = circularDistance(value, node.phase)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestNodeIndex = index
      }
    })

    const nextActive = nearestDistance <= NODE_ACTIVE_WINDOW ? nearestNodeIndex : -1
    if (activeRef.current !== nextActive) {
      activeRef.current = nextActive
      setActiveIndex(nextActive)
    }
  })

  const highlightedIndex = hoveredIndex ?? activeIndex
  const hoveredStep = hoveredIndex !== null ? nodePoints[hoveredIndex] : null

  return (
    <section className={styles.flywheel} aria-label="CirclOS flywheel system">
      <div
        className={styles.desktopCanvas}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false)
          setHoveredIndex(null)
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
          className={styles.svgDiagram}
          role="img"
          aria-labelledby="flywheel-title flywheel-description"
        >
          <title id="flywheel-title">CirclOS Engine Data Flywheel</title>
          <desc id="flywheel-description">
            Circular flow from waste to matching, transaction, evidence, compliance, and back into improved waste
            exchange.
          </desc>

          <defs>
            <linearGradient id="flywheel-core-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1F7A63" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="flywheel-center-gradient" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#edf7f2" stopOpacity="0.95" />
            </radialGradient>
            <filter id="flywheel-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CENTER} cy={CENTER} r={RADIUS + 26} className={styles.outerAura} />
          <path d={pathDefinition} className={styles.flowTrack} />

          {nodePoints.map((step, index) => {
            const isActive = highlightedIndex === index

            return (
              <motion.g
                key={step.id}
                className={styles.nodeGroup}
                style={{ transformOrigin: `${step.x}px ${step.y}px` }}
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => {
                  setHoveredIndex(index)
                  setIsPaused(true)
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null)
                  setIsPaused(false)
                }}
              >
                <motion.circle
                  cx={step.x}
                  cy={step.y}
                  r="22"
                  className={styles.nodeGlow}
                  animate={{ opacity: isActive ? 0.3 : 0, scale: isActive ? 1.45 : 1 }}
                  transition={{ duration: 0.32 }}
                  style={{ transformOrigin: `${step.x}px ${step.y}px` }}
                />
                <circle cx={step.x} cy={step.y} r="14" className={styles.nodeCircle} />
                <circle cx={step.x} cy={step.y} r="4.8" className={styles.nodeCore} />
                <line x1={step.x} y1={step.y} x2={step.connectorX} y2={step.connectorY} className={styles.labelConnector} />
                <text
                  x={step.labelX + step.labelShiftX}
                  y={step.labelY + step.labelShiftY}
                  textAnchor={step.labelAnchor}
                  dominantBaseline="middle"
                  className={styles.nodeLabel}
                >
                  {step.label}
                </text>
              </motion.g>
            )
          })}

          <motion.circle
            cx={dotX}
            cy={dotY}
            r="13"
            className={styles.flowPulse}
            filter="url(#flywheel-soft-glow)"
          />
          <motion.circle
            cx={dotX}
            cy={dotY}
            r="6.5"
            className={styles.flowDot}
            filter="url(#flywheel-soft-glow)"
          />

          <circle cx={CENTER} cy={CENTER} r="84" className={styles.centerHalo} />
          <circle cx={CENTER} cy={CENTER} r="76" className={styles.centerOuter} />
          <circle cx={CENTER} cy={CENTER} r="58" className={styles.centerInner} />
          <text x={CENTER} y={CENTER - 6} textAnchor="middle" className={styles.centerTitle}>
            CirclOS
          </text>
          <text x={CENTER} y={CENTER + 16} textAnchor="middle" className={styles.centerSubtitle}>
            Engine
          </text>
        </svg>

        {hoveredStep ? (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              left: `${(hoveredStep.x / VIEW_BOX_SIZE) * 100}%`,
              top: `${(hoveredStep.y / VIEW_BOX_SIZE) * 100}%`,
            }}
            role="status"
          >
            <p className={styles.tooltipTitle}>{hoveredStep.label}</p>
            <p className={styles.tooltipText}>{hoveredStep.description}</p>
          </motion.div>
        ) : null}
      </div>

      <ol className={styles.mobileFlow} aria-label="CirclOS flywheel steps">
        {steps.map((step, index) => {
          const isActive = mobileActiveIndex === index
          return (
            <motion.li
              key={step.id}
              className={styles.mobileStep}
              animate={{
                opacity: isActive ? 1 : 0.72,
                scale: isActive ? 1.015 : 1,
                borderColor: isActive ? 'rgba(31, 122, 99, 0.45)' : 'rgba(31, 122, 99, 0.18)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.78)',
              }}
              transition={{ duration: 0.3 }}
            >
              <span className={styles.mobileDot} />
              <div>
                <p className={styles.mobileLabel}>{step.label}</p>
                <p className={styles.mobileDescription}>{step.description}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
