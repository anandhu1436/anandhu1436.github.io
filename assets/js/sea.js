const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight / 2;

// Wave properties for each layer
let waveAmplitude1 = 10;  // Reduced amplitude for flatter waves
let waveFrequency1 = 0.02;
let waveSpeed1 = 0.05;

let waveAmplitude2 = 8;   // Reduced amplitude for flatter waves
let waveFrequency2 = 0.03;
let waveSpeed2 = 0.06;

let waveAmplitude3 = 6;   // Reduced amplitude for flatter waves
let waveFrequency3 = 0.04;
let waveSpeed3 = 0.07;

let waveAmplitude4 = 4;   // Additional light layer
let waveFrequency4 = 0.05;
let waveSpeed4 = 0.08;

let waveAmplitude5 = 2;   // Additional light layer
let waveFrequency5 = 0.06;
let waveSpeed5 = 0.09;

let offset1 = 0;
let offset2 = 0;
let offset3 = 0;
let offset4 = 0;
let offset5 = 0;

// Vertical offsets to prevent waves from intersecting
let verticalOffset5 = canvas.height / 2; // Base height for the first wave
let verticalOffset4 = verticalOffset5 - 20; // Second wave slightly higher
let verticalOffset3 = verticalOffset4 - 15; // Third wave slightly higher
let verticalOffset2 = verticalOffset3 - 10; // Fourth wave slightly higher
let verticalOffset1 = verticalOffset2 - 5;  // Fifth wave slightly higher

function drawWave(amplitude, frequency, speed, offset, color, verticalOffset) {
    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x++) {
        let y = Math.sin(x * frequency + offset) * amplitude + verticalOffset; // Use verticalOffset to position the wave
        ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function animateWaves() {
    requestAnimationFrame(animateWaves);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update offsets for each wave layer
    offset1 += waveSpeed1;
    offset2 += waveSpeed2;
    offset3 += waveSpeed3;
    offset4 += waveSpeed4;
    offset5 += waveSpeed5;

    // Draw the waves with different colors, properties, and vertical offsets
    drawWave(waveAmplitude1, waveFrequency1, waveSpeed1, offset1, "#4A90E2", verticalOffset1); // Dark blue
    drawWave(waveAmplitude2, waveFrequency2, waveSpeed2, offset2, "#5AA9E6", verticalOffset2); // Medium blue
    
    drawWave(waveAmplitude3, waveFrequency3, waveSpeed3, offset3, "#7FB8E6", verticalOffset3); // Light blue
    drawWave(waveAmplitude4, waveFrequency4, waveSpeed4, offset4, "#A2D5F2", verticalOffset4); // Lighter blue
    drawWave(waveAmplitude5, waveFrequency5, waveSpeed5, offset5, "#C7E9F5", verticalOffset5); // Lightest blue
}

animateWaves();

// WebGL Duck Integration
document.addEventListener("DOMContentLoaded", function () {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable transparency

    // Set the size of the renderer to match the canvas size
    renderer.setSize(canvas.width, canvas.height);

    // Append the WebGL canvas to the same container as the 2D canvas
    canvas.parentElement.appendChild(renderer.domElement);

    // Position the WebGL canvas on top of the 2D canvas
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";

    // Add lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Custom Shader Material
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor;
      uniform float uShininess;
      uniform float uTranslucency;

      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        // Light direction (simplified)
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));

        // Diffuse lighting
        float diffuse = max(dot(vNormal, lightDir), 0.0);

        // Specular lighting
        vec3 viewDir = normalize(vViewPosition);
        vec3 reflectDir = reflect(-lightDir, vNormal);
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);

        // Combine effects
        vec3 color = uColor * (diffuse + specular);
        color = mix(color, vec3(1.0, 1.0, 1.0), uTranslucency); // Add translucency

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uColor: { value: new THREE.Color(1, 0.0, 0.0) }, // Balloon color (red)
            uShininess: { value: 32.0 }, // Controls specular highlight
            uTranslucency: { value: 0.5 }, // Controls translucency
        },
        transparent: true,
        side: THREE.DoubleSide, // Render both sides of the material
    });

    // Load the .obj file
    const loader = new THREE.OBJLoader();
    loader.load(
        'assets/models/ducky.obj', // Replace with the path to your .obj file
        function (object) {
            // object.rotation.set(0, 0, 0); // Adjust scale as needed
            // Traverse the loaded object and apply the shader material
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = shaderMaterial; // Apply custom shader material
                }
            });

            // Add the loaded object to the scene
            scene.add(object);

            // Store the object for rotation
            window.duck = object;

        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened while loading the .obj file:', error);
        }
    );

    // Position the camera
    camera.position.z = 5;

    // Render the scene
    function animateDuck() {
        requestAnimationFrame(animateDuck);

        // Rotate the duck model
        if (window.duck) {
            window.duck.position.x += 0.01; // Adjust movement speed as needed

            // Check if the duck is out of the window bounds
            if (window.duck.position.x > (canvas.width / 100)) {
                window.duck.position.x = - (canvas.width / 100); // Reset position to the left
            }

            // Rotate the duck to make it look like it's rotating naturally
            // window.duck.rotation.y += 0.01; // Adjust rotation speed as needed
        }

        renderer.render(scene, camera);
    }
    animateDuck();

    // Handle window resize
    window.addEventListener('resize', function () {
        const width = window.innerWidth;
        const height = window.innerHeight / 2;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
});

