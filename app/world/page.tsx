'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';


import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ajuste o caminho conforme seu projeto
import BaseMesh from '@/app/Entities/Physiscs/BaseMesh';

export default function World() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    const currentMount = mountRef.current;
    if (!currentMount) return;

    /* ---------- THREE  ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentMount.appendChild(renderer.domElement);

    /* OrbitControls (apenas dev) */
    let controls: OrbitControls | null = null;
    if (process.env.NODE_ENV === 'development') {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 1;
      controls.maxDistance = 100;
    }

    /* Luzes */
    scene.add(new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -25;
    dirLight.shadow.camera.right = dirLight.shadow.camera.top = 25;
    scene.add(dirLight);

    /* ---------- RAPIER ---------- */
    (async () => {
      await RAPIER.init(); // WebAssembly
      const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

      /* Chão físico + malha receptora de sombra */
      const groundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.ShadowMaterial({ opacity: 0.3 })
      );
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.receiveShadow = true;
      scene.add(groundMesh);

      const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
      world.createCollider(RAPIER.ColliderDesc.cuboid(100, 0.1, 100), groundBody);

      /* ---------- ENTIDADES ---------- */
      const entities: BaseMesh[] = [];

      // cidade GLB (estática – pode ser corpo fixo, mas usamos dinâmico + massa alta para demo)
      const city = await BaseMesh.loadObj(
        scene,
        world,
        '/models/city.glb'
      );
      entities.push(city);

      // (exemplo) caixa FBX dinâmica
      // const crate = await BaseMesh.loadObj(scene, world, '/models/crate.fbx');
      // entities.push(crate);

      /* ---------- LOOP ---------- */
      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        world.timestep = delta;   // mantém física ~ tempo real
        world.step();

        entities.forEach((e) => e.update());
        controls?.update();
        renderer.render(scene, camera);
      };
      animate();

      /* ---------- CLEANUP ---------- */
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        currentMount.removeChild(renderer.domElement);
      };
    })();
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute z-10 w-full h-screen"
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
