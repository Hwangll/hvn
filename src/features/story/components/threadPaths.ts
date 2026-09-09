import type { StoryThreadState } from "../data/story";

interface ThreadSegment {
  id: string;
  d: string;
  tone?: "main" | "second" | "faded";
}

export const threadPaths: Record<StoryThreadState, ThreadSegment[]> = {
  meeting: [
    { id: "hat-to-meet", d: "M72 72 C108 108 148 138 210 168", tone: "main" },
    { id: "no-to-meet", d: "M348 72 C312 108 272 138 210 168", tone: "second" },
    { id: "meet-to-memory", d: "M210 168 C218 228 198 278 210 332", tone: "main" },
  ],
  disconnected: [
    { id: "disconnect-left", d: "M72 88 C96 148 108 208 118 268", tone: "faded" },
    { id: "disconnect-right", d: "M348 88 C324 148 312 208 302 268", tone: "faded" },
    { id: "disconnect-gap-a", d: "M118 268 C132 310 148 352 162 392", tone: "faded" },
    { id: "disconnect-gap-b", d: "M302 268 C288 310 272 352 258 392", tone: "faded" },
  ],
  reconnecting: [
    { id: "reconnect-left", d: "M88 96 C128 132 168 156 210 178", tone: "faded" },
    { id: "reconnect-right", d: "M332 96 C292 132 252 156 210 178", tone: "faded" },
    { id: "reconnect-knot", d: "M210 178 C214 228 236 252 234 298 C232 344 210 360 214 408", tone: "main" },
  ],
  parallel: [
    { id: "parallel-hat", d: "M118 108 C104 188 108 268 124 348 C138 418 132 478 118 508", tone: "main" },
    { id: "parallel-no", d: "M302 108 C316 188 312 268 296 348 C282 418 288 478 302 508", tone: "second" },
  ],
  staying: [
    { id: "stay-left", d: "M118 88 C108 168 118 248 148 308 C168 348 188 378 210 398", tone: "main" },
    { id: "stay-right", d: "M302 88 C312 178 298 258 262 318 C242 352 224 378 210 398", tone: "second" },
    {
      id: "stay-loop",
      d: "M210 398 C148 382 108 418 118 468 C130 528 290 532 302 468 C312 408 268 382 210 398 C208 448 214 492 210 540",
      tone: "main",
    },
  ],
  "in-person": [
    { id: "in-person-left", d: "M92 92 C126 158 164 218 210 278", tone: "main" },
    { id: "in-person-right", d: "M328 92 C294 158 256 218 210 278", tone: "second" },
    { id: "in-person-together", d: "M210 278 C206 354 214 430 210 520", tone: "main" },
  ],
  dating: [
    { id: "dating-left", d: "M112 72 C96 168 142 230 190 292 C214 324 210 394 210 516", tone: "main" },
    { id: "dating-right", d: "M308 72 C324 168 278 230 230 292 C206 324 210 394 210 516", tone: "second" },
  ],
  aquarium: [
    { id: "aquarium-left", d: "M84 92 C132 146 126 228 184 278 C222 312 214 388 210 520", tone: "main" },
    { id: "aquarium-right", d: "M336 92 C288 146 294 228 236 278 C198 312 206 388 210 520", tone: "second" },
  ],
  cafe: [
    { id: "cafe-left", d: "M104 78 C126 168 170 222 202 286 C226 334 208 420 210 520", tone: "main" },
    { id: "cafe-right", d: "M316 78 C294 168 250 222 218 286 C194 334 212 420 210 520", tone: "second" },
  ],
  sunset: [
    { id: "sunset-left", d: "M76 104 C132 166 160 244 210 318 C210 386 210 458 210 532", tone: "main" },
    { id: "sunset-right", d: "M344 104 C288 166 260 244 210 318 C210 386 210 458 210 532", tone: "second" },
  ],
};
