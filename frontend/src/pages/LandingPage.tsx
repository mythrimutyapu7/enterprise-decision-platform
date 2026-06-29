import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  FiShield, 
  FiCpu, 
  FiActivity, 
  FiZap,
  FiArrowRight,
  FiPlay
} from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFeature, setActiveFeature] = useState<number>(0);

  // If user is already authenticated, bypass landing and go straight to dashboard
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Three.js 3D WebGL Background Engine Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    // Ambient Fog to create depth
    scene.fog = new THREE.FogExp2(0x050816, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Base camera positions: high up, looking down on the particle plane
    camera.position.set(0, 16, 28);
    camera.lookAt(0, 4, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050816, 1);

    // 1. Grid of Thousands of Glowing Particles
    const gridWidth = 90;
    const gridDepth = 90;
    const numParticles = gridWidth * gridDepth;
    const spacing = 1.8;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numParticles * 3);

    let count = 0;
    for (let x = 0; x < gridWidth; x++) {
      for (let z = 0; z < gridDepth; z++) {
        positions[count * 3] = (x - gridWidth / 2) * spacing;
        positions[count * 3 + 1] = 0; // dynamic Y in frame loop
        positions[count * 3 + 2] = (z - gridDepth / 2) * spacing;
        count++;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom circular soft glow texture for particles
    const createGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(79, 140, 255, 0.7)'); // Blue
        gradient.addColorStop(0.5, 'rgba(123, 97, 255, 0.3)'); // Purple
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.55,
      map: createGlowTexture(),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particlePoints = new THREE.Points(geometry, pointsMaterial);
    scene.add(particlePoints);

    // 2. Floating 3D AI Core Group
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 6, 0);
    scene.add(coreGroup);

    // Outer wireframe sphere (The AI Brain)
    const sphereGeom = new THREE.SphereGeometry(2.2, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x42e8ff, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    coreGroup.add(sphereMesh);

    // Inner pulsing solid core
    const innerGeom = new THREE.SphereGeometry(1.2, 12, 12);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x7c5cff, // Purple
      transparent: true,
      opacity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerMesh);

    // Rotating Ring 1
    const ring1Geom = new THREE.TorusGeometry(3.6, 0.04, 8, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x4f8cff, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    coreGroup.add(ring1);

    // Rotating Ring 2
    const ring2Geom = new THREE.TorusGeometry(4.4, 0.03, 8, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.45 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    // Rotating Ring 3
    const ring3Geom = new THREE.TorusGeometry(5.2, 0.02, 8, 64);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x42e8ff, transparent: true, opacity: 0.35 });
    const ring3 = new THREE.Mesh(ring3Geom, ring3Mat);
    ring3.rotation.y = Math.PI / 4;
    coreGroup.add(ring3);

    // Orbiting halo particles
    const haloGeom = new THREE.BufferGeometry();
    const haloCount = 100;
    const haloPos = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      const theta = (i / haloCount) * 2 * Math.PI;
      const r = 2.8;
      haloPos[i * 3] = Math.cos(theta) * r;
      haloPos[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      haloPos[i * 3 + 2] = Math.sin(theta) * r;
    }
    haloGeom.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
    const haloMat = new THREE.PointsMaterial({
      color: 0x42e8ff,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });
    const haloPoints = new THREE.Points(haloGeom, haloMat);
    coreGroup.add(haloPoints);

    // Interactivity state
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollPercent = 0;

    const onMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1]
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        scrollPercent = window.scrollY / scrollHeight;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Render Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime() * 0.65;

      // Smooth mouse coordinate tracking (LERP)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // 1. Dynamic WebGL Particle Wave math
      const positionsArr = particlePoints.geometry.attributes.position.array as Float32Array;
      
      // Calculate mouse projected plane coordinates to bend wave locally
      const mouseWorldX = mouseX * 22;
      const mouseWorldZ = -mouseY * 22;

      let idx = 0;
      for (let x = 0; x < gridWidth; x++) {
        for (let z = 0; z < gridDepth; z++) {
          const pX = positionsArr[idx * 3];
          const pZ = positionsArr[idx * 3 + 2];

          // Compute overlapping sine wave frequencies
          // Scroll height accelerates wave amplitude slightly
          const waveAmp = 2.8 + scrollPercent * 2.0;
          let y = Math.sin(pX * 0.09 + time) * Math.cos(pZ * 0.09 + time) * waveAmp;
          y += Math.sin(pX * 0.22 - time * 1.4) * 0.6;

          // Compute distance to mouse projected cursor coordinates
          const dx = pX - mouseWorldX;
          const dz = pZ - mouseWorldZ;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 14) {
            // Ripple/bend coordinates
            const force = (1 - dist / 14) * 3.8;
            y -= force;
          }

          positionsArr[idx * 3 + 1] = y;
          idx++;
        }
      }
      particlePoints.geometry.attributes.position.needsUpdate = true;

      // 2. Rotate core meshes
      sphereMesh.rotation.y += 0.005;
      sphereMesh.rotation.x += 0.003;
      
      // Core pulsing glow
      const innerScale = 1.0 + Math.sin(time * 3) * 0.1;
      innerMesh.scale.setScalar(innerScale);

      ring1.rotation.z += 0.008;
      ring2.rotation.y -= 0.006;
      ring3.rotation.x += 0.004;

      haloPoints.rotation.y -= 0.012;

      // Core hover floating oscillation
      coreGroup.position.y = 5.2 + Math.sin(time * 1.2) * 1.0 + scrollPercent * 2;

      // 3. Camera Parallax and Scroll zoom-out
      // Scroll moves camera backward and adjusts vertical height
      const targetCamZ = 28 + scrollPercent * 24;
      const targetCamY = 16 - scrollPercent * 6;

      camera.position.x += (mouseX * 7 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 3 + targetCamY - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;

      camera.lookAt(0, 3 + scrollPercent * 2, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanups
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      pointsMaterial.dispose();
      sphereGeom.dispose();
      sphereMat.dispose();
      innerGeom.dispose();
      innerMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      ring3Geom.dispose();
      ring3Mat.dispose();
      haloGeom.dispose();
      haloMat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleCTA = () => {
    navigate('/login');
  };

  const featureCards = [
    {
      title: "Autonomous Ingestion",
      desc: "Dynamically processes logs, raw threat feeds, and transcripts, standardizing incident fields automatically.",
      icon: FiZap,
      color: "border-cyan-500/20 text-cyan-400 hover:border-cyan-500/50 shadow-cyan-500/5",
      preview: (
        <div className="space-y-2.5 font-mono text-[9px] text-slate-400">
          <div className="flex justify-between border-b border-white/5 pb-1 text-slate-500">
            <span>INGESTION ENGINE</span>
            <span className="text-cyan-400 animate-pulse">ACTIVE</span>
          </div>
          <div className="bg-black/50 p-2 rounded border border-white/5 space-y-0.5">
            <p className="text-[#9bbcff]">source: "threat_intelligence"</p>
            <p className="text-slate-300">normalized: true</p>
            <p className="text-slate-300">risk_weight: 9.2</p>
          </div>
        </div>
      )
    },
    {
      title: "Agentic Router",
      desc: "The AI Planner maps optimum pathways across corporate runbooks, allocating execution tasks autonomously.",
      icon: FiCpu,
      color: "border-purple-500/20 text-purple-400 hover:border-purple-500/50 shadow-purple-500/5",
      preview: (
        <div className="space-y-2 font-mono text-[9px] text-left text-slate-400">
          <div className="flex justify-between border-b border-white/5 pb-1 text-slate-500">
            <span>TASK ROUTING</span>
            <span className="text-purple-400 font-bold">1,440ms</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between p-1 bg-white/[0.02] rounded">
              <span>● Ingest & Context</span>
              <span className="text-green-400 font-bold">Success</span>
            </div>
            <div className="flex justify-between p-1 bg-white/[0.02] rounded">
              <span>● Risk Evaluator</span>
              <span className="text-green-400 font-bold">Success</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Console Analytics",
      desc: "Audit automated containment times, average classification certainty, and pipeline parameters in real time.",
      icon: FiActivity,
      color: "border-blue-500/20 text-blue-400 hover:border-blue-500/50 shadow-blue-500/5",
      preview: (
        <div className="space-y-2 font-mono text-[9px] text-left text-slate-400">
          <div className="flex justify-between border-b border-white/5 pb-1 text-slate-500">
            <span>PERFORMANCE LOGS</span>
            <span className="text-blue-400 font-bold">STABLE</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/[0.02] p-1.5 rounded">
              <span className="text-[7px] text-slate-500">ACCURACY</span>
              <p className="text-xs font-bold text-white font-mono mt-0.5">96.8%</p>
            </div>
            <div className="bg-white/[0.02] p-1.5 rounded">
              <span className="text-[7px] text-slate-500">CONFIDENCE</span>
              <p className="text-xs font-bold text-white font-mono mt-0.5">94.2%</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-[#050816] text-white min-h-screen relative font-sans overflow-x-hidden select-none">
      
      {/* 3D Canvas center point */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Glassmorphic Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        
        {/* Logo block */}
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f8cff] to-[#7c5cff] shadow-[0_8px_24px_rgba(79,140,255,0.25)]">
            <FiShield className="h-5 w-5 text-white" />
          </div>
          <div className="text-left leading-none">
            <h1 className="text-sm font-black text-white tracking-tight">Enterprise AI</h1>
            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">SOC PLATFORM</p>
          </div>
        </div>

        {/* Action items */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCTA}
            className="border border-white/10 px-4.5 py-2 text-xs font-bold rounded-xl hover:bg-white/5 hover:border-white/20 transition duration-300 cursor-pointer"
          >
            Get Started
          </button>
          <button 
            onClick={handleCTA}
            className="bg-white/10 border border-white/5 px-4.5 py-2 text-xs font-bold rounded-xl hover:bg-white/15 transition duration-300 cursor-pointer"
          >
            Login
          </button>
        </div>

      </header>

      {/* Hero section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* Animated Headline and Subtitles */}
        <div className="space-y-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="glass-pill text-[#4f8cff] font-semibold text-xs tracking-wider uppercase">
              Quantum AI Orchestrator
            </span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tight leading-[1.08] text-white font-sans text-center"
          >
            Enterprise AI<br />
            <span className="bg-gradient-to-r from-[#4f8cff] via-[#7c5cff] to-[#42e8ff] bg-clip-text text-transparent">
              Autonomous Security
            </span><br />
            Built for the Future
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25 }}
            className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium leading-relaxed"
          >
            Autonomous AI agents that detect, analyze, orchestrate and respond to enterprise threats in real time.
          </motion.p>
        </div>

        {/* Glow Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-10"
        >
          <button
            onClick={handleCTA}
            className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-[#4f8cff] to-[#7c5cff] text-white font-bold text-sm md:text-base px-8 py-4 rounded-full shadow-[0_15px_35px_rgba(124,92,255,0.35)] hover:shadow-[0_20px_45px_rgba(124,92,255,0.5)] transition duration-300 transform hover:scale-105 cursor-pointer"
          >
            <FiPlay className="w-4 h-4 fill-white" />
            <span>LAUNCH YOUR FREE DEMO (60 Seconds)</span>
          </button>
        </motion.div>

      </section>

      {/* Feature showcase row cards (Second Section) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        
        <div className="text-center space-y-3 mb-14">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.25em]">SYSTEM ATTRIBUTES</span>
          <h3 className="text-2xl font-bold text-white">Platform Core Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
          {featureCards.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeFeature === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                onMouseEnter={() => setActiveFeature(idx)}
                className={`rounded-[24px] border p-6 text-left transition-all duration-300 flex flex-col justify-between h-[300px] cursor-pointer bg-white/[0.015] ${
                  isActive 
                    ? `border-[#4f8cff] bg-[#4f8cff]/5 shadow-[0_15px_45px_rgba(79,140,255,0.12)] scale-[1.03]` 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Title */}
                <div className="space-y-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    isActive ? 'border-[#4f8cff] text-[#9bbcff]' : 'border-white/10 text-slate-400'
                  } bg-white/[0.03] transition-colors duration-300`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
                  </div>
                </div>

                {/* Simulated Screen */}
                <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/5 h-24 flex flex-col justify-center overflow-hidden">
                  {item.preview}
                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

    </div>
  );
};

export default LandingPage;
