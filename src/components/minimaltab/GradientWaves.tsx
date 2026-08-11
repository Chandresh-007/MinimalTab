import { useEffect, useRef } from "react";

export type GradientWavesProps = {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  detail?: "low" | "medium" | "high";
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uHorizon, uWave, uCrest;
uniform float uAmp, uScale, uRatio, uSwell, uTurb, uTilt, uZoom, uHeight, uFog, uBright, uGrain, uParallax;
uniform int uOct;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p, int oct){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv /= max(uZoom, 0.05);
  uv += uMouse * uParallax * 0.08;

  float horizon = 0.18 * uTilt;
  vec3 col;
  float depthFade = 0.0;

  if (uv.y >= horizon) {
    float sky = clamp((uv.y - horizon) / max(0.4, uHeight * 0.12), 0.0, 1.0);
    col = mix(uHorizon, uHorizon * 0.55 + uWave * 0.25, sky);
  } else {
    float d = horizon - uv.y;
    float z = 1.0 / (d * (2.0 + uHeight * 0.1));
    float x = uv.x * z;
    depthFade = clamp(z / max(uFog, 0.001), 0.0, 1.0);

    vec2 wp = vec2(x * uScale, (z * uScale * uRatio) - uTime * 0.6);
    float w = fbm(wp * 1.6, uOct);
    w += 0.35 * fbm(wp * (3.0 + uTurb * 0.08) + w, uOct);
    float swell = sin(z * 0.35 + uTime * 0.8) * (uSwell * 0.004);
    float hgt = (w - 0.5) * uAmp * 0.35 + swell;

    float shade = clamp(0.5 + hgt * 1.6, 0.0, 1.0);
    col = mix(uHorizon, uWave, clamp(1.0 - depthFade, 0.0, 1.0));
    col = mix(col, uWave, shade * 0.55);

    float crest = smoothstep(0.62, 0.98, w + hgt * 0.5);
    col = mix(col, uCrest, crest * 0.7 * (1.0 - depthFade * 0.6));
    col = mix(uHorizon, col, clamp(1.0 - depthFade * 0.9, 0.0, 1.0));
  }

  col *= uBright;

  if (uGrain > 0.0) {
    float g = hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5;
    col += g * uGrain;
  }

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export default function GradientWaves({
  horizonColor = "#5227FF",
  waveColor = "#FF9FFC",
  crestColor = "#FFFFFF",
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  detail = "medium",
  brightness = 1,
  opacity = 1,
  mouseInteraction = false,
  parallaxStrength = 0.5,
  grain = false,
  grainIntensity = 0.05,
  className,
}: GradientWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const props = useRef({
    horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio,
    swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness,
    mouseInteraction, parallaxStrength, grain, grainIntensity,
  });
  props.current = {
    horizonColor, waveColor, crestColor, speed, amplitude, waveScale, waveRatio,
    swell, turbulence, tilt, zoom, height, fogDepth, detail, brightness,
    mouseInteraction, parallaxStrength, grain, grainIntensity,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const U = {
      res: u("uRes"), time: u("uTime"), mouse: u("uMouse"),
      horizon: u("uHorizon"), wave: u("uWave"), crest: u("uCrest"),
      amp: u("uAmp"), scale: u("uScale"), ratio: u("uRatio"), swell: u("uSwell"),
      turb: u("uTurb"), tilt: u("uTilt"), zoom: u("uZoom"), height: u("uHeight"),
      fog: u("uFog"), bright: u("uBright"), grain: u("uGrain"), parallax: u("uParallax"),
      oct: u("uOct"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = 1 - (e.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = 0;
    let t = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      const rm = reduced.matches;
      const interval = rm ? 1000 / 15 : 1000 / 60;
      if (now - last < interval) return;
      const dt = (now - last) / 1000;
      last = now;
      resize();

      const p = props.current;
      t = rm ? ((now - start) / 1000) * p.speed * 0.2 : t + dt * p.speed;

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.mouse, p.mouseInteraction ? mouse.x : 0, p.mouseInteraction ? mouse.y : 0);
      gl.uniform3fv(U.horizon, hexToRgb(p.horizonColor));
      gl.uniform3fv(U.wave, hexToRgb(p.waveColor));
      gl.uniform3fv(U.crest, hexToRgb(p.crestColor));
      gl.uniform1f(U.amp, p.amplitude);
      gl.uniform1f(U.scale, p.waveScale);
      gl.uniform1f(U.ratio, p.waveRatio);
      gl.uniform1f(U.swell, p.swell);
      gl.uniform1f(U.turb, p.turbulence);
      gl.uniform1f(U.tilt, p.tilt);
      gl.uniform1f(U.zoom, p.zoom);
      gl.uniform1f(U.height, p.height);
      gl.uniform1f(U.fog, p.fogDepth);
      gl.uniform1f(U.bright, p.brightness);
      gl.uniform1f(U.grain, p.grain ? p.grainIntensity : 0);
      gl.uniform1f(U.parallax, p.parallaxStrength);
      gl.uniform1i(U.oct, p.detail === "low" ? 2 : p.detail === "high" ? 5 : 3);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "absolute inset-0 h-full w-full"}
      style={{ opacity, display: "block" }}
    />
  );
}
