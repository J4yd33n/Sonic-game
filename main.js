//===================================================== full screen
var requestFullscreen = function (ele) {
    if (ele.requestFullscreen) {
        ele.requestFullscreen();
    } else if (ele.webkitRequestFullscreen) {
        ele.webkitRequestFullscreen();
    } else if (ele.mozRequestFullScreen) {
        ele.mozRequestFullScreen();
    } else if (ele.msRequestFullscreen) {
        ele.msRequestFullscreen();
    } else {
        console.log("Fullscreen API is not supported.");
    }
};
var exitFullscreen = function (ele) {
    if (ele.exitFullscreen) {
        ele.exitFullscreen();
    } else if (ele.webkitExitFullscreen) {
        ele.webkitExitFullscreen();
    } else if (ele.mozCancelFullScreen) {
        ele.mozCancelFullScreen();
    } else if (ele.msExitFullscreen) {
        ele.msExitFullscreen();
    } else {
        console.log("Fullscreen API is not supported.");
    }
};
//===================================================== add canvas
let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xd8e7ff, 0);
document.body.appendChild(renderer.domElement);

const hud = document.createElement("div");
hud.id = "hud";
hud.innerHTML = `
    <div class="hud-row"><span>Score</span><strong id="score">0</strong></div>
    <div class="hud-row"><span>Combo</span><strong id="combo">x1</strong></div>
`;
document.body.appendChild(hud);

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const gameState = { score: 0, combo: 1, boost: 0 };
let doJump = null;

function updateHud() {
    scoreEl.textContent = String(gameState.score);
    comboEl.textContent = "x" + String(gameState.combo);
}

function celebrate(message) {
    info.style.color = "hsl(" + Math.floor(Math.random() * 290) + ",90%,65%)";
    info.innerHTML = message;
    TweenLite.to(info, 0.35, {
        css: { fontSize: "42px", opacity: 1 },
        ease: Power4.easeOut,
        onComplete: function () {
            TweenLite.to(info, 0.7, {
                css: { fontSize: "14px", opacity: 0 },
                ease: Power4.easeOut
            });
        }
    });
}

function triggerBoost() {
    gameState.boost = Math.min(gameState.boost + 1.4, 3.5);
    celebrate("BOOST!");
    if (typeof doJump === "function") {
        doJump();
    }
}

