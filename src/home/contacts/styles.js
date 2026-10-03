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
    width: 'clamp(520px, 112vw, 1120px)',
    cursor: 'default',
  },

  starImg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    userSelect: 'none',
    pointerEvents: 'none',
  },

  // Centered over the star's bright core, kept narrower than the
  // star itself so the text never reaches out into its points.
  starText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0 16%',
  },

  introduction: {
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'var(--ink)',
    margin: '0 0 8px',
  },

  refers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '14px',
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'var(--ink)',
  },
};
