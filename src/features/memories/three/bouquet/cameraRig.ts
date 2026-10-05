import * as THREE from "three";

/** Where the camera sits around what it looks at: azimuth from the front (+z) toward +x, polar from straight up. */
export interface RigPose {
  azimuth: number;
  polar: number;
  distance: number;
}

export interface RigLimits {
  azimuth: [number, number];
  polar: [number, number];
  distance: [number, number];
}

const clamp = (value: number, [min, max]: [number, number]) => Math.min(max, Math.max(min, value));

export function clampPose(pose: RigPose, limits: RigLimits): RigPose {
  return { azimuth: clamp(pose.azimuth, limits.azimuth), polar: clamp(pose.polar, limits.polar), distance: clamp(pose.distance, limits.distance) };
}

export function poseToPosition(target: THREE.Vector3, pose: RigPose, out: THREE.Vector3): THREE.Vector3 {
  const ring = Math.sin(pose.polar) * pose.distance;
  return out.set(target.x + Math.sin(pose.azimuth) * ring, target.y + Math.cos(pose.polar) * pose.distance, target.z + Math.cos(pose.azimuth) * ring);
}

/**
 * One wheel step of zoom. `consumed` is false once the distance is already at the limit in that direction, so the
 * page may scroll on instead of the wheel being swallowed.
 */
