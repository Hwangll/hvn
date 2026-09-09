import { vi } from "vitest";
import type { ReactNode } from "react";

vi.mock("scrollama", () => ({
  default: () => ({
    setup: vi.fn().mockReturnThis(),
    onStepEnter: vi.fn().mockReturnThis(),
    onStepExit: vi.fn().mockReturnThis(),
    onStepProgress: vi.fn().mockReturnThis(),
    resize: vi.fn(),
    destroy: vi.fn(),
  }),
}));

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    utils: {
      toArray: vi.fn(() => []),
    },
    fromTo: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(),
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("lenis", () => ({
  default: vi.fn().mockImplementation(function LenisMock() {
    return {
      raf: vi.fn(),
      destroy: vi.fn(),
    };
  }),
}));

vi.mock("howler", () => ({
  Howl: vi.fn().mockImplementation(function HowlMock() {
    return {
      pause: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
      unload: vi.fn(),
    };
  }),
}));

vi.mock("react-parallax-tilt", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
