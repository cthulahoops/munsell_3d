import * as THREE from 'three'

// Taken from: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#9493060
function hslColor (h, s, l) {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = function hue2rgb (p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

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
  const segments = 36
  for (let i = 0; i < segments; i++) {
    const angle = i * 2 * Math.PI / segments
    for (let d = 0; d <= 8; d++) {
      for (let v = 0; v <= 10; v++) {
        const color = hslColor(angle / (Math.PI * 2), 0.125 * d, v * 0.1)
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
    cylinder.rotation.y += 0.02
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}
main()
