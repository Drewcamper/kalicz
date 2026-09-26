export const styles = {
  container: {
    // The Menu bar above it now takes real space (it's no longer a
    // fixed overlay), so the slideshow only needs to fill what's left
    // of the viewport.
    height: 'calc(100dvh - var(--nav-h, 47px))',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '48px 20px',
  },
  // Used when the slideshow is embedded inside a category page
  // (Event / Table / On Set) instead of owning the full viewport.
  embeddedContainer: {
    height: '100%',
    padding: '0',
  },
  image: {},
};