window.addEventListener("keydown", function (event) {
    if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
        event.preventDefault();
        triggerBoost();
    }
});
//===================================================== resize
window.addEventListener("resize", function () {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
//===================================================== add Scene
let scene = new THREE.Scene();
//===================================================== add Camera
let camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
);
let cameraTarget = new THREE.Vector3(0, 0, 0);
//===================================================== add Group
group = new THREE.Group();
scene.add(group);
//===================================================== add Controls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
//How far you can orbit vertically, upper and lower limits. The maximum is Pi / 2 (90deg). You wont see below the below the line of the horizon
controls.maxPolarAngle = Math.PI / 2.1;
//===================================================== add VR
renderer.setPixelRatio(window.devicePixelRatio); //VR
effect = new THREE.StereoEffect(renderer); //VR
effect.setSize(window.innerWidth, window.innerHeight); //VR

var VR = false;
function toggleVR() {
    if (VR) {
        VR = false;
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    } else {
        VR = true;
        controls = new THREE.DeviceOrientationControls(camera);
        requestFullscreen(document.documentElement);
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//===================================================== curve points exported from blender using python
var points = [

    [1.8117204904556274, 5.987488269805908, 0.29106736183166504],
    [6.005367279052734, 1.7647128105163574, -1.5591322183609009],
    [1.435487985610962, -6.016839504241943, 2.1336286067962646],
    [-4.118395805358887, -6.886471271514893, -0.7294682264328003],
    [-4.732693195343018, 3.405961036682129, 3.1304938793182373],
    [8.304193496704102, 7.593861103057861, 0.3412821292877197],
    [8.038525581359863, -4.391696453094482, 2.687108278274536],
    [1.488401174545288, -9.993440628051758, -2.2956111431121826],
    [-5.277090549468994, -8.481210708618164, -0.719127893447876],
    [-7.250330448150635, -0.9653520584106445, -0.3089699447154999],
    [-6.526705741882324, 5.678538799285889, 0.15560221672058105],
    [-0.885545015335083, 6.678538799285889, 1.5724562406539917],
    [1.614454984664917, 5.678538799285889, 0.24559785425662994],
    [1.8117204904556274, 5.987488269805908, 0.29106736183166504]

];

var scale = 5;

//Convert the array of points into vertices
for (var i = 0; i < points.length; i++) {
    var x = points[i][0] * scale;
    var y = points[i][1] * scale;
    var z = points[i][2] * scale;
    points[i] = new THREE.Vector3(x, z, -y);
}

//Create a path from the points
var carPath = new THREE.CatmullRomCurve3(points);
var radius = 0.25;

var geometry = new THREE.TubeGeometry(carPath, 600, radius, 10, false);

//Set a different color on each face
for (var i = 0, j = geometry.faces.length; i < j; i++) {
    geometry.faces[i].color = new THREE.Color(
        "hsl(" + Math.floor(Math.random() * 290) + ",50%,50%)"
    );
}

var material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    vertexColors: THREE.FaceColors,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
});
var tube = new THREE.Mesh(geometry, material);
scene.add(tube);

//===================================================== add lighta
var light = new THREE.DirectionalLight(0xefefff, 1.25);
light.position.set(1, 1, 1).normalize();
scene.add(light);
var light = new THREE.DirectionalLight(0xffefef, 1.25);
light.position.set(-1, -1, -1).normalize();
scene.add(light);

//Create a point light in our scene. Makes everything gloomy
var light = new THREE.PointLight(0xffffff, 1, 100);
scene.add(light);

//===================================================== particles
var mergedGeometry = new THREE.Geometry();

var boxGeometry = new THREE.TetrahedronGeometry(0.25, 0);

var material = new THREE.MeshNormalMaterial({
    color: new THREE.Color("white")
});

for (var i = 0; i < 1000; i++) {
    var x = Math.random() * 125 - 75;
    var y = Math.random() * 125 - 75;
    var z = Math.random() * 125 - 75;

    boxGeometry.translate(x, y, z);

    mergedGeometry.merge(boxGeometry);

    boxGeometry.translate(-x, -y, -z);
}

var cubes = new THREE.Mesh(mergedGeometry, material);
scene.add(cubes);

//===================================================== Loader
//3d model from https://sketchfab.com/models/ab92d9b324724e18968377264d05774d
var loader = new THREE.GLTFLoader();
var model;
loader.load(
    "https://raw.githubusercontent.com/baronwatts/models/master/sky-island.glb",
    function (gltf) {
        gltf.scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.material.side = THREE.DoubleSide;
            }
        });

        model = gltf.scene;
        model.scale.set(3, 3, 3);
        model.position.set(0, -20, -10);
        //model.rotateY(Math.PI);
        scene.add(model);
    }
);

//===================================================== Loader
//3d model from https://3dwarehouse.sketchup.com/user/0438052632930067253040161/wingedkoopa67?nav=models
var clock = new THREE.Clock();
var mixer = null;
var firstObject;
var loader = new THREE.GLTFLoader();

function buildFallbackSonic() {
    var sonic = new THREE.Group();

    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f7cff, emissive: 0x103f8a, metalness: 0.2, roughness: 0.5 });
    var accentMat = new THREE.MeshStandardMaterial({ color: 0xf9d95b, emissive: 0x8a6a00, metalness: 0.15, roughness: 0.55 });
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.6 });
    var skinMat = new THREE.MeshStandardMaterial({ color: 0xf5c49b, emissive: 0x2a180b, roughness: 0.8 });

    var torso = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 0.7), bodyMat);
    torso.position.y = 0.9;
    sonic.add(torso);

    var head = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 24), skinMat);
    head.position.y = 2.0;
    sonic.add(head);

    var quill = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 8), accentMat);
    quill.position.set(0, 2.65, 0);
    quill.rotation.z = Math.PI;
    sonic.add(quill);

    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), skinMat);
    nose.position.set(0, 1.9, 0.54);
    sonic.add(nose);

    var tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.1, 10), accentMat);
    tail.position.set(-0.8, 1.2, -0.45);
    tail.rotation.z = -0.9;
    sonic.add(tail);

    var leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.85, 10), bodyMat);
    leftArm.position.set(-0.9, 1.1, 0);
    leftArm.rotation.z = 0.9;
    sonic.add(leftArm);

    var rightArm = leftArm.clone();
    rightArm.position.x = 0.9;
    rightArm.rotation.z = -0.9;
    sonic.add(rightArm);

    var leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 12), bodyMat);
    leftLeg.position.set(-0.38, -0.45, 0.1);
    sonic.add(leftLeg);

    var rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.38;
    sonic.add(rightLeg);

    var leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.24, 0.9), shoeMat);
    leftShoe.position.set(-0.38, -1.1, 0.18);
    sonic.add(leftShoe);

    var rightShoe = leftShoe.clone();
    rightShoe.position.x = 0.38;
    sonic.add(rightShoe);

    sonic.scale.set(0.65, 0.65, 0.65);
    sonic.position.y = 0.4;
    return sonic;
}

