document.addEventListener("DOMContentLoaded", function () {
  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, 400); // Set the size of the renderer
  document.getElementById('3d-container').appendChild(renderer.domElement);

  // Add lighting
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  // Load the .obj file
  const loader = new THREE.OBJLoader();
  loader.load(
      'ducky.obj', // Replace with the path to your .obj file
      function (object) {
          scene.add(object); // Add the loaded object to the scene
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
      renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener('resize', function () {
      const width = window.innerWidth;
      const height = 400; // Fixed height for the header
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
  });
});