export function wheelZoom(distance: number, deltaY: number, limits: RigLimits): { distance: number; consumed: boolean } {
  const next = clamp(distance * Math.exp(deltaY * 0.0011), limits.distance);
  return { distance: next, consumed: Math.abs(next - distance) > 1e-4 };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Movement in px past which a press becomes a drag (and no longer counts as a click). */
const DRAG_THRESHOLD = 6;

interface Flight {
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromPose: RigPose;
  toPose: RigPose;
  elapsed: number;
  duration: number;
}

interface RigOptions {
  limits: RigLimits;
  home: RigPose;
}

/**
 * The visitor's view of a bouquet: dragging turns around it and wheel or pinch-free zoom moves in and out, both inside
 * limits that keep to the flattering side, with damping. On touch only a sideways drag turns (an upright one scrolls the
 * page). A press that turns into a drag never reaches the button underneath as a click. flyTo() carries the camera from
 * one bouquet to the other in a slow dolly that pulls back mid-way.
 */
export class CameraRig {
  readonly target = new THREE.Vector3();
  limits: RigLimits;
  home: RigPose;
  private pose: RigPose;
  private goal: RigPose;
  private flight: Flight | null = null;
  private pointer: { id: number; type: string; x: number; y: number; dragging: boolean; ignored: boolean } | null = null;
  private suppressClickUntil = 0;
  private lastInteraction = -Infinity;
  private readonly position = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera, private readonly element: HTMLElement, { limits, home }: RigOptions) {
    this.limits = limits;
    this.home = { ...home };
    this.pose = { ...home };
    this.goal = { ...home };
    element.addEventListener("pointerdown", this.onPointerDown);
    element.addEventListener("pointermove", this.onPointerMove);
    element.addEventListener("pointerup", this.onPointerUp);
    element.addEventListener("pointercancel", this.onPointerCancel);
    element.addEventListener("wheel", this.onWheel, { passive: false });
    element.addEventListener("click", this.onClick, true);
  }

  /** Seconds since the visitor last turned or zoomed. */
  idleSeconds(now = performance.now()): number {
    return (now - this.lastInteraction) / 1000;
  }

  get flying(): boolean {
    return this.flight !== null;
  }

  get dragging(): boolean {
    return Boolean(this.pointer?.dragging);
  }

  setFraming(limits: RigLimits, home: RigPose): void {
    this.limits = limits;
    this.home = { ...home };
    this.goal = clampPose(this.goal, limits);
  }

  jumpTo(target: THREE.Vector3): void {
    this.flight = null;
    this.target.copy(target);
    this.pose = { ...this.home };
    this.goal = { ...this.home };
  }

  flyTo(target: THREE.Vector3, duration = 1.8): void {
    this.flight = {
      fromTarget: this.target.clone(),
      toTarget: target.clone(),
      fromPose: { ...this.pose },
      toPose: { ...this.home },
      elapsed: 0,
      duration,
    };
    this.pointer = null;
  }

  /** After a long rest the view drifts back to the flattering one, slowly. */
  relax(seconds: number, rate = 0.5): void {
    const t = 1 - Math.exp(-seconds * rate);
    this.goal.azimuth += (this.home.azimuth - this.goal.azimuth) * t;
    this.goal.polar += (this.home.polar - this.goal.polar) * t;
    this.goal.distance += (this.home.distance - this.goal.distance) * t;
  }

  /** Moves the camera; returns true while it is still travelling. */
  update(seconds: number): boolean {
    let moving = false;
    if (this.flight) {
      const flight = this.flight;
      flight.elapsed += seconds;
      const progress = Math.min(1, flight.elapsed / flight.duration);
      const eased = easeInOut(progress);
      const arc = Math.sin(Math.PI * progress);
      this.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
      this.pose = {
        azimuth: THREE.MathUtils.lerp(flight.fromPose.azimuth, flight.toPose.azimuth, eased),
        polar: THREE.MathUtils.lerp(flight.fromPose.polar, flight.toPose.polar, eased) - arc * 0.05,
        distance: THREE.MathUtils.lerp(flight.fromPose.distance, flight.toPose.distance, eased) + arc * 0.9,
      };
      if (progress >= 1) {
        this.flight = null;
        this.pose = { ...flight.toPose };
        this.goal = { ...flight.toPose };
      }
      moving = true;
    } else {
      const t = 1 - Math.exp(-seconds * 7);
      for (const key of ["azimuth", "polar", "distance"] as const) {
        const delta = this.goal[key] - this.pose[key];
        if (Math.abs(delta) > 1e-4) moving = true;
        this.pose[key] += delta * t;
      }
    }
    this.camera.position.copy(poseToPosition(this.target, this.pose, this.position));
    this.camera.lookAt(this.target);
    return moving;
  }

  private markInteraction(): void {
    this.lastInteraction = performance.now();
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (this.flight || (event.pointerType === "mouse" && event.button !== 0)) return;
    this.pointer = { id: event.pointerId, type: event.pointerType, x: event.clientX, y: event.clientY, dragging: false, ignored: false };
  };

  private readonly onPointerMove = (event: PointerEvent) => {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId || pointer.ignored) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!pointer.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      // On touch, an upright gesture belongs to the page's scroll.
      if (pointer.type === "touch" && Math.abs(dy) > Math.abs(dx)) {
        pointer.ignored = true;
        return;
      }
      pointer.dragging = true;
      this.element.setPointerCapture?.(event.pointerId);
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    this.goal = clampPose(
      { azimuth: this.goal.azimuth - dx * 0.0055, polar: pointer.type === "touch" ? this.goal.polar : this.goal.polar - dy * 0.0045, distance: this.goal.distance },
      this.limits,
    );
    this.markInteraction();
  };

  private readonly onPointerUp = (event: PointerEvent) => {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.dragging) {
      this.suppressClickUntil = performance.now() + 350;
      this.element.releasePointerCapture?.(event.pointerId);
    }
    this.pointer = null;
  };

  private readonly onPointerCancel = (event: PointerEvent) => {
    if (this.pointer?.id === event.pointerId) this.pointer = null;
  };

  private readonly onWheel = (event: WheelEvent) => {
    if (this.flight) return;
    const { distance, consumed } = wheelZoom(this.goal.distance, event.deltaY, this.limits);
    if (!consumed) return;
    event.preventDefault();
    this.goal.distance = distance;
    this.markInteraction();
  };

  /** A drag that ends over the bouquet must not also open the story. */
  private readonly onClick = (event: MouseEvent) => {
    if (performance.now() > this.suppressClickUntil) return;
    event.preventDefault();
    event.stopPropagation();
    this.suppressClickUntil = 0;
  };

  dispose(): void {
    const element = this.element;
    element.removeEventListener("pointerdown", this.onPointerDown);
    element.removeEventListener("pointermove", this.onPointerMove);
    element.removeEventListener("pointerup", this.onPointerUp);
    element.removeEventListener("pointercancel", this.onPointerCancel);
    element.removeEventListener("wheel", this.onWheel);
    element.removeEventListener("click", this.onClick, true);
  }
}