function setupFallbackJump() {
    doJump = function () {
        if (!firstObject) return;
        firstObject.rotation.z = -0.6;
        setTimeout(function () {
            firstObject.rotation.z = 0;
        }, 220);
    };
}

loader.load(
    "https://raw.githubusercontent.com/baronwatts/models/master/sonic.glb",
    function (gltf) {
        gltf.scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.material.side = THREE.DoubleSide;
            }
        });

        firstObject = gltf.scene;
        firstObject.scale.set(0.65, 0.65, 0.65);
        group.add(firstObject);

        console.log(gltf.animations); //shows all animations imported into the dopesheet in blender

        mixer = new THREE.AnimationMixer(firstObject);
        if (gltf.animations && gltf.animations.length > 0) {
            mixer.clipAction(gltf.animations[0]).play();
        }

        doJump = function () {
            if (!mixer || !gltf || !gltf.animations || gltf.animations.length < 2) {
                return;
            }
            mixer.clipAction(gltf.animations[0]).stop();
            mixer.clipAction(gltf.animations[1]).play();
            setTimeout(function () {
                mixer.clipAction(gltf.animations[1]).stop();
                mixer.clipAction(gltf.animations[0]).play();
            }, 900);
        };

        document.body.addEventListener("click", doJump);
    },
    undefined,
    function (error) {
        console.warn("Sonic GLTF failed to load, using fallback character instead.", error);
        firstObject = buildFallbackSonic();
        group.add(firstObject);
        setupFallbackJump();
        document.body.addEventListener("click", doJump);
    }
);

if (!firstObject) {
    firstObject = buildFallbackSonic();
    group.add(firstObject);
    setupFallbackJump();
    document.body.addEventListener("click", doJump);
}

//===================================================== add model
var size = 0.05;
var meshList = [];

for (var i = 0; i < carPath.points.length; i++) {
    var x = carPath.points[i].x;
    var y = carPath.points[i].y;
    var z = carPath.points[i].z;

    var geometry = new THREE.TorusGeometry(3, 0.5, 8, 50);
    var material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("yellow")
    });
    var secondObject = new THREE.Mesh(geometry, material);
    secondObject.position.set(x, y + 0.75, z);
    secondObject.scale.set(size, size, size);
    meshList.push(secondObject);
    scene.add(secondObject);
}

//===================================================== Collision Detection
function PlaySound() {
    bflat.play();
}

//calculate distance of the main object
firstBB = new THREE.Box3().setFromObject(group);

//calculate distance for all other objects
for (var i = 0; i < meshList.length; i++) {
    secondBB = new THREE.Box3().setFromObject(meshList[i]);
}

var count = 0;
function hit() {
    //recalculate distance for the main object
    firstBB = new THREE.Box3().setFromObject(group);
    //recalcuate distance for all the other objects
    for (var i = 0; i < meshList.length; i++) {
        secondBB = new THREE.Box3().setFromObject(meshList[i]);

        if (firstBB.isIntersectionBox(secondBB)) {
            PlaySound();
            gameState.score += 25 * gameState.combo;
            gameState.combo = Math.min(gameState.combo + 1, 12);
            gameState.boost = Math.min(gameState.boost + 0.35, 3.5);
            updateHud();

            const messages = ["SUPERB!", "OUTSTANDING!", "AWESOME!", "SONIC SPEED!", "RING BLAST!", "MAX BOOST!"];
            celebrate(messages[Math.floor(Math.random() * messages.length)]);
            meshList[i].scale.set(0.22, 0.22, 0.22);
            setTimeout(function () {
                meshList[i].scale.set(0.05, 0.05, 0.05);
            }, 180);

            if (gameState.combo > 1) {
                gameState.boost = Math.min(gameState.boost + 0.25, 3.5);
            }
        } //end if
    } //end for
} //end hit

