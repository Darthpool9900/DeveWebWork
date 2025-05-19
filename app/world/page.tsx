'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function World() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentMount = mountRef.current
    if (!currentMount) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1, 5)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Ativa sombras no renderer
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap // sombra suave, mais realista

    currentMount.appendChild(renderer.domElement)

    // OrbitControls só no modo desenvolvimento
    let controls: OrbitControls | null = null
    if (process.env.NODE_ENV === 'development') {
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.minDistance = 1
      controls.maxDistance = 100
      controls.target.set(0, 0, 0)
      controls.update()
    }

    // Luz hemisférica (céu e chão) - simula luz ambiente
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x444444, 0.6) // azul céu e tom terra
    hemiLight.position.set(0, 20, 0)
    scene.add(hemiLight)

    // Luz direcional (sol) com sombra configurada para alta qualidade
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(10, 20, 10)
    dirLight.castShadow = true

    const d = 25
    dirLight.shadow.camera.left = -d
    dirLight.shadow.camera.right = d
    dirLight.shadow.camera.top = d
    dirLight.shadow.camera.bottom = -d
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 50

    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.bias = -0.001 // remove artefatos

    scene.add(dirLight)

    // Chão invisível para capturar sombra
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    scene.add(ground)

    // Carregamento do GLB e ativar sombras para todos os meshes
    const gltfLoader = new GLTFLoader()
    gltfLoader.load('/models/city.glb', (gltf) => {
      const root = gltf.scene
      root.scale.set(0.5, 0.5, 0.5)

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true

          // Opcional: garantir material PBR para melhor interação com luz
          if (mesh.material) {
            mesh.material = new THREE.MeshStandardMaterial({
              map: (mesh.material as any).map || null,
              metalness: 0.3,
              roughness: 0.7,
              envMapIntensity: 1,
            })
          }
        }
      })

      scene.add(root)
      console.log('GLB carregado', root)
    })

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls?.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      currentMount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh' }}
      className="absolute z-10 w-full h-screen"
    />
  )
}
