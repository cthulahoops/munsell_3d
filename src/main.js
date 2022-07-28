import * as THREE from 'three'
import * as munsell from 'munsell'

function main () {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x777777)
  document.body.appendChild(renderer.domElement)

  const cylinder = new THREE.Group()

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const segments = 20
  for (let i = 0; i < segments; i++) {
    const angle = i * 2 * Math.PI / segments
    for (let value = 1; value <= 9; value++) {
      for (let chroma = 2; chroma <= 18; chroma += 2) {
        const [r, g, b] = munsell.mhvcToRgb(100 * i / segments, value, chroma)
        if (r > 1 || g > 1 || b > 1 || r < 0 || g < 0 || b < 0) {
          continue
        }
        const color = new THREE.Color(r, g, b)
        const material = new THREE.MeshBasicMaterial({ color })

        const cube = new THREE.Mesh(geometry, material)
        cube.position.x = chroma * Math.sin(angle)
        cube.position.y = 2 * value
        cube.position.z = chroma * Math.cos(angle)

        cube.rotation.y = angle
        cylinder.add(cube)
      }
    }
  }

  scene.add(cylinder)

  camera.position.z = 30
  camera.position.y = 25
  camera.rotation.x = -0.5

  function animate () {
    cylinder.rotation.y += 0.003
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}
main()
