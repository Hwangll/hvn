import type { CSSProperties } from "react";
import { partThreeFilmCopy } from "../../data/story";

export interface SlateShot {
  production: string;
  chapter: string;
  scene: string;
  take: number;
  date: string;
  /** Chalked along the bottom of the board. */
  title: string;
}

const labels = partThreeFilmCopy.slate;

/** The chalk dust knocked out of the sticks as they meet: where each speck flies (in ems) and how late it leaves. */
const dust = [
  [2.2, -2.4, 0], [3.4, -1.1, 0.02], [1.2, -3.1, 0.04], [3.9, 0.4, 0.01], [0.4, -1.8, 0.03], [2.8, -3.4, 0.05], [4.4, -2.2, 0.02],
].map(([x, y, wait]) => ({ "--dust-x": `${x}em`, "--dust-y": `${y}em`, "--dust-wait": `${wait}s` }) as CSSProperties);

/**
 * A clapperboard: striped sticks on a steel pivot over a black board, the fields printed in white and filled in by hand
 * in chalk (the production, chapter, scene and take, the day and who is directing), and a line chalked along the
 * bottom. Played (CSS, .chapter-slate and .post-credits-film), its stick snaps shut with a "cạch!" and a puff of chalk;
 * on its own it is a still.
 */
export function Clapperboard({ shot }: { shot: SlateShot }) {
  return (
    <div className="clapperboard">
      <div className="clapper-sticks">
        <i className="clapper-stick is-base" />
        <i className="clapper-stick is-arm" />
        <i className="clapper-pivot" />
      </div>
      <div className="clapper-board">
        <p className="clapper-production"><small>{labels.production}</small><span className="chalk">{shot.production}</span></p>
        <dl className="clapper-cells">
          <div><dt>{labels.chapter}</dt><dd className="chalk">{shot.chapter}</dd></div>
          <div><dt>{labels.scene}</dt><dd className="chalk">{shot.scene}</dd></div>
          <div><dt>{labels.take}</dt><dd className="chalk">{shot.take}</dd></div>
        </dl>
        <div className="clapper-foot">
          <p className="clapper-date"><small>{labels.date}</small><span className="chalk">{shot.date}</span></p>
          <p className="clapper-director"><small>{labels.director}</small><span className="chalk">{labels.crew}</span></p>
        </div>
        <p className="clapper-title chalk">{shot.title}</p>
      </div>
      <span className="clapper-clack"><b>cạch!</b></span>
      <span className="clapper-dust">
        {dust.map((style, index) => <i key={index} style={style} />)}
      </span>
    </div>
  );
}
