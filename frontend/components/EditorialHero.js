import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import * as THREE from "three";
import gsap from "gsap";

const AUTOPLAY_MS = 6000;
const TRANSITION_S = 1.2;
const IDLE_RETURN_MS = 2500;
// Height of the bottom control strip (progress bars + thumbnail row) where the deck
// should NOT chase the cursor — otherwise hovering in to click a bar/thumbnail makes
// the whole deck skitter away from the pointer instead of sitting still to be clicked.
const CONTROL_ZONE_HEIGHT = 160;
const LERP_FACTORS = [0.12, 0.1, 0.08, 0.06, 0.05];
const STACK_ANGLES = [-4, -2, 0, 2, 4];
const STACK_OFFSETS = [
  { x: -18, y: -8 },
  { x: -9, y: -4 },
  { x: 0, y: 0 },
  { x: 9, y: 4 },
  { x: 18, y: 8 },
];

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Classic liquid-displacement transition: sample the outgoing texture pushed one way and
// the incoming texture pushed the other way, both distorted by a noise map, with the
// distortion peaking in the middle of the transition then settling — reads as a fluid warp
// rather than a hard cut or a flat crossfade.
const FRAGMENT_SHADER = `
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform sampler2D uDisp;
  uniform float uProgress;
  uniform float uKenBurns;
  varying vec2 vUv;

  void main() {
    vec2 uv = (vUv - 0.5) / uKenBurns + 0.5;

    vec4 dispSample = texture2D(uDisp, uv);
    float dispStrength = dispSample.r - 0.5;

    float wave = sin(uProgress * 3.14159265);
    vec2 offset = vec2(dispStrength) * wave * 0.18;

    vec4 colorA = texture2D(uTexA, uv + offset);
    vec4 colorB = texture2D(uTexB, uv - offset);

    gl_FragColor = mix(colorA, colorB, smoothstep(0.0, 1.0, uProgress));
  }
`;

function makeNoiseTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  // Smooth-ish value noise (cheap approximation via layered random blur) so the
  // displacement reads as organic liquid rather than static/TV-snow noise.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v =
        Math.sin(x * 0.06) * Math.cos(y * 0.05) * 60 +
        Math.sin(x * 0.15 + y * 0.1) * 40 +
        (Math.random() - 0.5) * 30 +
        128;
      const clamped = Math.max(0, Math.min(255, v));
      imageData.data[i] = clamped;
      imageData.data[i + 1] = clamped;
      imageData.data[i + 2] = clamped;
      imageData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function EditorialHero({ products = [], maxSlides = 5 }) {
  const slides = useMemo(() => products.slice(0, maxSlides), [products, maxSlides]);
  const mountRef = useRef(null);
  const textRef = useRef(null);
  const glRef = useRef({});
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const indexRef = useRef(0);

  // ---- three.js setup (once) ----
  useEffect(() => {
    if (!mountRef.current || slides.length === 0) return;
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const textures = slides.map((s) => {
      const tex = loader.load(s.images?.[0] || s.heroImage);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return tex;
    });
    const dispTexture = makeNoiseTexture();

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexA: { value: textures[0] },
        uTexB: { value: textures[0] },
        uDisp: { value: dispTexture },
        uProgress: { value: 0 },
        uKenBurns: { value: 1.0 },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId;
    const slideStart = { t: performance.now() };
    const IDLE_ZOOM_MS = AUTOPLAY_MS + TRANSITION_S * 1000;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = performance.now() - slideStart.t;
      const kb = 1.0 + 0.08 * Math.min(1, elapsed / IDLE_ZOOM_MS);
      material.uniforms.uKenBurns.value = kb;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    glRef.current = { renderer, scene, camera, material, textures, mesh, geometry, dispTexture, slideStart };
    setReady(true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      textures.forEach((t) => t.dispose());
      dispTexture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  // ---- drive the shader transition + text choreography whenever the slide changes ----
  useEffect(() => {
    if (!ready) return;
    const gl = glRef.current;
    const prevIndex = indexRef.current;
    gl.material.uniforms.uTexA.value = gl.textures[prevIndex];
    gl.material.uniforms.uTexB.value = gl.textures[index];
    gl.material.uniforms.uProgress.value = 0;
    gl.slideStart.t = performance.now();

    gsap.to(gl.material.uniforms.uProgress, {
      value: 1,
      duration: TRANSITION_S,
      ease: "power2.inOut",
      onComplete: () => {
        gl.material.uniforms.uTexA.value = gl.textures[index];
        gl.material.uniforms.uProgress.value = 0;
      },
    });

    indexRef.current = index;

    // Text choreography: outgoing content masks/fades up, incoming stacks in with a stagger.
    if (textRef.current) {
      const title = textRef.current.querySelector(".ed-title");
      const rest = textRef.current.querySelectorAll(".ed-stagger");
      gsap.fromTo(
        title,
        { yPercent: 30, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        { yPercent: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power3.out" }
      );
      gsap.fromTo(
        rest,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.15 }
      );
      const counter = textRef.current.querySelector(".ed-counter-current");
      if (counter) {
        gsap.fromTo(counter, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ready]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS + TRANSITION_S * 1000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];
  const total = String(slides.length).padStart(2, "0");
  const current = String(index + 1).padStart(2, "0");

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink-950">
      <div ref={mountRef} className="absolute inset-0" />

      {/* readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink-950 to-transparent" />

      {/* pointer-events-none on the wrapper: this box spans the full hero, but it has no
          background of its own — only specific interactive children (the CTA link) opt
          back into pointer-events so they win hit-testing over the thumbnail deck without
          this transparent wrapper blocking clicks/drags meant for the deck everywhere else. */}
      <div
        ref={textRef}
        className="pointer-events-none relative z-20 flex h-full w-full flex-col justify-end px-6 pb-28 sm:px-10 lg:px-16"
      >
        <div className="relative">
          {/* Huge title, laid directly over the cinematic background photo —
              the product is already staged inside that photo itself. */}
          <h1 className="ed-title relative z-0 max-w-3xl select-none font-display font-black uppercase leading-[0.95] text-white [font-size:clamp(2.5rem,6.5vw,5.5rem)]">
            {slide.name}
          </h1>
        </div>

        {slide.description && (
          <p className="ed-stagger relative z-10 mt-5 max-w-md text-base text-white/75 line-clamp-2">
            {slide.description}
          </p>
        )}

        <div className="ed-stagger relative z-10 mt-8 grid max-w-md grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">Category</p>
            <p className="mt-1.5 text-sm font-medium text-white">{slide.categoryLabel}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">Price</p>
            <p className="mt-1.5 text-sm font-medium text-white">${slide.price}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">Stock</p>
            <p className="mt-1.5 text-sm font-medium text-white">
              {slide.stock > 0 ? `${slide.stock} available` : "Sold out"}
            </p>
          </div>
        </div>

        <Link
          href={`/products/${slide.id}`}
          className="ed-stagger pointer-events-auto relative z-20 mt-9 inline-flex w-fit items-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950 transition-transform hover:-translate-y-0.5"
        >
          Shop Now <FiArrowRight />
        </Link>
      </div>

      {slides.length > 1 && (
        <>
          <SlideProgressBars slides={slides} index={index} setIndex={setIndex} />
          <ThumbnailDeck slides={slides} index={index} setIndex={setIndex} />
        </>
      )}

      {/* Slide counter */}
      <div className="absolute bottom-24 right-6 z-20 flex items-baseline gap-1 overflow-hidden sm:right-10 lg:right-16">
        <span className="ed-counter-current font-display text-3xl font-bold text-white">{current}</span>
        <span className="text-sm text-white/40"> / {total}</span>
      </div>
    </section>
  );
}

function SlideProgressBars({ slides, index, setIndex }) {
  const barRefs = useRef([]);

  useEffect(() => {
    const cycleS = (AUTOPLAY_MS + TRANSITION_S * 1000) / 1000;
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.killTweensOf(el);
      if (i < index) {
        gsap.set(el, { scaleX: 1 });
      } else if (i === index) {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: cycleS, ease: "linear" });
      } else {
        gsap.set(el, { scaleX: 0 });
      }
    });
  }, [index]);

  return (
    <div className="absolute inset-x-0 bottom-24 z-10 hidden justify-center gap-2 sm:flex">
      {slides.map((s, i) => (
        <button
          key={s.id}
          onClick={() => setIndex(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="h-[3px] w-10 overflow-hidden rounded-full bg-white/25"
        >
          <div
            ref={(el) => (barRefs.current[i] = el)}
            className="h-full w-full origin-left bg-white"
            style={{ transform: "scaleX(0)" }}
          />
        </button>
      ))}
    </div>
  );
}

function ThumbnailDeck({ slides, index, setIndex }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const current = useRef(slides.map(() => ({ x: 0, y: 0 })));
  const homeCenters = useRef(slides.map(() => ({ x: 0, y: 0 })));
  const mouse = useRef({ x: 0, y: 0 });
  const following = useRef(false);
  const rafId = useRef(null);
  const idleTimer = useRef(null);
  const interactiveRef = useRef(false);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    interactiveRef.current = !isTouch && !reducedMotion;
    if (!interactiveRef.current) return;

    const section = containerRef.current?.closest("section");
    if (!section) return;

    // Cache each thumbnail's untransformed home center once (and on resize) — this is
    // the only place we read layout; the rAF loop below only ever writes transforms.
    const measureHomePositions = () => {
      const sectionRect = section.getBoundingClientRect();
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const prevTransform = el.style.transform;
        el.style.transform = "none";
        const rect = el.getBoundingClientRect();
        el.style.transform = prevTransform;
        homeCenters.current[i] = {
          x: rect.left - sectionRect.left + rect.width / 2,
          y: rect.top - sectionRect.top + rect.height / 2,
        };
      });
    };
    measureHomePositions();
    window.addEventListener("resize", measureHomePositions);

    const goHome = () => {
      following.current = false;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        // Sync GSAP's internal transform cache with the value we last wrote directly via
        // el.style.transform in the rAF loop, so it animates away from the real position.
        gsap.set(el, { x: current.current[i].x, y: current.current[i].y, rotation: STACK_ANGLES[i] || 0 });
        gsap.to(el, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.9,
          ease: "power3.out",
          onUpdate: () => {
            current.current[i] = { x: gsap.getProperty(el, "x"), y: gsap.getProperty(el, "y") };
          },
        });
      });
    };

    const scheduleIdleReturn = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(goHome, IDLE_RETURN_MS);
    };

    const handleMouseMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Inside the bottom control strip itself (progress bars + thumbnails) — don't
      // chase the cursor here, just let the deck sit still so it can be clicked.
      if (y > rect.height - CONTROL_ZONE_HEIGHT) {
        if (following.current) {
          clearTimeout(idleTimer.current);
          goHome();
        }
        return;
      }

      mouse.current = { x, y };
      if (!following.current) {
        following.current = true;
        itemRefs.current.forEach((el) => el && gsap.killTweensOf(el));
      }
      scheduleIdleReturn();
    };

    const handleMouseLeave = () => {
      clearTimeout(idleTimer.current);
      goHome();
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    const tick = () => {
      rafId.current = requestAnimationFrame(tick);
      if (!following.current) return;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const targetAbsX = mouse.current.x + (STACK_OFFSETS[i]?.x || 0);
        const targetAbsY = mouse.current.y + (STACK_OFFSETS[i]?.y || 0);
        const desiredX = targetAbsX - homeCenters.current[i].x;
        const desiredY = targetAbsY - homeCenters.current[i].y;
        const factor = LERP_FACTORS[i] ?? 0.08;
        current.current[i].x += (desiredX - current.current[i].x) * factor;
        current.current[i].y += (desiredY - current.current[i].y) * factor;
        const angle = STACK_ANGLES[i] || 0;
        el.style.transform = `translate3d(${current.current[i].x}px, ${current.current[i].y}px, 0) rotate(${angle}deg)`;
      });
    };
    tick();

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", measureHomePositions);
      cancelAnimationFrame(rafId.current);
      clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-8 z-10 hidden justify-center gap-3 sm:flex"
    >
      {slides.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => (itemRefs.current[i] = el)}
          onClick={() => setIndex(i)}
          aria-label={`Show ${s.name}`}
          className={`relative h-[45px] w-[70px] shrink-0 overflow-hidden border transition-colors duration-300 ${
            i === index ? "border-white" : "border-white/25 opacity-60 hover:opacity-90"
          }`}
        >
          <Image src={s.images?.[0] || s.heroImage} alt={s.name} fill className="object-cover" sizes="70px" />
        </button>
      ))}
    </div>
  );
}
