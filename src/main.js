import * as THREE from 'three'
import * as munsell from 'munsell'

function hslColor (h, s, l) {
  let r, g, b
  [r, g, b] = munsell.mhvcToRgb(h, s, l)
  return new THREE.Color(r, g, b)
}

function main () {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x777777)
  document.body.appendChild(renderer.domElement)

  const cylinder = new THREE.Group()

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const segments = 10
  for (let i = 0; i < segments; i++) {
    const angle = i * 2 * Math.PI / segments
    for (let d = 0; d <= 8; d++) {
      for (let v = 0; v <= 10; v++) {
        const color = hslColor(100 * i / segments, v, d)
        const material = new THREE.MeshBasicMaterial({ color })

        const cube = new THREE.Mesh(geometry, material)
        cube.position.x = 2 * d * Math.sin(angle)
        cube.position.y = 2 * v
        cube.position.z = 2 * d * Math.cos(angle)

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
    cylinder.rotation.y += 0.001
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}
main()
