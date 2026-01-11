'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, Environment, ContactShadows, Float, OrbitControls, useProgress, useGLTF } from '@react-three/drei'
import { cn } from '@/lib/utils'

interface ApplePhoneProps {
    children?: React.ReactNode
    className?: string
    finish?: 'natural' | 'black' | 'blue' | 'white'
}

function Loader() {
    const { progress, errors } = useProgress()
    if (errors.length > 0) console.error("Loader Errors:", errors)
    return <Html center><div className="text-xs font-mono text-slate-500 whitespace-nowrap">{progress.toFixed(0)}% loaded</div></Html>
}

// Simple Error Boundary
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true }
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("3D Error:", error, errorInfo)
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
        return this.props.children
    }
}

// Internal Model Component to handle scene logic
function Model({ children }: { children: React.ReactNode }) {
    const gltf = useGLTF('/models/source/iphone_17_4.glb')

    useEffect(() => {
        if (gltf.scene) {
            gltf.scene.traverse((obj: any) => {
                const name = obj.name || ''
                console.log('GLB Object Name:', name, 'Type:', obj.type)

                // Aggressive Hiding of Staging Primitives
                // Hiding Planes (Backdrop) and Cylinders (often stands/props in raw exports)
                // We assume 'defaultMaterial' meshes are the actual phone body parts.
                if (
                    name.includes('Plane') ||
                    name.includes('Cylinder') ||
                    name.includes('Light') ||
                    name.includes('Camera') ||
                    name.includes('Backdrop') ||
                    name.includes('Studio') ||
                    name.includes('Floor')
                ) {
                    obj.visible = false
                }

                // Ensure proper shadow casting for the phone itself
                if (obj.isMesh) {
                    obj.castShadow = true
                    obj.receiveShadow = true
                    if (obj.material) obj.material.side = 0
                }
            })
        }
    }, [gltf.scene])

    return (
        <group rotation={[0, Math.PI, 0]}>
            <primitive
                object={gltf.scene}
                scale={18}
                position={[0, -1.8, 0]}
            />

            {/* Embedded Screen Content */}
            {/* Embedded Screen Content */}
            <Html
                transform
                occlude="blending"
                position={[0.02, 0.18, 1.19]}
                rotation={[0, Math.PI, 0]}
                style={{
                    width: '335px',
                    height: '710px',
                    backgroundColor: 'black',
                    borderRadius: '56px',
                    overflow: 'hidden',
                }}
                scale={0.138}
            >
                <div
                    className="w-full h-full pointer-events-auto select-none"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </Html>
        </group>
    )
}

export function ApplePhone({
    children,
    className,
    finish = 'natural'
}: ApplePhoneProps) {
    const [mount, setMount] = useState(false)
    useEffect(() => { setMount(true) }, [])

    if (!mount) return <div className={cn("bg-slate-100 rounded-[3.5rem] animate-pulse", className)} />

    return (
        <div className={cn("relative w-[340px] h-[680px] md:w-[400px] md:h-[800px]", className)}>
            <ErrorBoundary fallback={<div className="flex items-center justify-center h-full text-red-500 font-bold">3D Error (Check Console)</div>}>
                <Canvas
                    shadows
                    camera={{ position: [0, 0, 6.5], fov: 40 }}
                    className="w-full h-full" // Removed 'cursor-grab' classes
                    gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
                    onCreated={({ gl }) => {
                        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
                    }}
                >
                    <Environment preset="studio" />
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 10, 5]} intensity={1.0} color="#fff7ed" castShadow />
                    <pointLight position={[-10, 0, -10]} intensity={0.5} color="#ffedd5" />
                    <spotLight position={[0, 5, 0]} intensity={0.8} color="#fff7ed" angle={1} penumbra={1} />

                    <Suspense fallback={<Loader />}>
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
                            <Model>
                                {children}
                            </Model>
                        </Float>
                        <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={40} blur={2.5} far={4.5} />
                    </Suspense>

                    {/* Disable user interaction for pure scrollytelling */}
                    <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} makeDefault />
                </Canvas>
            </ErrorBoundary>
        </div>
    )
}
