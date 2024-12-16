import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';
import { useCubeState } from '../hooks/useCubeState';

const Cube = ({ onMove, settings, pattern, tutorialMode }) => {
    const mountRef = useRef(null);
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [cubeGroup, setCubeGroup] = useState(null);
    const [controls, setControls] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [raycaster] = useState(new THREE.Raycaster());
    const [mouse] = useState(new THREE.Vector2());
    const { state, rotateFace } = useCubeState();

    const createCubelet = useCallback((x, y, z, size, gap, colors) => {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const materials = colors.map(
            (color) =>
                new THREE.MeshPhongMaterial({
                    color: new THREE.Color(color),
                    shininess: 30,
                    specular: new THREE.Color(0x444444)
                })
        );
        const cubelet = new THREE.Mesh(geometry, materials);
        cubelet.position.set(x * (size + gap), y * (size + gap), z * (size + gap));
        cubelet.userData = { x, y, z };
        return cubelet;
    }, []);

    const createCube = useCallback(() => {
        const group = new THREE.Group();
        const size = 1;
        const gap = 0.1;

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const colors = [
                        x === 1 ? 0xff0000 : 0x282828,
                        x === -1 ? 0xff8c00 : 0x282828,
                        y === 1 ? 0xffffff : 0x282828,
                        y === -1 ? 0xffff00 : 0x282828,
                        z === 1 ? 0x00ff00 : 0x282828,
                        z === -1 ? 0x0000ff : 0x282828
                    ];

                    const cubelet = createCubelet(x, y, z, size, gap, colors);
                    group.add(cubelet);
                }
            }
        }

        return group;
    }, [createCubelet]);

    const handleMouseDown = useCallback(
        (event) => {
            if (isAnimating || !cubeGroup) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubeGroup.children);

            if (intersects.length > 0) {
                const face = determineFace(intersects[0]);
                if (face) handleMove(face);
            }
        },
        [camera, cubeGroup, isAnimating, mouse, raycaster, renderer]
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
        (face, angle) => {
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

                    cubeGroup.rotation[axis] =
                        startRotation[axis] +
                        (targetRotation[axis] - startRotation[axis]) * progress;

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

            await animateRotation(face, Math.PI / 2);
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

            const newRenderer = new THREE.WebGLRenderer({ antialias: true });
            newRenderer.setSize(window.innerWidth, window.innerHeight);
            newRenderer.shadowMap.enabled = true;
            mountRef.current.appendChild(newRenderer.domElement);

            const newControls = new OrbitControls(newCamera, newRenderer.domElement);
            newControls.enableDamping = true;
            newControls.dampingFactor = 0.05;

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            newScene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 10);
            newScene.add(directionalLight);

            const group = createCube();
            newScene.add(group);

            setScene(newScene);
            setCamera(newCamera);
            setRenderer(newRenderer);
            setCubeGroup(group);
            setControls(newControls);

            newRenderer.domElement.addEventListener('mousedown', handleMouseDown);

            return () => {
                newRenderer.domElement.removeEventListener('mousedown', handleMouseDown);
            };
        };

        const cleanup = init();
        return () => {
            if (cleanup) cleanup();
            if (mountRef.current && renderer) {
                mountRef.current.removeChild(renderer.domElement);
                renderer.dispose();
            }
        };
    }, [createCube, handleMouseDown, renderer, settings.highContrast]);

    useEffect(() => {
        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };

        animate();
    }, [camera, controls, renderer, scene]);

    useEffect(() => {
        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [camera, renderer]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

Cube.propTypes = {
    onMove: PropTypes.func.isRequired,
    settings: PropTypes.shape({
        animationSpeed: PropTypes.number,
        highContrast: PropTypes.bool
    }).isRequired,
    pattern: PropTypes.string,
    tutorialMode: PropTypes.bool
};

export default Cube;
