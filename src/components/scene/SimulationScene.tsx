// ============================================================================
// [MODULE 5] 3D SCENE COMPONENTS
// ============================================================================

const SimulationScene = ({ isPlaying, solverParams, viewParams, solverRef }: { isPlaying: boolean, solverParams: SolverParams, viewParams: ViewParams, solverRef: React.MutableRefObject<SoftBodySolver> }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);

    // Initialize Solver Once
    useEffect(() => {
        // Init a 20x20 cloth grid
        solverRef.current.initGrid(20, 20, 0.2, [0, 2, 0]);

        // Init Geometry
        if (geometryRef.current) {
            const solver = solverRef.current;
            geometryRef.current.setAttribute('position', new THREE.BufferAttribute(solver.pos, 3));
            geometryRef.current.setIndex(new THREE.BufferAttribute(solver.indices, 1));
            geometryRef.current.computeVertexNormals();
        }
    }, []); // Run once on mount

    // Animation Loop
    useFrame((state, delta) => {
        const solver = solverRef.current;
        const mesh = meshRef.current;
        const geo = geometryRef.current;

        // 1. Step Physics
        if (isPlaying) {
            // Use fixed time step from params, not frame delta, for stability
            solver.update(solverParams.dt, solverParams);
        }

        // 2. Sync Physics -> Render
        if (mesh && geo) {
            // Mark attributes as needing update
            geo.attributes.position.needsUpdate = true;
            // Recalculate normals for lighting
            geo.computeVertexNormals();
        }
    });

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001}>
                <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
            </directionalLight>

            <Grid position={[0, -0.01, 0]} args={[20, 20]} cellColor="#333333" sectionColor="#555555" fadeDistance={40} fadeStrength={1.5} />

            {/* The Dynamic Cloth Mesh */}
            <mesh ref={meshRef} castShadow receiveShadow>
                <bufferGeometry ref={geometryRef} />
                <meshStandardMaterial
                    color="#3b82f6"
                    side={THREE.DoubleSide}
                    flatShading={false}
                    roughness={0.8}
                    wireframe={viewParams.showWireframe}
                />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>

            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
            </GizmoHelper>
        </>
    );
};