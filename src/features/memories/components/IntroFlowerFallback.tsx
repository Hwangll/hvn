import { useId } from "react";
import type { IntroFlowerVariant } from "../model/introFlowers";

/** Each keepsake's paper, the shade in its folds, and its ribbon. */
const wraps: Record<IntroFlowerVariant, { paper: string; fold: string; ribbon: string }> = {
  sunflower: { paper: "#f3e5d0", fold: "#c6ad90", ribbon: "#b87362" },
  hydrangea: { paper: "#dbe9ef", fold: "#94b5c9", ribbon: "#356995" },
  lily: { paper: "#f3e3df", fold: "#c9a49a", ribbon: "#6a1428" },
};

/** Where the lilies open: three sepals and three broader petals each, turned so no two stars line up. */
const lilies = [
  { x: 118, y: 112, s: 0.56, turn: 12 },
  { x: 92, y: 204, s: 0.72, turn: -24 },
  { x: 214, y: 194, s: 0.76, turn: 18 },
  { x: 154, y: 152, s: 1, turn: 4 },
];

/** Two long buds on their own stems: where each stands, and which way it leans. */
const lilyBuds = [
  { x: 194, y: 112, turn: 14, stem: "M163 300 Q182 200 194 112" },
  { x: 64, y: 160, turn: -38, stem: "M150 300 Q92 230 64 160" },
];

