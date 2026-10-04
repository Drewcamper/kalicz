export const styles = {
  // No backdrop at all — only a fixed, full-viewport, invisible layer
  // whose one job is to catch a click outside the star and close it.
  // Flex-centers the star so it never needs its own fixed/centering
  // math, and it ignores scroll entirely (no overflow of its own),
  // which is what keeps it pinned to the middle of the screen while
  // the actual page scrolls underneath.
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  starWrap: {
    position: 'relative',
    // 5% larger than the previous 398/85.68vw/857 cap (all three values
    // scaled together so responsive behavior stays consistent).
    width: 'clamp(418px, 89.96vw, 900px)',
    cursor: 'default',
  },

  starImg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    userSelect: 'none',
    pointerEvents: 'none',
  },

  // Positioning context for the two text blocks below. Padding here
  // would NOT inset absolutely-positioned children (they size against
  // the padding box, which equals the border box with no border set —
  // padding only insets in-flow children), so the side margin is set
  // directly on introduction/refers below instead.
  starText: {
    position: 'absolute',
    inset: 0,
  },

  // Pinned at a fixed height (measured against the star's own
  // artwork) rather than centered as a group with the contact block,
  // so repositioning the contact block below never moves this.
  introduction: {
    position: 'absolute',
    top: '39.8%',
    left: '16%',
    right: '16%',
    margin: 0,
    textAlign: 'center',
    fontFamily: "'helvetica-light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 100,
    fontSize: '14px',
    // Tight wrap gap between the two sentences of this one paragraph.
    lineHeight: 1.25,
    color: 'var(--ink)',
  },

  // Centered at 61.5% of the star's height — measured from the
  // reference comp so the phone number (the middle line) lines up
  // with the marked guide — independent of the introduction block.
  refers: {
    position: 'absolute',
    top: '61.5%',
    left: '16%',
    right: '16%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    textAlign: 'center',
    fontFamily: "'helvetica-light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 100,
    fontSize: '14px',
    lineHeight: 1.3,
    color: 'var(--ink)',
  },
};
