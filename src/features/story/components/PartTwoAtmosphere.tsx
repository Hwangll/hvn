export function PartTwoAtmosphere() {
  return (
    <div className="part-two-atmosphere" aria-hidden="true">
      <div className="offline-mood offline-mood-night"><div className="night-lights" data-water-depth="0.6" /></div>
      <div className="offline-mood offline-mood-park" data-offline-mood><div className="park-shadows" data-water-depth="0.25" /></div>
      <div className="offline-mood offline-mood-aquarium" data-offline-mood>
        <div className="water-rays" data-water-depth="1" />
        <div className="water-caustics" data-water-depth="1.5">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
            <path d="M-60 95 C120 15 180 190 370 84 S650 180 850 64 S1090 155 1280 30" />
            <path d="M-80 112 C100 42 215 204 395 99 S690 191 875 86 S1100 182 1280 58" />
            <path d="M-60 250 C130 168 210 305 410 202 S700 283 925 172 S1150 215 1280 115" />
          </svg>
        </div>
        <div className="water-specks" />
      </div>
      <div className="offline-mood offline-mood-cafe" data-offline-mood />
      <div className="offline-mood offline-mood-sunset" data-offline-mood />
      <div className="offline-reading-shade" />
    </div>
  );
}