//===================================================== bloom
var renderScene = new THREE.RenderPass(scene, camera);
var shaderActive = "none";
var gui = new dat.GUI();
dat.GUI.toggleHide();
var composer;

var parameters = {
    x: 0,
    y: 30,
    z: 0,
    bloomStrength: 1.0,
    bloomRadius: 1.0,
    bloomThreshold: 0.45,
    useShaderNone: function () {
        setupShaderNone();
    },
    useShaderBloom: function () {
        setupShaderBloom();
    }
};

gui.add(parameters, "useShaderNone").name("Display Original Scene");

var folderBloom = gui.addFolder("Bloom");
var bloomStrengthGUI = folderBloom
    .add(parameters, "bloomStrength")
    .min(0.0)
    .max(2.0)
    .step(0.01)
    .name("Strength")
    .listen();
bloomStrengthGUI.onChange(function (value) {
    setupShaderBloom();
});
var bloomRadiusGUI = folderBloom
    .add(parameters, "bloomRadius")
    .min(0.0)
    .max(5.0)
    .step(0.01)
    .name("Radius")
    .listen();
bloomRadiusGUI.onChange(function (value) {
    setupShaderBloom();
});
var bloomThresholdGUI = folderBloom
    .add(parameters, "bloomThreshold")
    .min(0)
    .max(0.99)
    .step(0.01)
    .name("Threshold")
    .listen();
bloomThresholdGUI.onChange(function (value) {
    setupShaderBloom();
});
folderBloom.add(parameters, "useShaderBloom").name("Use Bloom Shader");
folderBloom.open();

//===================================================== functions

function setupShaderNone() {
    shaderActive = "none";
}

function setupShaderBloom() {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    /*unreal bloom*/
    var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
    );

    var copyShader = new THREE.ShaderPass(THREE.CopyShader);
    copyShader.renderToScreen = true;

    var bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        parameters.bloomStrength,
        parameters.bloomRadius,
        parameters.bloomThreshold
    );

    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    composer.addPass(effectFXAA);
    composer.addPass(bloomPass);
    composer.addPass(copyShader);
    shaderActive = "bloom";
}

function isShaderActive() {
    if (shaderActive == "none") {
        renderer.render(scene, camera);
    } else {
        composer.render();
    }
}

//active bloom on load
setupShaderBloom();

//===================================================== Animate
var percentage = 0;
var prevTime = Date.now();
function POV() {
    gameState.boost *= 0.985;
    percentage += 0.00045 * (1 + gameState.boost * 0.45);
    var p1 = carPath.getPointAt(percentage % 1);
    var p2 = carPath.getPointAt((percentage + 0.01) % 1);
    var p3 = carPath.getPointAt((percentage + 0.01 / 2) % 1);
    var p4 = carPath.getPointAt((percentage + 0.01 / 4) % 1);

    camera.lookAt(p2);

    group.position.set(p3.x, p3.y + 0.25, p3.z);
    group.lookAt(p2);
    group.rotation.z = Math.sin(performance.now() * 0.01) * 0.25 * (1 + gameState.boost);
    group.rotation.x = Math.cos(performance.now() * 0.008) * 0.15;

    camera.position.x = p4.x + 2 + Math.sin(performance.now() * 0.005) * 0.45;
    camera.position.y = p4.y + 1 + gameState.boost * 0.2;
    camera.position.z = p4.z + 2 + Math.cos(performance.now() * 0.004) * 0.35;
    camera.lookAt(group.position);
}

function animate() {
    POV();
    hit();
    var delta = clock.getDelta();
    if (mixer != null) mixer.update(delta);

    if (cubes) {
        cubes.rotation.x += 0.006;
        cubes.rotation.y += 0.008;
    }

    if (meshList.length) {
        for (var i = 0; i < meshList.length; i++) {
            meshList[i].rotation.x += 0.12;
            meshList[i].rotation.y += 0.08;
            meshList[i].position.y += Math.sin(performance.now() * 0.008 + i) * 0.003;
        }
    }

    //VR
    if (VR) {
        effect.render(scene, camera);
    } else {
        //renderer.render( scene, camera );
        isShaderActive();
    }

    requestAnimationFrame(animate);
    controls.update();
}
animate();

updateHud();

//set camera position
camera.position.x = 40;
camera.position.y = 50;
camera.position.z = 50;

