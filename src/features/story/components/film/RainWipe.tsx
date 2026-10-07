import { useEffect, useRef } from "react";

/** How long a wiped patch stays clear, and how long it then takes to mist over again (ms). */
const HOLD = 3000;
const FADE = 3600;
/** A drop runs down the mist every so often while the window is in view (ms between them). */
const DRIP_GAP = [2400, 5200] as const;

interface Point {
  x: number;
  y: number;
}

/** One sweep of the hand: the path it wiped and when it last moved. */
interface Stroke {
  points: Point[];
  at: number;
}

/** A drop running down the glass, leaving a clear trail behind it that mists over in its turn. */
interface Drip {
  x: number;
  y: number;
  speed: number;
  seed: number;
  trail: Point[];
  born: number;
  until: number;
}

/** How clear a patch wiped `age` ms ago still is: fully for a while, then misting over. */
function clarity(age: number, hold = HOLD) {
  if (age < hold) return 1;
  const t = (age - hold) / FADE;
  return t >= 1 ? 0 : 1 - t * t;
}

/**
 * 15/9, the karaoke on Nguyễn Văn Lộc: the window onto the rainy street is misted over from inside, a line written in
 * the mist with a fingertip and running at the letters, now and then a drop running down it. The reader can wipe it
 * clear (moving the mouse over it, or swiping across it on a phone; an upward or downward swipe still scrolls the
 * page) and see the street's lights out of focus beyond the glass. Left alone, it mists over again. The mist is
 * painted once the window first comes into view, and nothing runs while it is out of view.
 */
