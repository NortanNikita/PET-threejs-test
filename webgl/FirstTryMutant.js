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

export default class Game {
  constructor(container) {
    this.container = container
    this.frame = 0
    this.pixelRatio = window.devicePixelRatio
    this.AA = this.pixelRatio <= 1;
    this.width = 0
    this.height = 0
    this.renderer = new WebGLRenderer({
      antialias: true,//this.AA,
      alpha: true
    })
    this.keyCodes = []
    this.animations = {}
    this.curCharacterState = ''
    this.prevCharacterState = ''

    // third camera options
    this.coronaSafetyDistance = 0.3
    this.velocity = 0.0
    this.speed = 0.0
    this.temp = new Vector3
    this.dir = new Vector3
    this.a = new Vector3
    this.b = new Vector3
    this.goal = {}
    this.follow = {}

    // renderer settings
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.toneMappingExposure = 0.6;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.powerPreference = "high-performance";
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.createCamera()

    this.setContainerSize(this.container) 
    this.rotationCameraX = this.rotationCamera.bind(this)
    // container settings
    this.container.style.overflow = "hidden";
    this.container.style.margin = 0;
    this.container.appendChild(this.renderer.domElement);
    // create scene 
    this.createScene()

    // this.controls = new OrbitControls( this.camera, this.renderer.domElement )

    const animate = () => {
      // this.controls.update()
      // renderer settings
      this.renderer.clear()
      this.frame += 1
      if (this.curCharacterState) this.updateMixer()
      
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }
  // Функция для слежения за изменениями контейнера
  setContainerSize() {
    // обновляю переиспользуемые глобальные значения
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    // обновляю размеры рендерера
    this.renderer.setSize(this.width, this.height)

    // аспект — Соотношение сторон усеченной пирамиды камеры.
    this.camera.aspect = this.width / this.height;

    // обновляю проэкционную матрицу
    this.camera.updateProjectionMatrix();

  }
  createCamera() {
    this.camera = new PerspectiveCamera(
      70,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set( 0, 6, 0 );
    
  }
  addCameraListener() {
    document.addEventListener('mousemove',this.rotationCameraX);
  }
  removeCameraListener() {
    document.removeEventListener('mousemove',this.rotationCameraX);
  }
  rotationCamera(event) {
    const fullTurn = Math.PI * 2 // 360 deg
    const sensetivity = 0.0174533 * 2 // 1 deg (0,0174533 in radian)
    if(this.currentRotationX > event.x) {
      //turn left + 1 deg (0,0174533 in radian)
      this.character.rotateY(sensetivity);
    } else {
      //turn right - 1 deg (0,0174533 in radian)
      this.character.rotateY(-sensetivity);
    }
    if(this.character.rotation.y >= fullTurn) {
      this.character.rotateY(0);
    }
    this.currentRotationX = event.x
  }
  createScene() {
    this.scene = new Scene();
    // const axesHelper = new AxesHelper( 5 );
    // this.scene.add( axesHelper );
    // const size = 100;
    // const divisions = 100;
    // const gridHelper = new GridHelper( size, divisions );
    // this.scene.add( gridHelper );
    this.sceneBackground()
    this.ambientLightCreate()
    this.frontLightCreate()
    this.backLightCreate()
    this.createMesh()
    this.createPlane()
  }
  sceneBackground() {
    this.sceneTexture = new CubeTexture()
    const backgroundTexture = new TextureLoader().load( require('../sky.jpeg') );
    this.scene.background = backgroundTexture
  }
  ambientLightCreate() {
    const ambientLight = new AmbientLight(0xdbdbdb);
    this.scene.add(ambientLight);
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
  createPlane() {
    const texture = new TextureLoader().load( require('../sand.jpeg') )
    const geometry = new PlaneGeometry( 100, 100 );
    const material = new MeshBasicMaterial( {map: texture, side: DoubleSide} );
    const plane = new Mesh( geometry, material );
    plane.position.x = 0
    plane.position.z = 0
    plane.rotation.x = Math.PI / 2
    this.scene.add( plane );
  }
  createMesh() {
    // this.meshesContainer = new Group(); // Контейнер для множества Мешей
    // this.scene.add(this.meshesContainer); // добавляем контейнер в сцену
    this.createCharacter()
  }
  createCharacter() {
    const fbxLoader = new FBXLoader()
    fbxLoader.setPath('http://localhost:8080/three-pet/game/')
    fbxLoader.load('mutant.fbx',
      (object) => {
        this.character = object
        this.character.position.z = 0
        this.character.position.x = 0
        this.character.scale.set(.01, .01, .01)

        this.goal = new Object3D
        this.follow = new Object3D
        this.follow.position.z = -this.coronaSafetyDistance
        this.character.add(this.follow)
        this.goal.add(this.camera)
        this.scene.add(this.character)

        this.mixer = new AnimationMixer( this.character )
        
        this.loadingManager = new LoadingManager()

        const onLoad = (animationName, obj) => {
          const clip = obj.animations.find(item => item.name === 'mixamo.com')
          const action = this.mixer.clipAction(clip)
          
          this.animations[animationName] = {
            clip: clip,
            action: action,
          }
        }
        const loader = new FBXLoader(this.loadingManager)
        loader.setPath('http://localhost:8080/three-pet/game/')

        loader.load('mutant-idle.fbx', (a) => { onLoad('idle', a) })
        loader.load('mutant-run.fbx', (a) => { onLoad('run', a) })
        loader.load('mutant-run-left.fbx', (a) => { onLoad('runLeft', a) })
        loader.load('mutant-run-right.fbx', (a) => { onLoad('runRight', a) })
        loader.load('mutant-run-back.fbx', (a) => { onLoad('runBack', a) })
        loader.load('mutant-jumping.fbx', (a) => { onLoad('jumping', a) })
        loader.load('mutant-punch.fbx', (a) => { onLoad('punch', a) })
        loader.load('mutant-swiping.fbx', (a) => { onLoad('swiping', a) })
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.log(error)
      }
    ) 
  }
  idleAnimation(prevAnimation) {
    const idleAction = this.animations['idle'].action
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      idleAction.time = 0.0
      idleAction.enabled = true
      idleAction.setEffectiveTimeScale(1.0)
      idleAction.setEffectiveWeight(1.0)
      idleAction.crossFadeFrom(prevAction, 0.5, true)
      idleAction.play()
    } else {
      idleAction.play()
    }
  }
  runAnimation(prevAnimation) {
    const runAction = this.animations['run'].action
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      runAction.time = 0.0
      runAction.enabled = true
      runAction.setEffectiveTimeScale(1.0)
      runAction.setEffectiveWeight(1.0)
      runAction.crossFadeFrom(prevAction, 0.5, true)
      runAction.play()
    } else {
      runAction.play()
    }
  }
  runBackAnimation(prevAnimation) {
    const runAction = this.animations['runBack'].action
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      runAction.time = 0.0
      runAction.enabled = true
      runAction.setEffectiveTimeScale(1.0)
      runAction.setEffectiveWeight(1.0)
      runAction.crossFadeFrom(prevAction, 0.5, true)
      runAction.play()
    } else {
      runAction.play()
    }
  }
  runLeftAnimation(prevAnimation) {
    const runAction = this.animations['runLeft'].action
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      runAction.time = 0.0
      runAction.enabled = true
      runAction.setEffectiveTimeScale(1.0)
      runAction.setEffectiveWeight(1.0)
      runAction.crossFadeFrom(prevAction, 0.5, true)
      runAction.play()
    } else {
      runAction.play()
    }
  }
  runRightAnimation(prevAnimation) {
    const runAction = this.animations['runRight'].action
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      runAction.time = 0.0
      runAction.enabled = true
      runAction.setEffectiveTimeScale(1.0)
      runAction.setEffectiveWeight(1.0)
      runAction.crossFadeFrom(prevAction, 0.5, true)
      runAction.play()
    } else {
      runAction.play()
    }
  }
  jumpingAnimation(prevAnimation) {
    const jumpingAction = this.animations['jumping'].action
    jumpingAction.getMixer().addEventListener('finished', () => { this.setCharacterState('idle') })
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      jumpingAction.reset()
      jumpingAction.setEffectiveTimeScale(1.0)
      jumpingAction.setEffectiveWeight(1.0)
      jumpingAction.setLoop(LoopOnce, 1)
      jumpingAction.clampWhenFinished = true
      jumpingAction.crossFadeFrom(prevAction, 0.5, true)
      jumpingAction.play()
    } else {
      jumpingAction.play()
    }
  }
  punchAnimation(prevAnimation) {
    const punchAction = this.animations['punch'].action
    punchAction.getMixer().addEventListener('finished', () => { this.setCharacterState('idle') })
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      punchAction.reset()
      punchAction.setEffectiveTimeScale(1.0)
      punchAction.setEffectiveWeight(1.0)
      punchAction.setLoop(LoopOnce, 1)
      punchAction.clampWhenFinished = true
      punchAction.crossFadeFrom(prevAction, 0.5, true)
      punchAction.play()
    } else {
      punchAction.play()
    }
  }
  swipingAnimation(prevAnimation) {
    const swipingAction = this.animations['swiping'].action
    swipingAction.getMixer().addEventListener('finished', () => { this.setCharacterState('idle') })
    if(prevAnimation) {
      const prevAction = this.animations[prevAnimation].action
      swipingAction.reset()
      swipingAction.setEffectiveTimeScale(1.0)
      swipingAction.setEffectiveWeight(1.0)
      swipingAction.setLoop(LoopOnce, 1)
      swipingAction.clampWhenFinished = true
      swipingAction.crossFadeFrom(prevAction, 0.5, true)
      swipingAction.play()
    } else {
      swipingAction.play()
    }
  }
  setCharacterState(state) {
    if(this.curCharacterState !== state) {
      this.prevCharacterState = this.curCharacterState
      this.curCharacterState = state
      this[`${state}Animation`](this.prevCharacterState)
    } else {
      this[`${state}Animation`]()
      this.curCharacterState = state
    }
  }
  actionStart(event) {
    var which = event.which
    if(!this.keyCodes.includes(which)) {
      this.keyCodes.push(which)
    }
  }
  actionDraw() {
    let speed = 0.04
    let turn = 'idle'
    if (!this.keyCodes.length) return false
    this.keyCodes.forEach(keyCode => {
      if (keyCode == 87) {
        speed = 0.04
        turn = 'run'
      } else if (keyCode == 83) {
        speed = -0.04
        turn = 'runBack'
      } else if (keyCode == 68) {
        speed = 0.04
        this.character.rotateY(0.05)
      } else if (keyCode == 65) {
        speed = 0.04
        this.character.rotateY(-0.05)
      } else if (keyCode == 32) {
        speed = 0.0
        turn = 'jumping'
      } else if (keyCode == 49) {
        speed = 0.0
        turn = 'punch'
      } else if (keyCode == 50) {
        speed = 0.0
        turn = 'swiping'
      } else {
        speed = 0
      }
    })


    this.velocity += ( speed - this.velocity ) * .3;
    this.character.translateZ( this.velocity );

    this.a.lerp(this.character.position, 0.4);
    this.b.copy(this.goal.position);
    
    this.dir.copy( this.a ).sub( this.b ).normalize();
    const dis = this.a.distanceTo( this.b ) - this.coronaSafetyDistance;
    this.goal.position.addScaledVector( this.dir, dis );
    this.goal.position.lerp(this.temp, 0.02);
    this.temp.setFromMatrixPosition(this.follow.matrixWorld);
    this.camera.lookAt(this.character.position);
    this.setCharacterState(turn)
    // const runSpeed = 0.04
    // if (!this.keyCodes.length) return false
    // let turn = 'idle'
    // this.keyCodes.forEach(keyCode => {
    //   if (keyCode == 87) {
    //     this.character.position.z +=runSpeed
    //     // this.camera.position.z +=runSpeed
    //     turn = 'run'
    //   } else if (keyCode == 83) {
    //     this.character.position.z -=runSpeed
    //     turn = 'runBack'
    //     // this.camera.position.z -=runSpeed
    //   } else if (keyCode == 68) {
    //     this.character.position.x -=runSpeed
    //     // this.camera.position.x -=runSpeed
    //     turn = 'runRight'
    //   } else if (keyCode == 65) {
    //     this.character.position.x +=runSpeed
    //     // this.camera.position.x +=runSpeed
    //     turn = 'runLeft'
    //   } else if (keyCode == 32) {
    //     turn = 'jumping'
    //   } else if (keyCode == 49) {
    //     turn = 'punch'
    //   } else if (keyCode == 50) {
    //     turn = 'swiping'
    //   }
    // })
    // this.setCharacterState(turn)
  }
  updateMixer() {
    this.actionDraw()
    this.mixer.update(0.025)
  }
  actionEnd(event) {
    let index = this.keyCodes.indexOf(event.which)
    if(index != -1) {
      this.keyCodes.splice(index, 1)
    }
    if (
      !this.keyCodes.length 
      && this.curCharacterState !== 'jumping'
      && this.curCharacterState !== 'punch'
      && this.curCharacterState !== 'swiping'
    ) {
      this.setCharacterState('idle')
    }
  }
}