// A real silhouette of each flower remains available without a WebGL context.
export function IntroFlowerFallback({ variant }: { variant: IntroFlowerVariant }) {
  const id = useId();
  const wrap = wraps[variant];
  return (
    <svg className="intro-flower-illustration" viewBox="0 0 320 400" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-blue`}><stop stopColor="#d6ecfb" /><stop offset="0.45" stopColor="#7db8f2" /><stop offset="1" stopColor="#2a62c8" /></radialGradient>
        <linearGradient id={`${id}-gold`} x2="0" y2="1"><stop stopColor="#ffe28a" /><stop offset="0.7" stopColor="#f2b52e" /><stop offset="1" stopColor="#c76f1c" /></linearGradient>
        {/* Down a tepal from its tip to the throat: deep crimson, scarlet, then the warm throat. */}
        <linearGradient id={`${id}-red`} x2="0" y2="1"><stop stopColor="#8e0a22" /><stop offset="0.5" stopColor="#d0142e" /><stop offset="1" stopColor="#f26a3e" /></linearGradient>
        <path id={`${id}-floret`} d="M0 0 C-19 -1 -17 -20 -5 -13 Q1 -9 0 0 C0 -19 20 -17 13 -5 Q9 1 0 0 C19 0 17 20 5 13 Q-1 9 0 0 C0 19 -20 17 -13 5 Q-9 -1 0 0" />
        <path id={`${id}-tepal`} d="M0 0 C-14 -12 -16 -40 0 -64 C16 -40 14 -12 0 0Z" />
      </defs>
      <ellipse cx="160" cy="358" rx="116" ry="19" fill="#19232e" />
      <g fill="none" stroke="#416650" strokeWidth="5"><path d="M160 335 Q150 233 144 139" /><path d="M161 332 Q191 240 211 196" /><path d="M158 331 Q126 253 92 209" /></g>
      <g fill="#345d48" stroke="#779875" strokeWidth="1"><path d="M153 287 Q67 280 70 224 Q126 223 153 287Z" /><path d="M165 278 Q174 214 238 226 Q221 279 165 278Z" /></g>
      <path d="M110 286 L167 300 L218 282 L188 346 Q160 357 132 345Z" fill={wrap.paper} />
      <path d="M110 286 L154 343 L167 300 M218 282 L175 345" fill="none" stroke={wrap.fold} strokeWidth="2" />
      <path d="M141 312 Q100 288 124 326 L154 319 Q195 285 193 315 L169 324 L177 347 M156 318 L145 347" fill="none" stroke={wrap.ribbon} strokeWidth="8" strokeLinecap="round" />
      {variant === "hydrangea" ? (
        <g>
          <ellipse cx="158" cy="173" rx="85" ry="80" fill="#1f4a8c" />
          {Array.from({ length: 76 }, (_, i) => {
            const angle = i * 2.39996;
            const radius = Math.sqrt(i / 76) * 80;
            return <g key={i} transform={`translate(${158 + Math.cos(angle) * radius} ${168 + Math.sin(angle) * radius * 0.9}) rotate(${i * 37}) scale(${0.78 + (i % 4) * 0.06})`}>
              <use href={`#${id}-floret`} fill={`url(#${id}-blue)`} stroke="#2a5fb8" strokeWidth="0.7" />
              <circle r="1.9" fill="#fff4cc" />
            </g>;
          })}
        </g>
      ) : variant === "lily" ? (
        <g>
          {/* Two long buds, green at the foot and blushing red. */}
          {lilyBuds.map((bud) => <g key={bud.stem}>
            <path d={bud.stem} fill="none" stroke="#416650" strokeWidth="3" />
            <g transform={`translate(${bud.x} ${bud.y}) rotate(${bud.turn})`}>
              <path d="M0 0 C-8 -10 -9 -34 0 -52 C9 -34 8 -10 0 0Z" fill="#b8203a" />
              <path d="M0 0 C-6 -5 -7 -12 -6 -17 L6 -17 C7 -12 6 -5 0 0Z" fill="#56762c" />
            </g>
          </g>)}
          {lilies.map((bloom, index) => <g key={index} transform={`translate(${bloom.x} ${bloom.y}) rotate(${bloom.turn}) scale(${bloom.s})`}>
            {Array.from({ length: 6 }, (_, i) => <use key={i} href={`#${id}-tepal`} fill={`url(#${id}-red)`} stroke="#7a0a1e" strokeWidth="0.6" transform={`rotate(${i * 60}) scale(${i % 2 ? 1.22 : 0.86} ${i % 2 ? 0.94 : 1})`} />)}
            {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.39996) * (7 + (i % 5) * 4)} cy={Math.sin(i * 2.39996) * (7 + (i % 5) * 4)} r="1.3" fill="#4a0410" />)}
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * 60 + 30) * (Math.PI / 180);
              const [x, y] = [Math.cos(angle) * 44, Math.sin(angle) * 44];
              return <g key={i}>
                <path d={`M0 0 L${x} ${y}`} stroke="#f3c77e" strokeWidth="1.3" />
                <ellipse cx={x} cy={y} rx="6.5" ry="2.6" transform={`rotate(${i * 60 + 30 + 90} ${x} ${y})`} fill="#7a2c10" />
              </g>;
            })}
          </g>)}
        </g>
      ) : (
        <g>
          {[{ x: 93, y: 207, s: 0.66 }, { x: 211, y: 195, s: 0.62 }, { x: 151, y: 144, s: 1 }].map((bloom, index) => <g key={index} transform={`translate(${bloom.x} ${bloom.y}) scale(${bloom.s})`}>
            {Array.from({ length: 36 }, (_, i) => <path key={i} d="M-7 -15 Q-18 -44 0 -75 Q19 -41 7 -15Z" fill={`url(#${id}-gold)`} stroke="#d09837" strokeWidth="0.45" transform={`rotate(${i * 137.508}) scale(${i < 18 ? 1 : 0.86})`} />)}
            <circle r="25" fill="#2c190d" />
            <circle r="24" fill="none" stroke="#e5ad34" strokeWidth="2.2" strokeDasharray="1.6 2.3" />
            {Array.from({ length: 85 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.39996) * Math.sqrt(i / 85) * 22} cy={Math.sin(i * 2.39996) * Math.sqrt(i / 85) * 22} r="1.3" fill={i % 3 ? "#b28c4e" : "#362719"} />)}
          </g>)}
        </g>
      )}
    </svg>
  );
}