export function RainWipe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return undefined;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let context: CanvasRenderingContext2D | null = null;
    let mist: HTMLCanvasElement | null = null;
    let ratio = 1;
    let frame = 0;
    let visible = false;
    let started = false;
    let live = true;
    let nextDrip = 0;
    let lastMove = 0;
    const strokes: Stroke[] = [];
    const drips: Drip[] = [];

    // The mist, painted once off screen: a milky breath on the glass, uneven and heavier low down, beaded with
    // condensation, a few larger drops in it, and a line written in it with a fingertip, running at its letters.
    const paintMist = (width: number, height: number) => {
      const sheet = document.createElement("canvas");
      sheet.width = width;
      sheet.height = height;
      const ink = sheet.getContext("2d");
      if (!ink) return null;
      const haze = ink.createLinearGradient(0, 0, 0, height);
      // Warmed by the room's pink light behind the reader.
      haze.addColorStop(0, "rgba(214, 200, 220, 0.42)");
      haze.addColorStop(0.6, "rgba(220, 206, 224, 0.54)");
      haze.addColorStop(1, "rgba(228, 214, 228, 0.66)");
      ink.fillStyle = haze;
      ink.fillRect(0, 0, width, height);
      // Uneven breath: soft clouds of it, thicker in some places than others.
      for (let i = 0; i < 26; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = (0.12 + Math.random() * 0.28) * width;
        const cloud = ink.createRadialGradient(x, y, 0, x, y, r);
        const thick = Math.random() < 0.6;
        cloud.addColorStop(0, thick ? "rgba(236, 240, 246, 0.16)" : "rgba(0, 0, 0, 0.12)");
        cloud.addColorStop(1, "rgba(0, 0, 0, 0)");
        ink.globalCompositeOperation = thick ? "source-over" : "destination-out";
        ink.fillStyle = cloud;
        ink.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // Condensation: fine beads, each a little clearer than the mist round it, lit on top and shaded under.
      const beads = Math.round((width * height) / (240 * ratio * ratio));
      for (let i = 0; i < beads; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = (0.5 + Math.random() * 1.3) * ratio;
        ink.globalCompositeOperation = "destination-out";
        ink.fillStyle = "rgba(0, 0, 0, 0.42)";
        ink.beginPath();
        ink.arc(x, y, r, 0, Math.PI * 2);
        ink.fill();
        ink.globalCompositeOperation = "source-over";
        ink.fillStyle = "rgba(255, 255, 255, 0.4)";
        ink.beginPath();
        ink.arc(x - r * 0.3, y - r * 0.35, r * 0.45, 0, Math.PI * 2);
        ink.fill();
      }
      // A few big drops, clear through, the light caught along their tops.
      for (let i = 0; i < 12; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = (0.008 + Math.random() * 0.014) * width;
        ink.globalCompositeOperation = "destination-out";
        ink.fillStyle = "rgba(0, 0, 0, 0.88)";
        ink.beginPath();
        ink.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2);
        ink.fill();
        ink.globalCompositeOperation = "source-over";
        ink.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ink.lineWidth = Math.max(1, r * 0.22);
        ink.beginPath();
        ink.arc(x, y, r * 0.86, Math.PI * 1.1, Math.PI * 1.75);
        ink.stroke();
        ink.strokeStyle = "rgba(20, 28, 40, 0.3)";
        ink.beginPath();
        ink.arc(x, y, r, Math.PI * 0.15, Math.PI * 0.85);
        ink.stroke();
      }
      // The line in the mist, and the drops that ran down from it.
      const size = Math.round(height * 0.17);
      ink.globalCompositeOperation = "destination-out";
      ink.font = `700 ${size}px "Dancing Script", cursive`;
      ink.textAlign = "center";
      ink.textBaseline = "middle";
      ink.fillStyle = "rgba(0, 0, 0, 0.85)";
      ink.save();
      ink.translate(width * 0.36, height * 0.4);
      ink.rotate(-0.08);
      ink.fillText("lau kính đi", 0, 0);
      const span = ink.measureText("lau kính đi").width;
      ink.lineCap = "round";
      for (const [at, length] of [[-0.36, 0.2], [-0.05, 0.12], [0.18, 0.28], [0.41, 0.16]]) {
        const x = at * span;
        const y = size * 0.32;
        ink.strokeStyle = "rgba(0, 0, 0, 0.78)";
        ink.lineWidth = Math.max(1.2, size * 0.07);
        ink.beginPath();
        ink.moveTo(x, y);
        ink.quadraticCurveTo(x + size * 0.04, y + length * height * 0.5, x - size * 0.02, y + length * height);
        ink.stroke();
        ink.fillStyle = "rgba(0, 0, 0, 0.85)";
        ink.beginPath();
        ink.arc(x - size * 0.02, y + length * height, size * 0.08, 0, Math.PI * 2);
        ink.fill();
      }
      ink.restore();
      ink.globalCompositeOperation = "source-over";
      return sheet;
    };

    // The glass each frame: the mist, less every patch and trail still clear, and the drops running down it.
    const render = (now: number) => {
      const glass = context;
      if (!glass || !mist) return;
      glass.globalCompositeOperation = "source-over";
      glass.clearRect(0, 0, canvas.width, canvas.height);
      glass.drawImage(mist, 0, 0);
      glass.globalCompositeOperation = "destination-out";
      glass.lineCap = "round";
      glass.lineJoin = "round";
      const brush = canvas.width * 0.15;
      for (const stroke of strokes) {
        const clear = clarity(now - stroke.at);
        // A soft edge round a clear middle, as a sleeve leaves it.
        for (const [width, alpha] of [[brush * 1.5, 0.3], [brush, 0.92]] as const) {
          glass.strokeStyle = `rgba(0, 0, 0, ${(alpha * clear).toFixed(3)})`;
          glass.lineWidth = width;
          glass.beginPath();
          stroke.points.forEach((point, index) => (index ? glass.lineTo(point.x, point.y) : glass.moveTo(point.x, point.y + 0.01)));
          if (stroke.points.length === 1) glass.lineTo(stroke.points[0].x + 0.01, stroke.points[0].y);
          glass.stroke();
        }
      }
      for (const drip of drips) {
        const clear = clarity(now - drip.born, HOLD * 1.2);
        glass.strokeStyle = `rgba(0, 0, 0, ${(0.62 * clear).toFixed(3)})`;
        glass.lineWidth = 1.5 * ratio;
        glass.beginPath();
        drip.trail.forEach((point, index) => (index ? glass.lineTo(point.x, point.y) : glass.moveTo(point.x, point.y)));
        glass.stroke();
      }
      glass.globalCompositeOperation = "source-over";
      for (const drip of drips) {
        if (now > drip.until) continue;
        const r = 2.2 * ratio;
        const bead = glass.createRadialGradient(drip.x - r * 0.35, drip.y - r * 0.4, 0, drip.x, drip.y, r);
        bead.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        bead.addColorStop(0.45, "rgba(214, 228, 244, 0.5)");
        bead.addColorStop(1, "rgba(30, 40, 56, 0.35)");
        glass.fillStyle = bead;
        glass.beginPath();
        glass.ellipse(drip.x, drip.y, r, r * 1.2, 0, 0, Math.PI * 2);
        glass.fill();
      }
    };

    let last = 0;
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!still && now >= nextDrip && canvas.height && drips.filter((drip) => now <= drip.until).length < 2) {
        drips.push({
          x: (0.08 + Math.random() * 0.84) * canvas.width,
          y: Math.random() * 0.45 * canvas.height,
          speed: (0.035 + Math.random() * 0.04) * ratio,
          seed: Math.random() * 10,
          trail: [],
          born: now,
          until: Infinity,
        });
        nextDrip = now + DRIP_GAP[0] + Math.random() * (DRIP_GAP[1] - DRIP_GAP[0]);
      }
      // A drop runs in fits and starts, wandering a little, until it leaves the bottom of the glass.
      for (const drip of drips) {
        if (now > drip.until) continue;
        const pace = 0.25 + 0.75 * Math.abs(Math.sin((now - drip.born) / 420 + drip.seed));
        drip.y += drip.speed * pace * dt;
        drip.x += Math.sin((now - drip.born) / 380 + drip.seed) * 0.03 * ratio;
        drip.trail.push({ x: drip.x, y: drip.y });
        if (drip.y > canvas.height + 6 * ratio) {
          drip.until = now;
          drip.born = now;
        }
      }
      // Whatever has misted over entirely is let go.
      for (let i = strokes.length - 1; i >= 0; i -= 1) if (clarity(now - strokes[i].at) === 0) strokes.splice(i, 1);
      for (let i = drips.length - 1; i >= 0; i -= 1) if (now > drips[i].until && clarity(now - drips[i].born, HOLD * 1.2) === 0) drips.splice(i, 1);
      render(now);
      const busy = strokes.length > 0 || drips.length > 0 || !still;
      if (visible && busy) frame = window.requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && context) {
        last = 0;
        frame = window.requestAnimationFrame(tick);
      }
    };

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      if (started || !rect.width || !rect.height) return;
      started = true;
      // The line in the mist is in the hand the rest of the scene is captioned in, so wait for that face.
      const face = document.fonts?.load(`700 ${Math.round(rect.height * 0.17)}px "Dancing Script"`).catch(() => undefined);
      void Promise.resolve(face).then(() => {
        if (!live) return;
        ratio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        context = canvas.getContext("2d");
        mist = paintMist(canvas.width, canvas.height);
        nextDrip = performance.now() + 900;
        render(performance.now());
        wake();
      });
    };

    const wipe = (event: PointerEvent) => {
      // A mouse wipes as it passes over; a finger only while it is down.
      if (!context || (event.pointerType !== "mouse" && event.buttons === 0)) return;
      const rect = canvas.getBoundingClientRect();
      const point = { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
      const now = performance.now();
      const stroke = strokes[strokes.length - 1];
      if (stroke && now - lastMove < 140) {
        stroke.points.push(point);
        stroke.at = now;
      } else {
        strokes.push({ points: [point], at: now });
      }
      lastMove = now;
      wake();
    };
    const lift = () => {
      lastMove = 0;
    };

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) return;
      setup();
      wake();
    });
    observer.observe(canvas);
    canvas.addEventListener("pointermove", wipe);
    canvas.addEventListener("pointerdown", wipe);
    canvas.addEventListener("pointerup", lift);
    canvas.addEventListener("pointerleave", lift);
    canvas.addEventListener("pointercancel", lift);
    return () => {
      live = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", wipe);
      canvas.removeEventListener("pointerdown", wipe);
      canvas.removeEventListener("pointerup", lift);
      canvas.removeEventListener("pointerleave", lift);
      canvas.removeEventListener("pointercancel", lift);
    };
  }, []);

  return <canvas className="p3-wipe" ref={canvasRef} />;
}
