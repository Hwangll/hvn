const heart = <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z" />;
const glyphs = {
  // A heart by day, a four-pointed star by night, a heart again in Part III's red room.
  day: heart,
  night: <path d="M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5-.6-5.6-4.9-9.9-10.5-10.5C7.1 11.4 11.4 7.1 12 1.5z" />,
  ember: heart,
};

/**
 * Reading progress: a hairline along the top that fills with the page's scroll, and a little heart (or star) that rolls
 * along it at its tip. Both are scroll-driven animations, so the compositor runs them; browsers without scroll timelines
 * show neither, and the heart stays home for reduced motion (index.css, scroll-life.css).
 */
export function ReadingProgress({ variant }: { variant: keyof typeof glyphs }) {
  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      <div className="reading-rider-track" aria-hidden="true">
        <svg className={`reading-rider is-${variant}`} viewBox="0 0 24 24">{glyphs[variant]}</svg>
      </div>
    </>
  );
}
