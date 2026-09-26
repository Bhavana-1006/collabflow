import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Hero3DScene = () => {
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch (e) {
      setHasWebGL(false);
      return;
    }

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting (Emerald, Mint, Amber, Warm Tangerine - No blue/purple)
    const ambientLight = new THREE.AmbientLight(0x059669, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x34d399, 2.5, 50); // Mint
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 2.0, 50); // Amber
    pointLight2.position.set(-10, -8, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x10b981, 1.8, 50); // Emerald
    pointLight3.position.set(0, -10, -5);
    scene.add(pointLight3);

    // 4. Central Hub Node (CollabFlow Core - Vibrant Emerald Matrix)
    const hubGeometry = new THREE.IcosahedronGeometry(2.4, 2);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x064e3b,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    scene.add(hub);

    // Inner glowing sphere
    const innerSphereGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const innerSphereMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    scene.add(innerSphere);

    // 5. Orbiting Workspace & Task Nodes (Emerald, Amber, Tangerine, Mint, Teal, Lime)
    const nodes = [];
    const nodeCount = 6;
    const nodeColors = [0x10b981, 0xf59e0b, 0x14b8a6, 0xf97316, 0x84cc16, 0x34d399];
    const nodeGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);

    for (let i = 0; i < nodeCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColors[i],
        emissive: nodeColors[i],
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(nodeGeometry, mat);

      // Add wireframe edge helper
      const edges = new THREE.EdgesGeometry(nodeGeometry);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      mesh.add(wireframe);

      const radius = 6.2 + Math.sin(i * 1.5) * 1.2;
      const angle = (i / nodeCount) * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.55),
        Math.sin(i * 2) * 2.5
      );

      mesh.userData = {
        angle,
        radius,
        speed: 0.003 + (i % 3) * 0.0015,
        tilt: (i % 2 === 0 ? 1 : -1) * 0.01,
        yOffset: Math.sin(i) * 1.5,
      };

      scene.add(mesh);
      nodes.push(mesh);
    }

    // 6. Connected Glowing Lines (Emerald/Mint Synapses)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
    });
    const lines = [];

    nodes.forEach((node) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        hub.position,
        node.position,
      ]);
      const line = new THREE.Line(lineGeo, lineMaterial);
      scene.add(line);
      lines.push({ line, node });
    });

    // 7. Background Floating Data Particles (Emerald/Mint/Gold)
    const particlesCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = (Math.random() - 0.5) * 35;
      positions[i + 2] = (Math.random() - 0.5) * 25;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Mouse Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 2.5;
      targetY = -y * 2.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate central hub
      hub.rotation.x = elapsedTime * 0.15 + mouseY * 0.5;
      hub.rotation.y = elapsedTime * 0.2 + mouseX * 0.5;
      innerSphere.rotation.y = -elapsedTime * 0.3;

      // Rotate particle cloud subtly
      particleSystem.rotation.y = elapsedTime * 0.02;

      // Animate orbiting nodes & connection lines
      nodes.forEach((node, idx) => {
        node.userData.angle += node.userData.speed;
        const currentAngle = node.userData.angle;
        const currentRadius = node.userData.radius;

        node.position.x = Math.cos(currentAngle) * currentRadius + mouseX * 1.2;
        node.position.y =
          Math.sin(currentAngle) * (currentRadius * 0.55) +
          Math.sin(elapsedTime + idx) * 0.4 +
          mouseY * 1.2;
        node.position.z = Math.sin(currentAngle * 2) * 2;

        node.rotation.x += 0.01;
        node.rotation.y += 0.015;

        // Update connected lines
        const lineObj = lines[idx];
        if (lineObj) {
          const positions = lineObj.line.geometry.attributes.position.array;
          positions[0] = hub.position.x;
          positions[1] = hub.position.y;
          positions[2] = hub.position.z;
          positions[3] = node.position.x;
          positions[4] = node.position.y;
          positions[5] = node.position.z;
          lineObj.line.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Camera gentle floating
      camera.position.x = mouseX * 1.5;
      camera.position.y = mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Clean geometry/materials
      hubGeometry.dispose();
      hubMaterial.dispose();
      innerSphereGeo.dispose();
      innerSphereMat.dispose();
      nodeGeometry.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      lineMaterial.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
    >
      {!hasWebGL && (
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/40 via-surface-950 to-accent-950/40 pointer-events-none" />
      )}
    </div>
  );
};
