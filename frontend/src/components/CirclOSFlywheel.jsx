import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import styles from './CirclOSFlywheel.module.css'

const FLOW_DURATION_SECONDS = 6
const VIEW_BOX_SIZE = 560
const CENTER = VIEW_BOX_SIZE / 2
const RADIUS = 150
const START_ANGLE = -Math.PI / 2
const TAU = Math.PI * 2
const NODE_ACTIVE_WINDOW = 0.085

const steps = [
  { id: 'waste', label: 'Waste Input', description: 'List industrial byproducts' },
  { id: 'matching', label: 'AI Matching', description: 'AI finds qualified buyers' },
  { id: 'transaction', label: 'Material Exchange', description: 'Transfer value and material' },
  { id: 'evidence', label: 'Evidence Record', description: 'Capture auditable proof' },
  { id: 'compliance', label: 'Compliance Output', description: 'Generate defensible claims' },
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

function StageSymbol({ id, className }) {
  if (id === 'matching') {
    return (
      <g className={className}>
        <circle cx="-5.2" cy="-2.5" r="2.2" />
        <circle cx="5.2" cy="-2.5" r="2.2" />
        <circle cx="0" cy="4.2" r="2.2" />
        <path d="M-3.2 -1.1 L-0.9 2.1 M3.2 -1.1 L0.9 2.1 M-3.1 -2.5 H3.1" />
      </g>
    )
  }

  if (id === 'transaction') {
    return (
      <g className={className}>
        <path d="M-6.8 -2.4 H3.4" />
        <path d="M0.8 -5 L3.6 -2.4 L0.8 0.2" />
        <path d="M6.8 2.8 H-3.4" />
        <path d="M-0.8 5.4 L-3.6 2.8 L-0.8 0.2" />
      </g>
    )
  }

  if (id === 'evidence') {
    return (
      <g className={className}>
        <path d="M-5.8 -6 H2.3 L5.8 -2.5 V6 H-5.8 Z" />
        <path d="M2.3 -6 V-2.5 H5.8" />
        <path d="M-3.4 -1.3 H2.5 M-3.4 1.5 H2.5" />
      </g>
    )
  }

  if (id === 'compliance') {
    return (
      <g className={className}>
        <path d="M0 -7.1 L6 -4.9 V-0.6 C6 3.3 3.8 6 0 7.8 C-3.8 6 -6 3.3 -6 -0.6 V-4.9 Z" />
        <path d="M-2.6 0.1 L-0.6 2.2 L2.8 -1.6" />
      </g>
    )
  }

  return (
    <g className={className}>
      <rect x="-7.2" y="-3.5" width="9.2" height="5.3" rx="1.1" />
      <rect x="2" y="-1.8" width="5" height="3.6" rx="0.9" />
      <circle cx="-4.4" cy="3.3" r="1.7" />
      <circle cx="3.8" cy="3.3" r="1.7" />
    </g>
  )
}

function NodeMicroEffect({ id, isActive }) {
  if (id === 'matching') {
    return (
      <motion.g
        className={styles.microStroke}
        initial={false}
        animate={{ opacity: isActive ? 0.92 : 0.36 }}
        transition={{ duration: 0.25 }}
      >
        <motion.path
          d="M-8 17 L0 10 L8 17"
          animate={{ pathLength: isActive ? [0.25, 1] : 0.4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
        <circle cx="-8" cy="17" r="1.5" />
        <circle cx="0" cy="10" r="1.5" />
        <circle cx="8" cy="17" r="1.5" />
      </motion.g>
    )
  }

  if (id === 'transaction') {
    return (
      <motion.g
        className={styles.microStroke}
        initial={false}
        animate={{ opacity: isActive ? 0.95 : 0.32, x: isActive ? [0, 0.8, -0.8, 0] : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <path d="M-8 14 H5" />
        <path d="M2.4 11.6 L5 14 L2.4 16.4" />
        <path d="M8 19 H-5" />
        <path d="M-2.4 16.6 L-5 19 L-2.4 21.4" />
      </motion.g>
    )
  }

  if (id === 'evidence') {
    return (
      <motion.g className={styles.microStroke} initial={false} animate={{ opacity: isActive ? 0.94 : 0.34 }}>
        <rect x="-7.4" y="11" width="10.8" height="9" rx="1.2" />
        <motion.circle
          cx="7.3"
          cy="19"
          r="2.7"
          animate={{ scale: isActive ? [0.9, 1.12, 1] : 1 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />
      </motion.g>
    )
  }

  if (id === 'compliance') {
    return (
      <motion.g
        className={styles.microStroke}
        initial={false}
        animate={{ opacity: isActive ? 0.95 : 0.34, scale: isActive ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.58, ease: 'easeInOut' }}
      >
        <path d="M0 10.8 L6.3 13.2 V17.1 C6.3 20.3 4.4 22.5 0 24.3 C-4.4 22.5 -6.3 20.3 -6.3 17.1 V13.2 Z" />
        <path d="M-2.2 17 L-0.3 18.8 L2.6 15.8" />
      </motion.g>
    )
  }

  return (
    <motion.g
      className={styles.microStroke}
      initial={false}
      animate={{ opacity: isActive ? 0.94 : 0.32, x: isActive ? [0, 1.4, 0] : 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      <rect x="-7" y="12.8" width="9" height="5" rx="0.8" />
      <rect x="2" y="14.2" width="4.4" height="3.6" rx="0.7" />
      <circle cx="-4.2" cy="19.1" r="1.3" />
      <circle cx="3.5" cy="19.1" r="1.3" />
    </motion.g>
  )
}

export default function CirclOSFlywheel() {
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [tokenStageIndex, setTokenStageIndex] = useState(0)
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)

  const progress = useMotionValue(0)
  const cycleProgress = useTransform(progress, (value) => ((value % 1) + 1) % 1)

  const activeRef = useRef(0)
  const tokenRef = useRef(0)
  const mobileRef = useRef(0)

  const nodePoints = useMemo(() => {
    return steps.map((step, index) => {
      const phase = index / steps.length
      const angle = START_ANGLE + phase * TAU
      const directionX = Math.cos(angle)
      const directionY = Math.sin(angle)

      const labelDistance = RADIUS + 56
      const verticalOffset = directionY > 0.5 ? 8 : directionY < -0.5 ? -8 : 2
      const baseLabelX = CENTER + labelDistance * directionX
      const baseLabelY = CENTER + labelDistance * directionY + verticalOffset

      const labelWidth = Math.max(106, step.label.length * 6.9 + 22)
      const labelHeight = 25

      let labelAnchor = 'middle'
      let textX = baseLabelX
      let rectX = baseLabelX - labelWidth / 2

      if (directionX > 0.3) {
        labelAnchor = 'start'
        textX = baseLabelX + 11
        rectX = baseLabelX
      } else if (directionX < -0.3) {
        labelAnchor = 'end'
        textX = baseLabelX - 11
        rectX = baseLabelX - labelWidth
      }

      return {
        ...step,
        phase,
        x: CENTER + RADIUS * directionX,
        y: CENTER + RADIUS * directionY,
        connectorX: CENTER + (RADIUS + 18) * directionX,
        connectorY: CENTER + (RADIUS + 18) * directionY,
        labelX: baseLabelX,
        labelY: baseLabelY,
        labelTextX: textX,
        labelAnchor,
        labelRectX: rectX,
        labelRectY: baseLabelY - labelHeight / 2,
        labelWidth,
        labelHeight,
      }
    })
  }, [])

  const pathDefinition = useMemo(() => buildCircularPath(CENTER, CENTER, RADIUS), [])

  const tokenX = useTransform(cycleProgress, (value) => CENTER + RADIUS * Math.cos(START_ANGLE + value * TAU))
  const tokenY = useTransform(cycleProgress, (value) => CENTER + RADIUS * Math.sin(START_ANGLE + value * TAU))

  const trailAX = useTransform(cycleProgress, (value) => {
    const phase = ((value - 0.024) % 1 + 1) % 1
    return CENTER + RADIUS * Math.cos(START_ANGLE + phase * TAU)
  })
  const trailAY = useTransform(cycleProgress, (value) => {
    const phase = ((value - 0.024) % 1 + 1) % 1
    return CENTER + RADIUS * Math.sin(START_ANGLE + phase * TAU)
  })

  const trailBX = useTransform(cycleProgress, (value) => {
    const phase = ((value - 0.052) % 1 + 1) % 1
    return CENTER + RADIUS * Math.cos(START_ANGLE + phase * TAU)
  })
  const trailBY = useTransform(cycleProgress, (value) => {
    const phase = ((value - 0.052) % 1 + 1) % 1
    return CENTER + RADIUS * Math.sin(START_ANGLE + phase * TAU)
  })

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

    if (tokenRef.current !== nearestNodeIndex) {
      tokenRef.current = nearestNodeIndex
      setTokenStageIndex(nearestNodeIndex)
    }

    const nextActive = nearestDistance <= NODE_ACTIVE_WINDOW ? nearestNodeIndex : -1
    if (activeRef.current !== nextActive) {
      activeRef.current = nextActive
      setActiveIndex(nextActive)
    }
  })

  const highlightedIndex = hoveredIndex ?? activeIndex
  const hoveredStep = hoveredIndex !== null ? nodePoints[hoveredIndex] : null

  return (
    <section className={styles.flywheel} aria-label="CirclOS system flywheel">
      <div
        className={styles.desktopCanvas}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setHoveredIndex(null)
          setIsPaused(false)
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
          className={styles.svgDiagram}
          role="img"
          aria-labelledby="circlos-flywheel-title circlos-flywheel-desc"
        >
          <title id="circlos-flywheel-title">CirclOS Value Flywheel</title>
          <desc id="circlos-flywheel-desc">
            A circular system where waste input, AI matching, material exchange, evidence records, and compliance
            outputs continuously reinforce each other.
          </desc>

          <defs>
            <linearGradient id="flywheel-core-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1F7A63" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.08" />
            </linearGradient>
            <radialGradient id="flywheel-center-gradient" cx="50%" cy="45%" r="72%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#edf8f2" stopOpacity="0.96" />
            </radialGradient>
            <filter id="flywheel-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CENTER} cy={CENTER} r={RADIUS + 34} className={styles.outerAura} />
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 12} className={styles.gridRingStrong} />
          <circle cx={CENTER} cy={CENTER} r={RADIUS - 16} className={styles.gridRingSoft} />
          <path d={pathDefinition} className={styles.flowTrack} />

          {nodePoints.map((step) => (
            <line
              key={`spoke-${step.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={step.x}
              y2={step.y}
              className={styles.centerSpoke}
            />
          ))}

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
                  r="23"
                  className={styles.nodeGlow}
                  animate={{ opacity: isActive ? 0.38 : 0, scale: isActive ? 1.5 : 1 }}
                  transition={{ duration: 0.32 }}
                  style={{ transformOrigin: `${step.x}px ${step.y}px` }}
                />

                <circle cx={step.x} cy={step.y} r="15" className={styles.nodeCircle} />
                <g transform={`translate(${step.x} ${step.y})`}>
                  <StageSymbol id={step.id} className={styles.nodeIcon} />
                  <NodeMicroEffect id={step.id} isActive={isActive} />
                </g>

                <line
                  x1={step.x}
                  y1={step.y}
                  x2={step.connectorX}
                  y2={step.connectorY}
                  className={styles.labelConnector}
                />

                <rect
                  x={step.labelRectX}
                  y={step.labelRectY}
                  width={step.labelWidth}
                  height={step.labelHeight}
                  rx="12.5"
                  className={styles.labelPill}
                />
                <text
                  x={step.labelTextX}
                  y={step.labelY}
                  textAnchor={step.labelAnchor}
                  dominantBaseline="middle"
                  className={styles.nodeLabel}
                >
                  {step.label}
                </text>
              </motion.g>
            )
          })}

          <motion.circle cx={trailBX} cy={trailBY} r="6.3" className={styles.flowTrailFar} />
          <motion.circle cx={trailAX} cy={trailAY} r="8.4" className={styles.flowTrailNear} />

          <motion.g className={styles.flowToken} style={{ x: tokenX, y: tokenY }}>
            <circle r="18" className={styles.flowTokenHalo} filter="url(#flywheel-soft-glow)" />
            <circle r="12.8" className={styles.flowTokenCore} filter="url(#flywheel-soft-glow)" />

            <AnimatePresence mode="wait">
              <motion.g
                key={steps[tokenStageIndex].id}
                className={styles.flowTokenIcon}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.12 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                <StageSymbol id={steps[tokenStageIndex].id} className={styles.tokenIconStroke} />
              </motion.g>
            </AnimatePresence>
          </motion.g>

          <circle cx={CENTER} cy={CENTER} r="90" className={styles.centerHalo} />
          <circle cx={CENTER} cy={CENTER} r="80" className={styles.centerOuter} />
          <circle cx={CENTER} cy={CENTER} r="62" className={styles.centerInner} />
          <text x={CENTER} y={CENTER - 8} textAnchor="middle" className={styles.centerTitle}>
            CirclOS
          </text>
          <text x={CENTER} y={CENTER + 16} textAnchor="middle" className={styles.centerSubtitle}>
            Engine
          </text>
        </svg>

        {hoveredStep ? (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              left: `${(hoveredStep.labelX / VIEW_BOX_SIZE) * 100}%`,
              top: `${(hoveredStep.labelY / VIEW_BOX_SIZE) * 100}%`,
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
                opacity: isActive ? 1 : 0.74,
                scale: isActive ? 1.02 : 1,
                borderColor: isActive ? 'rgba(31, 122, 99, 0.46)' : 'rgba(31, 122, 99, 0.2)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.97)' : 'rgba(255, 255, 255, 0.8)',
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
