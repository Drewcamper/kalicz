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
    // Moved down from the previous 39.8%.
    top: '45%',
    left: '16%',
    right: '16%',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Small explicit gap between the two sentence lines — same fluid
    // scale as refers' inter-line gap below, instead of relying on
    // lineHeight wrap spacing.
    gap: 'clamp(2px, 0.3vw, 4px)',
    textAlign: 'center',
    fontFamily: "'helvetica-light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 100,
    // Fluid, tied to the same 89.96vw the star itself scales with (14px
    // at the star's 900px cap). An 8.5px floor — down from an earlier
    // 10px, which still read a bit large/cramped against the star's
    // narrower phone width — keeps it legible but more delicate on
    // phones, where the floor is what actually governs the size (the
    // vw term stays well under the floor at any real phone width).
    fontSize: 'clamp(8.5px, 1.2vw, 14px)',
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
    // Fluid like introduction's fontSize below, so the gap between the
    // three contact lines shrinks together with the text on phones.
    gap: 'clamp(2px, 0.3vw, 3px)',
    textAlign: 'center',
    fontFamily: "'helvetica-light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 100,
    // Same fluid scale as introduction — see its comment.
    fontSize: 'clamp(8.5px, 1.2vw, 14px)',
    lineHeight: 1.3,
    color: 'var(--ink)',
  },
};
