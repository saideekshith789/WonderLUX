import { Component, useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { destinations } from './data'

function GlobeScene() {
  const globe = useRef<Group>(null)
  useFrame((state, delta) => {
    if (globe.current) globe.current.rotation.y += delta * 0.09 + state.pointer.x * delta * 0.08
  })

  return (
    <group ref={globe} rotation={[0.12, -0.9, -0.08]}>
      <mesh>
        <sphereGeometry args={[1.55, 48, 48]} />
        <meshStandardMaterial color="#103543" roughness={0.88} metalness={0.15} />
      </mesh>
      <mesh scale={1.006}>
        <sphereGeometry args={[1.55, 24, 16]} />
        <meshBasicMaterial color="#40d9c7" wireframe transparent opacity={0.11} />
      </mesh>
      {destinations.map((destination, index) => {
        const latitude = (destination.lat * Math.PI) / 180
        const longitude = (destination.lon * Math.PI) / 180
        const radius = 1.57
        const position: [number, number, number] = [
          -radius * Math.cos(latitude) * Math.sin(longitude),
          radius * Math.sin(latitude),
          radius * Math.cos(latitude) * Math.cos(longitude),
        ]
        return (
          <group key={destination.id} position={position}>
            <mesh>
              <sphereGeometry args={[index < 5 ? 0.052 : 0.035, 12, 12]} />
              <meshBasicMaterial color={index < 5 ? '#f5b777' : '#64eee0'} />
            </mesh>
            <mesh scale={2.8}>
              <sphereGeometry args={[index < 5 ? 0.052 : 0.035, 12, 12]} />
              <meshBasicMaterial color="#64eee0" transparent opacity={0.16} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

class GlobeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed
      ? <div className="globe-fallback" role="img" aria-label="Decorative globe illustration"><div className="fallback-continent" /></div>
      : this.props.children
  }
}

export default function Globe() {
  return (
    <GlobeBoundary>
      <Canvas camera={{ position: [0, 0, 4.4], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.8} />
        <pointLight position={[4, 3, 4]} intensity={22} color="#6de4d5" />
        <pointLight position={[-3, -2, 2]} intensity={10} color="#f4ad70" />
        <GlobeScene />
      </Canvas>
    </GlobeBoundary>
  )
}