"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Cinematic3DCenterpiece
 * 
 * An abstract 3D sculptural visual centerpiece built with hardware-accelerated Canvas.
 * Combines:
 * - A multi-layered crystalline geodesic structure with translucent faces
 * - Reflected light vectors with violet (#805BFF) and cyan (#39DCE5) lighting
 * - Orbiting threat signal nodes and pulse waves
 * - Interactive mouse parallax with smooth damping
 * - Graceful fallback and prefers-reduced-motion support
 */
export function Cinematic3DCenterpiece() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasCanvasSupport, setHasCanvasSupport] = useState(true);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setHasCanvasSupport(false);
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking for parallax rotation
    let targetRotX = 0.2;
    let targetRotY = 0.3;
    let rotX = 0.2;
    let rotY = 0.3;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.2;
      targetRotX = -y * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 3D Geometry: Icosahedron-based crystalline nucleus
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseVertices = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    });

    const faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    // Background floating orbital particles
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 500,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.008 + 0.003,
      angle: Math.random() * Math.PI * 2,
      orbitRadius: Math.random() * 140 + 90,
      color: Math.random() > 0.4 ? "#805BFF" : "#39DCE5",
    }));

    let time = 0;

    const render = () => {
      time += reducedMotion ? 0.001 : 0.012;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.38;

      // Compound rotation matrix
      const cosY = Math.cos(rotY + time * 0.3);
      const sinY = Math.sin(rotY + time * 0.3);
      const cosX = Math.cos(rotX + Math.sin(time * 0.2) * 0.15);
      const sinX = Math.sin(rotX + Math.sin(time * 0.2) * 0.15);

      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        // Perspective divide
        const fov = 420;
        const pz = z2 + 320;
        const factor = fov / Math.max(pz, 100);
        return {
          px: cx + x1 * factor,
          py: cy + y2 * factor,
          depth: z2,
          scale: factor,
        };
      };

      // Draw subtle orbital particles (signals)
      particles.forEach((p) => {
        p.angle += p.speed;
        const px = Math.cos(p.angle) * p.orbitRadius;
        const py = Math.sin(p.angle * 1.5) * (p.orbitRadius * 0.35);
        const pz = Math.sin(p.angle) * p.orbitRadius;
        const proj = project(px, py, pz);

        const alpha = Math.max(0.1, Math.min(0.85, (proj.depth + 200) / 400));
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, p.size * (proj.scale / 1.2), 0, Math.PI * 2);
        ctx.fillStyle = p.color === "#805BFF" ? `rgba(128, 91, 255, ${alpha})` : `rgba(57, 220, 229, ${alpha})`;
        ctx.fill();

        // Node specular glow
        if (alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color === "#805BFF" ? `rgba(128, 91, 255, 0.15)` : `rgba(57, 220, 229, 0.15)`;
          ctx.fill();
        }
      });

      // Transform 3D vertices
      const transformedVerts = baseVertices.map(([vx, vy, vz]) => {
        const radiusPulse = 1 + Math.sin(time * 1.5) * 0.03;
        return project(vx * scale * radiusPulse, vy * scale * radiusPulse, vz * scale * radiusPulse);
      });

      // Calculate face depths and normals for sorting and lighting
      const sortedFaces = faces.map((indices, index) => {
        const p0 = transformedVerts[indices[0]];
        const p1 = transformedVerts[indices[1]];
        const p2 = transformedVerts[indices[2]];
        const avgDepth = (p0.depth + p1.depth + p2.depth) / 3;

        // Normal computation in 2D to determine winding (backface culling)
        const winding = (p1.px - p0.px) * (p2.py - p0.py) - (p1.py - p0.py) * (p2.px - p0.px);

        return { indices, avgDepth, winding, index };
      }).sort((a, b) => b.avgDepth - a.avgDepth);

      // Render crystalline facets
      sortedFaces.forEach(({ indices, winding, avgDepth, index }) => {
        const p0 = transformedVerts[indices[0]];
        const p1 = transformedVerts[indices[1]];
        const p2 = transformedVerts[indices[2]];

        ctx.beginPath();
        ctx.moveTo(p0.px, p0.py);
        ctx.lineTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.closePath();

        const isFront = winding > 0;
        const depthFactor = Math.max(0.1, (avgDepth + 150) / 300);

        if (isFront) {
          // Front-facing translucent chrome/glass material
          const grad = ctx.createLinearGradient(p0.px, p0.py, p2.px, p2.py);
          if (index % 2 === 0) {
            grad.addColorStop(0, `rgba(128, 91, 255, ${0.18 * depthFactor})`);
            grad.addColorStop(0.5, `rgba(23, 25, 35, ${0.75})`);
            grad.addColorStop(1, `rgba(57, 220, 229, ${0.22 * depthFactor})`);
          } else {
            grad.addColorStop(0, `rgba(57, 220, 229, ${0.16 * depthFactor})`);
            grad.addColorStop(0.5, `rgba(17, 19, 27, ${0.72})`);
            grad.addColorStop(1, `rgba(128, 91, 255, ${0.25 * depthFactor})`);
          }
          ctx.fillStyle = grad;
          ctx.fill();

          // Chrome specular border
          ctx.strokeStyle = index % 3 === 0 
            ? `rgba(57, 220, 229, ${0.45 * depthFactor})` 
            : `rgba(128, 91, 255, ${0.4 * depthFactor})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Back-facing refractive inner facets
          ctx.fillStyle = `rgba(17, 19, 27, 0.4)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Draw inner glowing core
      const corePulse = Math.sin(time * 2) * 0.15 + 0.85;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.45 * corePulse);
      coreGrad.addColorStop(0, "rgba(57, 220, 229, 0.45)");
      coreGrad.addColorStop(0.35, "rgba(128, 91, 255, 0.25)");
      coreGrad.addColorStop(0.7, "rgba(128, 91, 255, 0.08)");
      coreGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.45 * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Vertex signal nodes
      transformedVerts.forEach((v) => {
        if (v.depth > -50) {
          ctx.beginPath();
          ctx.arc(v.px, v.py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#F5F5FA";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(v.px, v.py, 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(57, 220, 229, 0.25)";
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center select-none">
      {/* Ambient background volumetric radiance */}
      <div className="absolute inset-0 rounded-full ambient-glow-dual blur-3xl pointer-events-none opacity-80" />
      <div className="absolute -inset-10 rounded-full bg-radial from-[#805BFF]/10 via-[#39DCE5]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hardware-accelerated 3D Canvas */}
      {hasCanvasSupport ? (
        <canvas
          ref={canvasRef}
          className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          aria-label="Interactive 3D Abstract Cybersecurity Intelligence Centerpiece"
        />
      ) : (
        /* Graceful static fallback if Canvas is disabled */
        <div className="relative z-10 w-64 h-64 rounded-full border border-white/10 bg-gradient-to-tr from-[#11131B] via-[#171923] to-[#805BFF]/20 flex items-center justify-center shadow-2xl">
          <div className="w-32 h-32 rounded-full border border-[#39DCE5]/40 bg-[#805BFF]/10 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#39DCE5] shadow-[0_0_30px_#39DCE5]" />
          </div>
        </div>
      )}
    </div>
  );
}
