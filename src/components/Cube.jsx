import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

const Cube = ({ onMove, settings }) => {
    const mountRef = useRef(null);
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [cubeGroup, setCubeGroup] = useState(null);
    const [controls, setControls] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const init = () => {
            const newScene = new THREE.Scene();
            newScene.background = new THREE.Color(0xf0f0f0);

            const newCamera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            newCamera.position.set(5, 5, 7);

            const newRenderer = new THREE.WebGLRenderer({ antialias: true });
            newRenderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current.appendChild(newRenderer.domElement);

            const newControls = new OrbitControls(newCamera, newRenderer.domElement);
            newControls.enableDamping = true;
            newControls.dampingFactor = 0.05;

            const group = createCube();
            newScene.add(group);

            setScene(newScene);
            setCamera(newCamera);
            setRenderer(newRenderer);
            setCubeGroup(group);
            setControls(newControls);

            animate();
        };

        const createCube = () => {
            const group = new THREE.Group();
            const cubelets = [];
            const size = 1;
            const gap = 0.1;

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    for (let z = -1; z <= 1; z++) {
                        const geometry = new THREE.BoxGeometry(size, size, size);
                        const materials = Array(6)
                            .fill()
                            .map(
                                () => new THREE.MeshBasicMaterial({ color: getFaceColor(x, y, z) })
                            );
                        const cubelet = new THREE.Mesh(geometry, materials);

                        cubelet.position.set(x * (size + gap), y * (size + gap), z * (size + gap));

                        cubelets.push(cubelet);
                        group.add(cubelet);
                    }
                }
            }

            return group;
        };

        const getFaceColor = (x, y, z) => {
            if (settings.highContrast) {
                return z === 1
                    ? 0xff0000
                    : z === -1
                      ? 0xff8c00
                      : y === 1
                        ? 0xffffff
                        : y === -1
                          ? 0xffff00
                          : x === 1
                            ? 0x00ff00
                            : 0x0000ff;
            }

            return z === 1
                ? 0xff0000
                : z === -1
                  ? 0xff8c00
                  : y === 1
                    ? 0xffffff
                    : y === -1
                      ? 0xffff00
                      : x === 1
                        ? 0x00ff00
                        : 0x0000ff;
        };

        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        };

        const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

        init();
        window.addEventListener('resize', handleResize);

        const currentRenderer = renderer;
        const currentMount = mountRef.current;

        return () => {
            window.removeEventListener('resize', handleResize);
            if (currentMount && currentRenderer) {
                currentMount.removeChild(currentRenderer.domElement);
                currentRenderer.dispose();
            }
        };
    }, [camera, controls, renderer, scene, settings.highContrast]);

    const handleMove = (face) => {
        if (isAnimating || !cubeGroup) return;
        setIsAnimating(true);

        const rotationMatrix = new THREE.Matrix4();
        const axis = face === 'U' || face === 'D' ? 'y' : face === 'R' || face === 'L' ? 'x' : 'z';

        const direction = face === 'U' || face === 'R' || face === 'F' ? 1 : -1;
        rotationMatrix.makeRotationAxis(
            new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0),
            (Math.PI / 2) * direction
        );

        const duration = 500 / settings.animationSpeed;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                onMove(face);
            }
        };

        animate();
    };

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

Cube.propTypes = {
    onMove: PropTypes.func.isRequired,
    settings: PropTypes.shape({
        animationSpeed: PropTypes.number,
        highContrast: PropTypes.bool
    }).isRequired
};

export default Cube;
