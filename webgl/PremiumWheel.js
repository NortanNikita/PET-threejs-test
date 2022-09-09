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
  BufferGeometry,
  IcosahedronGeometry,
  SphereGeometry,
  ShapeGeometry,
  PlaneGeometry,
  ConeGeometry,
  MeshPhysicalMaterial,
  Face3,
  MeshPhongMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DoubleSide,
  Mesh,
  Color,
  Clock,
  SpotLight,
  Vector3,
  Group,
  Euler,
  Object3D,
  CubeTexture,
  LoopOnce,
  CanvasTexture,
  RepeatWrapping,
  Vector2,
  LinearFilter
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture'
import { GridHelper } from 'three/src/helpers/GridHelper'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
class Area {
  constructor(container) {
    this.container = container
    this.frame = 0
    this.pixelRatio = window.devicePixelRatio
    this.AA = this.pixelRatio <= 1
    this.width = 0
    this.height = 0

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
  }
}
class WheelScene {
  constructor() {
    this.scene = null
    this.createScene()
  }
  createScene() {
    this.scene = new Scene();

    const axesHelper = new AxesHelper( 5 );
    this.scene.add( axesHelper );
    const size = 100;
    const divisions = 100;
    const gridHelper = new GridHelper( size, divisions );
    this.scene.add( gridHelper );
    const texture = new TextureLoader().load( require('../sky.jpeg') );
    this.scene.background = texture
  }
}
class WheelCamera {
  constructor(params) {
    this.camera = null
    this.createCamera(params)
  }
  createCamera(params) {
    this.camera = new PerspectiveCamera(
      70,
      params.width / params.height,
      0.1,
      1000
    );
    this.camera.position.set( 0, 6, 0 );
    
  }
}
class WheelLight {
  constructor(scene) {
    this.scene = scene
    this.ambientLight = null
    this.frontLight = null
    this.backLight = null
    // this.ambientLightCreate()
    this.frontLightCreate()
    this.backLightCreate()
  }
  ambientLightCreate() {
    this.ambientLight = new AmbientLight(0xdbdbdb);
    this.scene.add(this.ambientLight);
  }
  frontLightCreate() {
    this.frontLight = new SpotLight(
      new Color(0xbe7c7c),
      13.6,
      26.9,
    )
    this.frontLight.castShadow = true;
    this.frontLight.shadow.mapSize.width = 1024; // default
    this.frontLight.shadow.mapSize.height = 1024; // default
    this.frontLight.shadow.camera.near = 0.5; // default
    this.frontLight.shadow.camera.far = 500;
    this.frontLight.shadow.normalBias = 0.2;
  
  
    this.frontLight.position.set(
      10,
      14,
      14  
    );
    this.scene.add(this.frontLight);
  }
  backLightCreate() {
    this.backLight = new SpotLight(
      new Color(0xc9f0f0),
      13,
      23
    );
    this.backLight.castShadow = true;
    this.backLight.shadow.mapSize.width = 1024; // default
    this.backLight.shadow.mapSize.height = 1024; // default
    this.backLight.shadow.camera.near = 0.5; // default
    this.backLight.shadow.camera.far = 500;
    this.backLight.shadow.normalBias = 0.2;
    this.backLight.penumbra = 0;
  
    this.backLight.position.set(
      -19,
      -5.3,
      3
    );
  
    this.scene.add(this.backLight);
  }
}
class InterierMesh {
  constructor(scene) {
    this.scene = scene
    this.loadingModels = false
    this.diamond = null
    // this.createDiamond()
  }
  createDiamond() {
    const x = 0, y = 0;

    const heartShape = new Shape();

    heartShape.moveTo( x + 5, y + 5 );
    heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
    heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

    const geometry = new ShapeGeometry( heartShape );
    const material = new MeshBasicMaterial( { color: 0x00ff00 } );
    const mesh = new Mesh( geometry, material ) ;
    mesh.position.set(1, 1, 1)
    this.scene.add( mesh );
  }
  // async _loadModels() {
  //   this.loadingModels = true
  //   return await new Promise((resolve, reject) => {
  //     const fbxLoader = new FBXLoader()
  //     fbxLoader.setPath('http://localhost:8080/three-pet/game/')
  //     fbxLoader.load('cell.fbx',
  //       (object) => {
  //         this.diamond = object
  //         this.diamond.position.z = 0
  //         this.diamond.position.x = 0
  //         this.diamond.scale.set(.01, .01, .01)
  //         this.scene.add(this.diamond)
  //         // this.mixer = new AnimationMixer(this.character)
          
  //         // this.loadingManager = new LoadingManager()

  //         // const onLoad = (animationName, obj) => {
  //         //   const clip = obj.animations.find(item => item.name === 'mixamo.com')
  //         //   const action = this.mixer.clipAction(clip)
            
  //         //   this.animations[animationName] = {
  //         //     clip: clip,
  //         //     action: action,
  //         //   }
  //         // }
  //         // const loader = new FBXLoader(this.loadingManager)
  //         // loader.setPath('http://localhost:8080/three-pet/game/')

  //         // loader.load('mutant-idle.fbx', (a) => { onLoad('idle', a) })
  //         // loader.load('mutant-run.fbx', (a) => { onLoad('run', a) })
  //         // loader.load('mutant-run-left.fbx', (a) => { onLoad('runLeft', a) })
  //         // loader.load('mutant-run-right.fbx', (a) => { onLoad('runRight', a) })
  //         // loader.load('mutant-run-back.fbx', (a) => { onLoad('runBack', a) })
  //         // loader.load('mutant-jumping.fbx', (a) => { onLoad('jumping', a) })
  //         // loader.load('mutant-punch.fbx', (a) => { onLoad('punch', a) })
  //         // loader.load('mutant-swiping.fbx', (a) => { 
  //         //   onLoad('swiping', a) 

