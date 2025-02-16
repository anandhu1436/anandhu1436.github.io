document.addEventListener("DOMContentLoaded", function () {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
  
    // Set the background color of the canvas to white
    renderer.setClearColor(0xffffff); // 0xffffff is the hex code for white
  
    // Get the header element
    const header = document.querySelector('header.header#home');
  
    // Set the size of the renderer to match the header size
    renderer.setSize(header.clientWidth, header.clientHeight);
  
    // Append the canvas to the header
    header.appendChild(renderer.domElement);
  
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
        object.rotation.set(0, 0, 0); // Adjust scale as needed
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
    function animate() {
      requestAnimationFrame(animate);
  
      // Rotate the duck model
      if (window.duck) {
        window.duck.rotation.y += 0.0; // Adjust rotation speed as needed
      }
  
      renderer.render(scene, camera);
    }
    animate();
  
    // Handle window resize
    window.addEventListener('resize', function () {
      const width = header.clientWidth;
      const height = header.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  });

