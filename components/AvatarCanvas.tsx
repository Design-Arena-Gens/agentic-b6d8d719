// @ts-nocheck
"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera
} from "@react-three/drei";
import type { Group } from "three";
import { MathUtils, Vector2 } from "three";

const BUFFER_SIZE = new Vector2();
import type { AvatarConfig } from "./avatarTypes";

type AvatarCanvasHandle = {
  capture: () => string | null;
};

type AvatarCanvasProps = {
  config: AvatarConfig;
};

const CaptureBridge = ({ onReady }: { onReady: (fn: () => string | null) => void }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    onReady(() => {
      const prevPixelRatio = gl.getPixelRatio();
      gl.getSize(BUFFER_SIZE);
      const targetWidth = 3840;
      const targetHeight = 2160;

      gl.setPixelRatio(1);
      gl.setSize(targetWidth, targetHeight, false);
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");

      gl.setPixelRatio(prevPixelRatio);
      gl.setSize(BUFFER_SIZE.x, BUFFER_SIZE.y, false);
      gl.render(scene, camera);

      return dataUrl;
    });
  }, [camera, gl, onReady, scene]);

  return null;
};

const AvatarMesh = ({ config }: { config: AvatarConfig }) => {
  const group = useRef<Group>(null);
  const hover = useRef(0);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }
    hover.current = (hover.current + delta * 0.3) % (Math.PI * 2);
    group.current.position.y = Math.sin(hover.current) * 0.04;
    group.current.rotation.y += delta * 0.2;
  });

  const {
    skinColor,
    hairColor,
    eyeColor,
    eyebrowColor,
    topColor,
    bottomColor,
    accessoryColor,
    height,
    bodyWidth,
    legLength,
    armLength,
    headScale,
    glossiness,
    beard
  } = config;

  const {
    legHeight,
    bodyHeight,
    headRadius,
    shoulderWidth
  } = useMemo(() => {
    const computedLeg = 1.1 * MathUtils.clamp(legLength, 0.6, 1.4);
    const computedBody = 1.25 * MathUtils.clamp(height, 0.7, 1.4);
    const computedHead = 0.38 * MathUtils.clamp(headScale, 0.7, 1.4);
    const shoulder = 0.6 * MathUtils.clamp(bodyWidth, 0.6, 1.6);
    return {
      legHeight: computedLeg,
      bodyHeight: computedBody,
      headRadius: computedHead,
      shoulderWidth: shoulder
    };
  }, [bodyWidth, headScale, height, legLength]);

  const armSpan = useMemo(() => 0.9 * MathUtils.clamp(armLength, 0.6, 1.5), [armLength]);

  const roughness = useMemo(() => MathUtils.clamp(1 - glossiness, 0.1, 0.85), [glossiness]);

  const torsoWidth = shoulderWidth * 0.7;

  const hipOffset = legHeight;
  const chestOffset = hipOffset + bodyHeight / 2;
  const headOffset = hipOffset + bodyHeight + headRadius * 1.15;

  return (
    <group ref={group} position={[0, hipOffset * -0.35, 0]}>
      <group>
        <mesh
          castShadow
          receiveShadow
          position={[0, chestOffset, 0]}
          scale={[torsoWidth, bodyHeight, torsoWidth * 0.8]}
        >
          <capsuleGeometry args={[0.32, 1, 16, 32]} />
          <meshStandardMaterial color={topColor} metalness={0.1} roughness={roughness} />
        </mesh>

        <group position={[0, hipOffset, 0]}>
          <mesh
            castShadow
            receiveShadow
            position={[-torsoWidth * 0.3, legHeight / 2, 0]}
            scale={[Math.max(0.18, torsoWidth * 0.35), legHeight, Math.max(0.18, torsoWidth * 0.35)]}
          >
            <capsuleGeometry args={[0.22, 1, 16, 32]} />
            <meshStandardMaterial color={bottomColor} metalness={0.08} roughness={roughness} />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[torsoWidth * 0.3, legHeight / 2, 0]}
            scale={[Math.max(0.18, torsoWidth * 0.35), legHeight, Math.max(0.18, torsoWidth * 0.35)]}
          >
            <capsuleGeometry args={[0.22, 1, 16, 32]} />
            <meshStandardMaterial color={bottomColor} metalness={0.08} roughness={roughness} />
          </mesh>
        </group>

        <mesh
          castShadow
          position={[0, headOffset, 0]}
          scale={[headRadius, headRadius, headRadius]}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color={skinColor} metalness={0.05} roughness={roughness} />
        </mesh>

        <mesh
          castShadow
          position={[0, headOffset + headRadius * 0.35, 0]}
          scale={[headRadius * 1.05, headRadius * 1.1, headRadius * 1.05]}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color={hairColor} metalness={0.2} roughness={Math.max(roughness * 0.7, 0.2)} />
        </mesh>

        <group position={[0, headOffset + headRadius * 0.2, headRadius * 0.65]}>
          <mesh position={[-headRadius * 0.35, 0, 0]} scale={[headRadius * 0.2, headRadius * 0.2, headRadius * 0.2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.05} />
          </mesh>
          <mesh position={[headRadius * 0.35, 0, 0]} scale={[headRadius * 0.2, headRadius * 0.2, headRadius * 0.2]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.05} />
          </mesh>
          <mesh position={[0, -headRadius * 0.22, 0]}
            scale={[headRadius * 0.5, headRadius * 0.12, headRadius * 0.1]}
          >
            <capsuleGeometry args={[1, 0.4, 16, 24]} />
            <meshStandardMaterial color={accessoryColor} roughness={0.15} metalness={0.35} />
          </mesh>
        </group>

        <group position={[0, headOffset + headRadius * 0.45, headRadius * 0.62]}>
          <mesh position={[-headRadius * 0.38, 0, 0]} scale={[headRadius * 0.35, headRadius * 0.08, headRadius * 0.08]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={eyebrowColor} roughness={0.25} metalness={0.05} />
          </mesh>
          <mesh position={[headRadius * 0.38, 0, 0]} scale={[headRadius * 0.35, headRadius * 0.08, headRadius * 0.08]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={eyebrowColor} roughness={0.25} metalness={0.05} />
          </mesh>
        </group>

        {beard && (
          <mesh
            position={[0, headOffset - headRadius * 0.15, headRadius * 0.58]}
            scale={[headRadius * 0.8, headRadius * 0.5, headRadius * 0.3]}
          >
            <capsuleGeometry args={[1, 0.8, 24, 32]} />
            <meshStandardMaterial color={hairColor} roughness={0.35} />
          </mesh>
        )}

        <group position={[0, hipOffset + bodyHeight * 0.55, 0]}>
          <mesh position={[-shoulderWidth, 0, 0]} scale={[0.22, armSpan, 0.22]} castShadow>
            <capsuleGeometry args={[0.5, 1, 16, 32]} />
            <meshStandardMaterial color={topColor} metalness={0.1} roughness={roughness} />
          </mesh>
          <mesh position={[shoulderWidth, 0, 0]} scale={[0.22, armSpan, 0.22]} castShadow>
            <capsuleGeometry args={[0.5, 1, 16, 32]} />
            <meshStandardMaterial color={topColor} metalness={0.1} roughness={roughness} />
          </mesh>
          <mesh
            position={[-shoulderWidth, -armSpan * 0.6, 0]}
            scale={[0.18, 0.25, 0.18]}
            castShadow
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={skinColor} roughness={roughness} metalness={0.05} />
          </mesh>
          <mesh
            position={[shoulderWidth, -armSpan * 0.6, 0]}
            scale={[0.18, 0.25, 0.18]}
            castShadow
          >
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={skinColor} roughness={roughness} metalness={0.05} />
          </mesh>
        </group>

        <mesh position={[0, hipOffset + 0.2, 0]} scale={[torsoWidth * 1.1, 0.12, torsoWidth * 1.1]} castShadow receiveShadow>
          <torusGeometry args={[1, 0.12, 24, 48]} />
          <meshStandardMaterial color={accessoryColor} metalness={0.65} roughness={Math.max(0.05, roughness * 0.4)} />
        </mesh>
      </group>
    </group>
  );
};

const Scene = ({ config }: { config: AvatarConfig }) => {
  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <PerspectiveCamera makeDefault position={[2.6, 2.2, 3.2]} fov={42} />
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[-6, 5, 2]}
        intensity={0.8}
        angle={0.6}
        penumbra={0.4}
      />
      <AvatarMesh config={config} />
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.55}
        width={10}
        height={10}
        blur={2.5}
        far={4}
      />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        minDistance={2.2}
        maxDistance={4}
        enableDamping
        dampingFactor={0.12}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
};

const AvatarCanvas = forwardRef<AvatarCanvasHandle, AvatarCanvasProps>(({ config }, ref) => {
  const captureRef = useRef<() => string | null>(() => null);

  useImperativeHandle(
    ref,
    () => ({
      capture: () => (captureRef.current ? captureRef.current() : null)
    }),
    []
  );

  return (
    <div className="canvas-container">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Scene config={config} />
        <CaptureBridge onReady={(fn) => {
          captureRef.current = fn;
        }} />
      </Canvas>
    </div>
  );
});

AvatarCanvas.displayName = "AvatarCanvas";

export type { AvatarCanvasHandle };
export default AvatarCanvas;
