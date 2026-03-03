import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ThreeCanvas = ({ isDarkMode }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const themeConfig = {
            lightBase: new THREE.Color(0xf4f7f6),
            lightDeep: new THREE.Color(0xe0f7fa),
            darkBase: new THREE.Color(0x050a10),
            darkDeep: new THREE.Color(0x000000)
        };

        const currentBase = new THREE.Color().copy(isDarkMode ? themeConfig.darkBase : themeConfig.lightBase);
        const currentDeep = new THREE.Color().copy(isDarkMode ? themeConfig.darkDeep : themeConfig.lightDeep);

        const scene = new THREE.Scene();
        scene.background = currentBase;
        scene.fog = new THREE.FogExp2(currentBase, 0.02);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const heroGroup = new THREE.Group();
        heroGroup.scale.set(1.2, 1.2, 1.2);
        scene.add(heroGroup);

        // 1. NUCLEUS
        const nucleusGeo = new THREE.OctahedronGeometry(2, 2);
        const nucleusMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0x0066ff, emissiveIntensity: 0.8,
            wireframe: true, transparent: true, opacity: 0.9
        });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
        heroGroup.add(nucleus);

        // 2. SHELL
        const shellGeo = new THREE.IcosahedronGeometry(4, 1);
        const shellMat = new THREE.MeshPhysicalMaterial({
            color: 0x00c2ff, metalness: 0.1, roughness: 0.0,
            transmission: 0.9, thickness: 2.0, clearcoat: 1.0, side: THREE.DoubleSide
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        heroGroup.add(shell);

        // 3. SHIELD
        const shieldGeo = new THREE.IcosahedronGeometry(5.5, 1);
        const shieldMat = new THREE.MeshBasicMaterial({ color: 0x0066ff, wireframe: true, transparent: true, opacity: 0.15 });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        heroGroup.add(shield);

        // 4. PARTICLES
        const pGroup = new THREE.Group();
        heroGroup.add(pGroup);
        const geometries = [new THREE.TetrahedronGeometry(0.4, 0), new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.OctahedronGeometry(0.4, 0)];
        const colors = [0x0066ff, 0xff0055, 0x00cc66, 0xffcc00];

        for (let i = 0; i < 50; i++) {
            const geom = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)], wireframe: true, transparent: true, opacity: 0.6 });
            const mesh = new THREE.Mesh(geom, mat);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 9 + Math.random() * 6;
            mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            mesh.userData = { rotX: (Math.random() - 0.5) * 0.05, rotY: (Math.random() - 0.5) * 0.05 };
            pGroup.add(mesh);
        }

        // 5. RINGS
        const ringGeo = new THREE.TorusGeometry(8, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00c2ff, transparent: true, opacity: 0.3 });
        const ring1 = new THREE.Mesh(ringGeo, ringMat); ring1.rotation.x = Math.PI / 2; heroGroup.add(ring1);
        const ring2 = new THREE.Mesh(ringGeo, ringMat); ring2.rotation.y = Math.PI / 3; heroGroup.add(ring2);

        scene.add(new THREE.AmbientLight(0xffffff, 2.5));
        const spotLight1 = new THREE.PointLight(0x0066ff, 20, 50); spotLight1.position.set(10, 10, 10); scene.add(spotLight1);
        const spotLight2 = new THREE.PointLight(0xff0055, 20, 50); spotLight2.position.set(-10, -10, 10); scene.add(spotLight2);

        // TUNNEL
        const tunnelGroup = new THREE.Group();
        scene.add(tunnelGroup);
        tunnelGroup.visible = false;
        const tunnelRings = [];
        for (let i = 0; i < 30; i++) {
            const tGeo = new THREE.TorusGeometry(5 + (i * 0.5), 0.1, 2, 6);
            const tMat = new THREE.MeshBasicMaterial({ color: 0x00c2ff, transparent: true, opacity: 0 });
            const hex = new THREE.Mesh(tGeo, tMat);
            hex.position.z = -10 - (i * 5);
            hex.rotation.z = i * 0.1;
            tunnelGroup.add(hex);
            tunnelRings.push({ mesh: hex, originalZ: hex.position.z, index: i });
        }

        let mouseX = 0, mouseY = 0;
        let targetRotX = 0, targetRotY = 0;
        let currentRotX = 0, currentRotY = 0;
        let scrollY = window.scrollY;
        const clock = new THREE.Clock();

        const onMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth) - 0.5;
            mouseY = (e.clientY / window.innerHeight) - 0.5;
        };
        const onScroll = () => { scrollY = window.scrollY; };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('scroll', onScroll);

        let animationId;
        const animate = () => {
            const time = clock.getElapsedTime();
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = Math.min(scrollY / maxScroll, 1);

            targetRotY = mouseX * 0.8; targetRotX = mouseY * 0.8;
            currentRotY += (targetRotY - currentRotY) * 0.05;
            currentRotX += (targetRotX - currentRotX) * 0.05;

            // Color lerping logic
            if (scrollPercent > 0.2) {
                const phase2Progress = (scrollPercent - 0.2) * 1.5;
                const mixedColor = new THREE.Color().copy(currentBase).lerp(currentDeep, Math.min(phase2Progress, 1));
                scene.background = mixedColor;
                scene.fog.color = mixedColor;
            } else {
                scene.background = currentBase;
                scene.fog.color = currentBase;
            }

            if (scrollPercent < 0.45) {
                heroGroup.visible = true;
                heroGroup.rotation.y = currentRotY + time * 0.1;
                heroGroup.rotation.x = currentRotX;
                nucleus.rotation.y -= 0.01; nucleus.rotation.z += 0.01;
                shield.rotation.y += 0.005;
                ring1.rotation.x = (Math.PI / 2) + Math.sin(time * 0.5) * 0.2;
                ring2.rotation.y = (Math.PI / 3) + Math.cos(time * 0.4) * 0.2;
                pGroup.rotation.y = -time * 0.05;
                pGroup.children.forEach(p => { p.rotation.x += p.userData.rotX; p.rotation.y += p.userData.rotY; });

                const hue = (time * 0.05) % 1;
                nucleus.material.emissive.lerp(new THREE.Color().setHSL(hue, 0.8, 0.5), 0.05);
                shield.material.color.lerp(new THREE.Color().setHSL((hue + 0.5) % 1, 0.8, 0.5), 0.05);

                heroGroup.position.z = scrollPercent * 60;
                const opacity = 1 - (scrollPercent * 3);
                heroGroup.children.forEach(child => {
                    if (child.material) child.material.opacity = Math.max(0, opacity * (child === nucleus ? 0.9 : 0.3));
                });

                const expansion = 1 + scrollPercent * 1.5;
                shield.scale.setScalar(expansion);
                pGroup.scale.setScalar(expansion);
            } else { heroGroup.visible = false; }

            if (scrollPercent > 0.2) {
                tunnelGroup.visible = true;
                const phase2Progress = (scrollPercent - 0.2) * 1.5;
                tunnelGroup.rotation.x = currentRotX * 0.5;
                tunnelGroup.rotation.y = currentRotY * 0.5;
                tunnelRings.forEach((ring) => {
                    let newZ = ring.originalZ + (phase2Progress * 80);
                    if (newZ > 20) newZ -= 150;
                    ring.mesh.position.z = newZ;
                    ring.mesh.rotation.z = (ring.index * 0.1) + (time * 0.5) + (phase2Progress * 5);
                    let op = 0;
                    if (newZ < 10 && newZ > -60) op = 1 - (Math.abs(newZ + 10) / 60);
                    ring.mesh.material.opacity = Math.max(0, op * 0.6);
                    ring.mesh.material.color.setHSL((time * 0.1 + ring.index * 0.05) % 1, 0.8, 0.5);
                });
            } else { tunnelGroup.visible = false; }

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', handleResize);

            // Dispose all Three.js resources to prevent GPU memory leaks
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            renderer.dispose();
        };
    }, [isDarkMode]);

    return <canvas ref={canvasRef} id="webgl-canvas" />;
};

export default ThreeCanvas;
