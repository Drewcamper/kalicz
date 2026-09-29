export const styles = {
  // The veil: only a faint wash over the rest of the screen, so the
  // site stays visible behind it — matekalicz.com's own two-zone
  // treatment rather than one flat, mostly-opaque scrim.
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    overflowY: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },

  // The near-opaque panel behind the text column.
  panel: {
    position: 'relative',
    minHeight: '100%',
    width: '100%',
    maxWidth: '320px',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '24px 24px 40px',
    cursor: 'default',
  },

  close: {
    // Pushed below the fixed top nav bar (and its border line) so
    // "Close" never sits in the same band as the Menu links, which
    // used to collide with it at narrow/medium viewport widths.
    position: 'absolute',
    top: '76px',
    left: 'calc(100% + 20px)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  introduction: {
    fontSize: '13px',
    lineHeight: 1.7,
    color: 'var(--ink)',
    margin: '0 0 10px',
    maxWidth: '260px',
  },

  refers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '18px',
    paddingTop: '16px',
    borderTop: '1px solid var(--line)',
    fontSize: '13px',
    lineHeight: 1.7,
    color: 'var(--ink)',
    maxWidth: '260px',
  },
};
