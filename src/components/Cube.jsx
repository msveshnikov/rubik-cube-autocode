import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';
import { useCubeState } from '../hooks/useCubeState';

const Cube = ({ onMove, settings, pattern, tutorialMode }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [cubeGroup, setCubeGroup] = useState(null);
    const [controls, setControls] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [raycaster] = useState(new THREE.Raycaster());
    const [mouse] = useState(new THREE.Vector2());
    const { state, rotateFace } = useCubeState();

    const createCubelet = useCallback(
        (x, y, z, size, gap, colors) => {
            const geometry = new THREE.BoxGeometry(size, size, size);
            const materials = colors.map(
                (color) =>
                    new THREE.MeshPhongMaterial({
                        color: new THREE.Color(color),
                        shininess: 30,
                        specular: new THREE.Color(0x444444),
                        transparent: settings.highContrast,
                        opacity: settings.highContrast ? 0.9 : 1
                    })
            );
            const cubelet = new THREE.Mesh(geometry, materials);
            cubelet.position.set(x * (size + gap), y * (size + gap), z * (size + gap));
            cubelet.userData = { x, y, z };
            cubelet.castShadow = true;
            cubelet.receiveShadow = true;
            return cubelet;
        },
        [settings.highContrast]
    );

    const createCube = useCallback(() => {
        const group = new THREE.Group();
        const size = 1;
        const gap = 0.1;

        const colorScheme = settings.colorBlindMode
            ? {
                  right: 0x4363d8,
                  left: 0x911eb4,
                  top: 0xf58231,
                  bottom: 0x3cb44b,
                  front: 0xe6194b,
                  back: 0xffe119
              }
            : {
                  right: pattern === 'classic' ? 0xff0000 : 0x00ff00,
                  left: pattern === 'classic' ? 0xff8c00 : 0x0000ff,
                  top: pattern === 'classic' ? 0xffffff : 0xff0000,
                  bottom: pattern === 'classic' ? 0xffff00 : 0xff8c00,
                  front: pattern === 'classic' ? 0x00ff00 : 0xffffff,
                  back: pattern === 'classic' ? 0x0000ff : 0xffff00
              };

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cubeColors = [
                        x === 1 ? colorScheme.right : 0x282828,
                        x === -1 ? colorScheme.left : 0x282828,
                        y === 1 ? colorScheme.top : 0x282828,
                        y === -1 ? colorScheme.bottom : 0x282828,
                        z === 1 ? colorScheme.front : 0x282828,
                        z === -1 ? colorScheme.back : 0x282828
                    ];
                    const cubelet = createCubelet(x, y, z, size, gap, cubeColors);
                    group.add(cubelet);
                }
            }
        }
        return group;
    }, [createCubelet, pattern, settings.colorBlindMode]);

    const handleInteractionStart = useCallback(
        (event) => {
            if (isAnimating || !cubeGroup || !rendererRef.current) return;

            const coords = event.touches ? event.touches[0] : event;
            const rect = rendererRef.current.domElement.getBoundingClientRect();
            mouse.x = ((coords.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((coords.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubeGroup.children);

            if (intersects.length > 0) {
                const face = determineFace(intersects[0]);
                if (face && (!tutorialMode || state.moves.includes(face))) {
                    if (settings.hapticFeedback && window.navigator.vibrate) {
                        window.navigator.vibrate(50);
                    }
                    handleMove(face);
                }
            }
        },
        [
            camera,
            cubeGroup,
            isAnimating,
            mouse,
            raycaster,
            state.moves,
            tutorialMode,
            settings.hapticFeedback
        ]
    );

    const determineFace = (intersection) => {
        const normal = intersection.face.normal.clone();
        normal.transformDirection(intersection.object.matrixWorld);
        const absX = Math.abs(normal.x);
        const absY = Math.abs(normal.y);
        const absZ = Math.abs(normal.z);
        const max = Math.max(absX, absY, absZ);

        if (max === absX) return normal.x > 0 ? 'R' : 'L';
        if (max === absY) return normal.y > 0 ? 'U' : 'D';
        if (max === absZ) return normal.z > 0 ? 'F' : 'B';
    };

    const animateRotation = useCallback(
        async (face) => {
            return new Promise((resolve) => {
                const startRotation = cubeGroup.rotation.clone();
                const targetRotation = startRotation.clone();
                const axis =
                    face === 'U' || face === 'D' ? 'y' : face === 'R' || face === 'L' ? 'x' : 'z';
                const direction = face === 'U' || face === 'R' || face === 'F' ? 1 : -1;

                targetRotation[axis] += (Math.PI / 2) * direction;
                const duration = 500 / settings.animationSpeed;
                const startTime = Date.now();

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeProgress = 1 - Math.cos((progress * Math.PI) / 2);

                    cubeGroup.rotation[axis] =
                        startRotation[axis] +
                        (targetRotation[axis] - startRotation[axis]) * easeProgress;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };
                animate();
            });
        },
        [cubeGroup, settings.animationSpeed]
    );

    const handleMove = useCallback(
        async (face) => {
            if (isAnimating || !cubeGroup) return;
            setIsAnimating(true);
            await animateRotation(face);
            rotateFace(face, 'clockwise');
            onMove(face);
            setIsAnimating(false);
        },
        [animateRotation, cubeGroup, isAnimating, onMove, rotateFace]
    );

    useEffect(() => {
        const init = () => {
            const newScene = new THREE.Scene();
            newScene.background = new THREE.Color(settings.highContrast ? 0xffffff : 0xf0f0f0);

            const newCamera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            newCamera.position.set(5, 5, 7);

            const newRenderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            rendererRef.current = newRenderer;
            newRenderer.setSize(window.innerWidth, window.innerHeight);
            newRenderer.setPixelRatio(window.devicePixelRatio);
            newRenderer.shadowMap.enabled = true;
            newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

            if (mountRef.current.firstChild) {
                mountRef.current.removeChild(mountRef.current.firstChild);
            }
            mountRef.current.appendChild(newRenderer.domElement);

            const newControls = new OrbitControls(newCamera, newRenderer.domElement);
            newControls.enableDamping = true;
            newControls.dampingFactor = 0.05;
            newControls.rotateSpeed = 0.8;
            newControls.enablePan = false;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 10);
            directionalLight.castShadow = true;

            newScene.add(ambientLight);
            newScene.add(directionalLight);

            const group = createCube();
            newScene.add(group);

            setScene(newScene);
            setCamera(newCamera);
            setCubeGroup(group);
            setControls(newControls);

            const element = newRenderer.domElement;
            element.addEventListener('mousedown', handleInteractionStart);
            element.addEventListener('touchstart', handleInteractionStart, { passive: true });

            return () => {
                element.removeEventListener('mousedown', handleInteractionStart);
                element.removeEventListener('touchstart', handleInteractionStart);
                newRenderer.dispose();
                newControls.dispose();
            };
        };

        const cleanup = init();
        return () => {
            if (cleanup) cleanup();
        };
    }, [createCube, handleInteractionStart, settings.highContrast]);

    useEffect(() => {
        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            if (rendererRef.current && scene && camera) {
                rendererRef.current.render(scene, camera);
            }
        };
        animate();
    }, [camera, controls, scene]);

    useEffect(() => {
        const handleResize = () => {
            if (camera && rendererRef.current) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [camera]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

Cube.propTypes = {
    onMove: PropTypes.func.isRequired,
    settings: PropTypes.shape({
        animationSpeed: PropTypes.number,
        highContrast: PropTypes.bool,
        hapticFeedback: PropTypes.bool,
        colorBlindMode: PropTypes.bool
    }).isRequired,
    pattern: PropTypes.string,
    tutorialMode: PropTypes.bool
};

export default Cube;