  //           this.loadingModels = false
  //           resolve(this.diamond)
  //         // })
          
  //       },
  //       (xhr) => {
  //         // if((xhr.loaded / xhr.total) * 100 === 100)
  //         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  //       },
  //       (error) => {
  //         console.log(error)
  //         reject(error)
  //       }
  //     )
  //   })
  // }
}
class WheelCell {
  constructor(scene) {
    // контенер чтоб крутить круг целиком
    const meshesContainer = new Group();
    scene.add(meshesContainer);
    
    // Стрелка

    const material = new MeshPhongMaterial({ color: 0xff4447 });
    const cone = new Mesh(new ConeGeometry( 0.3, 0.7, 32 ), material)
    scene.add(cone);
    cone.position.set(0, 3.5, 0)
    cone.rotation.set(3.15, 0, 0)

    // Шар 
    const texture2 =  new CanvasTexture(new FlakesTexture())//new TextureLoader().load( require('../stones.jpeg') );
    texture2.wrapS = RepeatWrapping;
    texture2.wrapT = RepeatWrapping;
    texture2.repeat.x = 0.10;
    texture2.repeat.y = 0.06;

    const ballMaterial = {
      clearcoat: 1.0,
      cleacoatRoughness: 0.5,
      metalness: 0.9,
      roughness: 0.5,
      color: 0x8747ff,
      normalMap: texture2,
      normalScale: new Vector2(0.15, 0.15)
    }
    const material2 = new MeshPhysicalMaterial(ballMaterial);
    const sphere = new Mesh(new SphereGeometry(1.5, 64, 64), material2);
    scene.add(sphere);


    // Плитки рулетки
    const texture3 = new TextureLoader().load( require('../deagle.png') );
    texture3.minFilter = LinearFilter
    texture3.wrapS = RepeatWrapping;
    texture3.wrapT = RepeatWrapping;
    texture3.repeat.x = 1;
    texture3.repeat.y = 1;
    console.log(texture3)
    const material3 = new MeshPhongMaterial({ map: texture3, transparent: false, opacity: 1 });
    
    // Рарити плитки
    const material4 = new MeshPhongMaterial({ color: 0xff0000 });



    const cellCount = 16 // Колво штук
    const angleCoef = 360 / cellCount // Угол каждого конуса
    const radius = 2.5
    const rarityRadius = 1.8
    for (let i=0; i < cellCount; i++) {
      const cube = new Mesh(new BoxGeometry(1, 1, 0.001), material3);
      const rarity = new Mesh(new BoxGeometry(0.6, 0.2, 0.001), material4)
      let angle = (angleCoef * i) * Math.PI / 180 // перевод в радианы
      const posX = radius * Math.sin(angle)
      const posY = radius * Math.cos(angle)
      const posXrarity = rarityRadius * Math.sin(angle)
      const posYrarity = rarityRadius * Math.cos(angle)
      cube.position.set(posX, posY, 0)
      cube.rotation.set(0, 0, -angle)
      rarity.position.set(posXrarity, posYrarity, 0)
      rarity.rotation.set(0, 0, -angle)
      meshesContainer.add(cube);
      meshesContainer.add(rarity);
    }
    // setInterval(() => {
    //   meshesContainer.rotateZ(0.01)
    //   sphere.rotateZ(-0.01)
    // },1)
  }
}
class WheelWork {
  constructor(container) {
    this.container = container // container (parent of canvas)
    this.frame = 0 // frame
    this.req = {} // request animation frame
    this.previousRAF = null //
    this.renderer = {} // renderer 
    this.scene = {} // scene
    this.camera = {} // camera

    this.bindedSetScreenSize = this.setContainerSize.bind(this) // bind this for use context
    
    this.animate = (t) => {
      if (this.previousRAF == null) {
        this.previousRAF = t;
      }
      this.frame += 1
      this.renderer.clear()
      this.renderer.render(this.scene, this.camera) 
      this.previousRAF = t
      requestAnimationFrame(this.animate)
    }
  }
  async init() {
    const area = new Area(this.container)
    this.renderer = area.renderer // рендерер
    const wheelScene = new WheelScene() // создаем сцену
    this.scene = wheelScene.scene // сцена
    const wheelCamera = new WheelCamera({ width: this.container.width, height: this.container.height })
    this.camera = wheelCamera.camera
    const light = new WheelLight(this.scene)
    this.cell = new WheelCell(this.scene)
    this.interierMesh = new InterierMesh(this.scene)
    // await this.interierMesh._loadModels()
    // this.diamond = this.interierMesh.diamond
    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    
    this.bindedSetScreenSize()
    window.addEventListener('resize', this.bindedSetScreenSize)

    this.req = requestAnimationFrame(this.animate)
    return true
  }
  setContainerSize() {
    // обновляю размеры рендерера
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    // аспект — Соотношение сторон усеченной пирамиды камеры.
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
    // обновляю проэкционную матрицу
    this.camera.updateProjectionMatrix()
  }
  destroy() {
    cancelAnimationFrame(this.req)
    window.removeEventListener('resize', this.bindedSetScreenSize)
    this.req = {}
    this.frame = 0
    this.renderer = {}
    this.scene = {}
    this.camera = {}
  }
}
export default WheelWork