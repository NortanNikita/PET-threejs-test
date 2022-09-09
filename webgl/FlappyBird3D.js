import {
  AnimationClip,
  AnimationMixer,
  WebGLRenderer,
  CubeTextureLoader,
  TextureLoader,
  LoadingManager,
  Scene,
  Shape,
  PerspectiveCamera,
  Matrix4,
  AxesHelper,
  PCFSoftShadowMap,
  AmbientLight,
  sRGBEncoding,
  ACESFilmicToneMapping,
  BoxGeometry,
  IcosahedronGeometry,
  CylinderGeometry,
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  MeshPhysicalMaterial,
  MeshPhongMaterial,
  DoubleSide,
  MeshBasicMaterial,
  Mesh,
  Color,
  Clock,
  SpotLight,
  Vector3,
  Group,
  Euler,
  Object3D,
  CubeTexture,
  LoopOnce
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GridHelper } from 'three/src/helpers/GridHelper'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

class ViewController {
  constructor(container) {
    this.container = container
    this.frame = 0
    this.pixelRatio = window.devicePixelRatio
    this.AA = this.pixelRatio <= 1
    this.width = 0
    this.height = 0

    this.camera = {}
    this.scene = {} 
    this.meshesContainer = {}
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.toneMappingExposure = 0.6
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.powerPreference = "high-performance"
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap
    this.container.style.overflow = "hidden"
    this.container.style.margin = 0
    this.container.appendChild(this.renderer.domElement)
    this._createCamera()
    this._createScene()
  }
  _createCamera() {
    this.camera = new PerspectiveCamera(
      70,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set( 0, 6, 0 );
    this.camera.lookAt(0,0,0)
  }
  _createScene() {
    this.scene = new Scene();
    const axesHelper = new AxesHelper( 5 );
    this.scene.add( axesHelper );
    const size = 100;
    const divisions = 100;
    const gridHelper = new GridHelper( size, divisions );
    this.scene.add( gridHelper );
  }
  _createPlane() {
    const texture = new TextureLoader().load( require('../sand.jpeg') )
    const geometry = new PlaneGeometry( 10, 10 );
    const material = new MeshBasicMaterial( {map: texture, side: DoubleSide} );
    const plane = new Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2
    this.scene.add( plane );
  }
  _createCylinder() {
    this.meshesContainer = new Group(); // Контейнер для множества Мешей
    this.scene.add(this.meshesContainer)
    let geometry = new CylinderGeometry( 0.5, 0.5, 4, 32 )
    let material = new MeshBasicMaterial( {color: 0xffff00} )
    let cylinderUpper = new Mesh( geometry, material )
    let cylinderUnder = new Mesh( geometry, material )
    cylinderUpper.position.y = 4/2 // расчеты позиций цилиндров
    cylinderUnder.position.y = -(4/2 + 3) // отрицательный от верхнего
    this.meshesContainer.add( cylinderUpper )
    this.meshesContainer.add( cylinderUnder )
    this.meshesContainer.position.set(0,0,-15)
  }
  _createBird() {
    const geometry = new SphereGeometry( 1, 32, 16 )
    const material = new MeshBasicMaterial( { color: 0xffff00 } )
    const sphere = new Mesh( geometry, material )
    sphere.position.set(0,0,0)
    this.scene.add( sphere )
  }
  _runMesh() {
    let runSpeed = 0.04
    const meshDistanceZ = 15 // need random
    this.meshesContainer.translateZ(runSpeed)
    if(this.meshesContainer.position.z >= meshDistanceZ) {
      this.scene.remove(this.meshesContainer)
      this._createCylinder()
    }
  }
}
class Game {
  constructor(container) {
    this.container = container // container (parent of canvas)
    this.previousRAF = null //

    this.req = {} // request animation frame
    this.viewController = {} // Game render window
    
    this.renderer = {} // renderer 
    this.bindedSetScreenSize = this._setContainerSize.bind(this) // bind this for use context

    this.animate = (t) => {
      this.renderer.clear()
      this.controls.update()
      this.viewController._runMesh()
      this.renderer.render(this.scene, this.camera)
      this.previousRAF = t
      requestAnimationFrame(this.animate)
    }
  }
  async _init() {
    this.viewController = new ViewController(this.container) // создаем и настраиваем окно игры
    this.renderer = this.viewController.renderer // рендерер
    this.camera = this.viewController.camera
    this.scene = this.viewController.scene
    this.bindedSetScreenSize()
    
    // this.viewController._createPlane()
    this.viewController._createCylinder()
    this.viewController._createBird()

    this.controls = new OrbitControls( this.camera, this.renderer.domElement)

    window.addEventListener('resize', this.bindedSetScreenSize)

    this.req = requestAnimationFrame(this.animate)
    return true
  }
  _destroy() {
    cancelAnimationFrame(this.req)
    window.removeEventListener('resize', this.bindedSetScreenSize)
  }
  _setContainerSize() {
    // обновляю размеры рендерера
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    // аспект — Соотношение сторон усеченной пирамиды камеры.
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
    // обновляю проэкционную матрицу
    this.camera.updateProjectionMatrix()
  }
}
export default Game