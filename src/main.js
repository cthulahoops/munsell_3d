import * as THREE from 'three'
import * as munsell from 'munsell'

// Helpful for debugging, remove later. (There must be a better way!)
window.munsell = munsell

/* global Image */

// function main () {
// displayImage()
// }

function renderPalette (palette) {
  const scene = new THREE.Scene()
  const container = document.getElementById('output_3d')

  const width = 0.9 * container.clientWidth;
  const height = width;

  const camera = new THREE.PerspectiveCamera(75, height / width, 0.1, 1000)

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.setClearColor(0x777777)
  container.appendChild(renderer.domElement)

  const cylinder = new THREE.Group()

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  // const segments = 40

  for (const mcolor of palette.keys()) {
    const [hue, value, chroma] = JSON.parse(mcolor)
    const [r, g, b] = munsell.mhvcToRgb(hue, value, chroma)
    // if (r > 1 || g > 1 || b > 1 || r < 0 || g < 0 || b < 0) {
    //   continue
    // }
    const angle = 2 * Math.PI * hue / 100
    const color = new THREE.Color(r, g, b)
    const material = new THREE.MeshBasicMaterial({ color })

    const cube = new THREE.Mesh(geometry, material)
    cube.position.x = chroma * Math.sin(angle)
    cube.position.y = value
    cube.position.z = chroma * Math.cos(angle)

    cube.rotation.y = angle
    cylinder.add(cube)
  }

  scene.add(cylinder)

  let viewAngle = Math.PI / 4
  let cameraDistance = 30
  camera.position.z = cameraDistance * Math.cos(viewAngle)
  camera.position.y = 5 + cameraDistance * Math.sin(viewAngle)
  camera.rotation.x = -viewAngle

  let lastPositionX
  let lastPositionY
  renderer.domElement.addEventListener('pointermove', (event) => {
    if (event.buttons == 1) {
      const positionX = event.clientX / width
      const positionY = event.clientY / width
      if (lastPositionX) {
        cylinder.rotation.y += 2.0 * (positionX - lastPositionX)
      }
      if (lastPositionY) {
        cylinder.rotation.x += 2.0 * (positionY - lastPositionY)
      }
      lastPositionX = positionX
      lastPositionY = positionY
    } else {
      lastPositionX = null
      lastPositionY = null
    }
  })

  function animate () {
    window.requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}

function displayImage (imageFile) {
  const canvas = document.getElementById('image_input')
  const context = canvas.getContext('2d')
  const img = new Image()
  img.file = imageFile

  const reader = new FileReader()
  reader.onload = (function (aImg) { return function (e) { aImg.src = e.target.result } })(img)
  reader.readAsDataURL(imageFile)

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
      const [m, v, c] = [roundTo(mhvc[0], 2.5), roundTo(mhvc[1], 2.0), roundTo(mhvc[2], 2.0)]
      // TODO Would like to use Munsell string here instead of JSON, but the library does wrong rounding and mangles 2.5.
      mhvc = JSON.stringify([m, v, c])
      colors.set(mhvc, (colors.get(mhvc) || 0) + 1)
    }
    for (const [key, value] of colors.entries()) {
      if (value < 5) {
        colors.delete(key)
      }
    }
    console.log('Colours filtered!', colors)
    renderPalette(colors)
  }
}

function roundTo (value, step) {
  return step * Math.round(value / step)
}

const fileInput = document.getElementById('select_file')

fileInput.onchange = () => {
  const selectedFile = fileInput.files[0]
  console.log(selectedFile)
  displayImage(selectedFile)
}
