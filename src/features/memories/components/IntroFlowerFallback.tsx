import { useId } from "react";
import type { IntroFlowerVariant } from "../model/introFlowers";

// A real silhouette of each flower remains available without a WebGL context.
export function IntroFlowerFallback({ variant }: { variant: IntroFlowerVariant }) {
  const id = useId();
  const blue = variant === "hydrangea";
  return (
    <svg className="intro-flower-illustration" viewBox="0 0 320 400" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-blue`}><stop stopColor="#d6ecfb" /><stop offset="0.45" stopColor="#7db8f2" /><stop offset="1" stopColor="#2a62c8" /></radialGradient>
        <linearGradient id={`${id}-gold`} x2="0" y2="1"><stop stopColor="#ffe28a" /><stop offset="0.7" stopColor="#f2b52e" /><stop offset="1" stopColor="#c76f1c" /></linearGradient>
        <path id={`${id}-floret`} d="M0 0 C-19 -1 -17 -20 -5 -13 Q1 -9 0 0 C0 -19 20 -17 13 -5 Q9 1 0 0 C19 0 17 20 5 13 Q-1 9 0 0 C0 19 -20 17 -13 5 Q-9 -1 0 0" />
      </defs>
      <ellipse cx="160" cy="358" rx="116" ry="19" fill="#19232e" />
      <g fill="none" stroke="#416650" strokeWidth="5"><path d="M160 335 Q150 233 144 139" /><path d="M161 332 Q191 240 211 196" /><path d="M158 331 Q126 253 92 209" /></g>
      <g fill="#345d48" stroke="#779875" strokeWidth="1"><path d="M153 287 Q67 280 70 224 Q126 223 153 287Z" /><path d="M165 278 Q174 214 238 226 Q221 279 165 278Z" /></g>
      <path d="M110 286 L167 300 L218 282 L188 346 Q160 357 132 345Z" fill={blue ? "#dbe9ef" : "#f3e5d0"} />
      <path d="M110 286 L154 343 L167 300 M218 282 L175 345" fill="none" stroke={blue ? "#94b5c9" : "#c6ad90"} strokeWidth="2" />
      <path d="M141 312 Q100 288 124 326 L154 319 Q195 285 193 315 L169 324 L177 347 M156 318 L145 347" fill="none" stroke={blue ? "#356995" : "#b87362"} strokeWidth="8" strokeLinecap="round" />
      {blue ? (
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
