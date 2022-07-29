import * as THREE from 'three'
import * as munsell from 'munsell'

/* global Image */

function main () {
  displayImage()
}

function renderPalette (palette) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
  renderer.setClearColor(0x777777)
  const container = document.getElementById('3d_output')
  container.appendChild(renderer.domElement)

  const cylinder = new THREE.Group()

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  // const segments = 40

  for (const mcolor of palette.keys()) {
    const [hue, value, chroma] = munsell.munsellToMhvc(mcolor)
    const [r, g, b] = munsell.munsellToRgb(mcolor)
    // if (r > 1 || g > 1 || b > 1 || r < 0 || g < 0 || b < 0) {
    //   continue
    // }
    const angle = 2 * Math.PI * hue / 100
    const color = new THREE.Color(r, g, b)
    const material = new THREE.MeshBasicMaterial({ color })

    const cube = new THREE.Mesh(geometry, material)
    cube.position.x = chroma * Math.sin(angle)
    cube.position.y = 2 * value
    cube.position.z = chroma * Math.cos(angle)

    cube.rotation.y = angle
    cylinder.add(cube)
  }

  scene.add(cylinder)

  camera.position.z = 20
  camera.position.y = 12
  camera.rotation.x = 0

  function animate () {
    cylinder.rotation.y += 0.003
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}

function displayImage () {
  const canvas = document.getElementById('image_input')
  const context = canvas.getContext('2d')
  const img = new Image()
  img.src = './poppy.jpg'
  img.onload = () => {
    console.log('Image loaded.')
    canvas.height = img.height
    canvas.width = img.width
    context.drawImage(img, 0, 0)
    const pixelData = context.getImageData(0, 0, img.width, img.height)
    console.log('About to iterate', pixelData.data.length)
    const colors = new Map()
    for (let offset = 0; offset < pixelData.data.length; offset += 400) {
      const r = pixelData.data[offset]
      const g = pixelData.data[offset + 1]
      const b = pixelData.data[offset + 2]
      let mhvc = munsell.rgb255ToMhvc(r, g, b)
      const [m, v, c] = [Math.round(mhvc[0]), Math.round(mhvc[1]), Math.round(mhvc[2])]
      mhvc = munsell.mhvcToMunsell(m, v, c)
      colors.set(mhvc, (colors.get(mhvc) || 0) + 1)
    }
    for (const [key, value] of colors.entries()) {
      if (value < 10) {
        colors.delete(key)
      }
    }
    console.log('Colours filtered!', colors)
    renderPalette(colors)
  }
}
main()
