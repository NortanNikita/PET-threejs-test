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
  LoopOnce
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GridHelper } from 'three/src/helpers/GridHelper'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

class GameController {
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
class CameraController {
  constructor(params) {
    this.camera = new PerspectiveCamera(60, params.width / params.height, 0.1, 1000)
    this.camera.position.set(0, 5, -10)
    this.thirdPersonCamera = new ThirdPersonCamera({ camera: this.camera, target: params.target })
  }
}
class ThirdPersonCamera {
  constructor(params) {
    this.params = params
    this.camera = params.camera
    this.currentPosition = new Vector3()
    this.currentLookAt = new Vector3()
  }
  _calculateIdealOffset() {
    const idealOffset = new Vector3(0, 5, -12)
    idealOffset.applyQuaternion(this.params.target.quaternion)
    idealOffset.add(this.params.target.position)
    return idealOffset
  }
  _calculateIdealLookat() {
    const idealLookat = new Vector3(0, 5, 5)
    idealLookat.applyQuaternion(this.params.target.quaternion)
    idealLookat.add(this.params.target.position)
    return idealLookat
  }
  Update(timeElapsed) {
    const idealOffset = this._calculateIdealOffset()
    const idealLookat = this._calculateIdealLookat()

    this.currentPosition.copy(idealOffset)
    this.currentLookAt.copy(idealLookat)

    const t = 1.0 - Math.pow(0.001, timeElapsed)

    this.currentPosition.lerp(idealOffset, t)
    this.currentLookAt.lerp(idealLookat, t)

    this.camera.position.copy(this.currentPosition)
    this.camera.lookAt(this.currentLookAt)
  }
}
class SceneController {
  constructor(params) {
    this.scene = new Scene()
    this._sceneBackground()
  }
  _sceneBackground() {
    this.sceneTexture = new CubeTexture()
    const backgroundTexture = new TextureLoader().load( require('../sky.jpeg') );
    this.scene.background = backgroundTexture
  }
}
class LightController {
  constructor(params) {
    this.scene = params.scene
    this.ambientLight = {}
    this.frontLight = {}
    this.backLight = {}
    this._createAmbientLight()
    this._createFrontLight()
    this._createBackLight()
  }
  _createAmbientLight() {
    this.ambientLight = new AmbientLight(0xdbdbdb);
    this.scene.add(this.ambientLight);
  }
  _createFrontLight() {
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
  _createBackLight() {
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
      14,
      3
    );
  
    this.scene.add(this.backLight);
  }
}
class PlatformController {
  constructor(params) {
    this.scene = params.scene
    this.texture = new TextureLoader().load( require('../stones.jpeg') )
    this.geometry = new PlaneGeometry( 100, 100 );

    this.material = new MeshBasicMaterial({
      map: this.texture,
      side: DoubleSide,
    });
    this.plane = new Mesh( this.geometry, this.material );
    this.plane.position.x = 0
    this.plane.position.z = 0
    this.plane.rotation.x = Math.PI / 2
    this.scene.add(this.plane)
  }
}
class CharacterController {
  constructor(params) {
    this.character = {}
    this.animations = {}
    this.mixer = {}
    this.loadingManager = {}
    this.scene = params.scene
    this.loadingModels = false
    this.characterData = {
      health: 100,
      type: 'mutant',
      skill1: 10,
      skill2: 15,
    }
  }
  async _loadModels() {
    this.loadingModels = true
    return await new Promise((resolve, reject) => {
      const fbxLoader = new FBXLoader()
      fbxLoader.setPath('http://localhost:8080/three-pet/game/')
      fbxLoader.load('mutant.fbx',
        (object) => {
          this.character = object
          this.character.position.z = 0
          this.character.position.x = 0
          this.character.scale.set(.01, .01, .01)
          this.scene.add(this.character)
          this.mixer = new AnimationMixer(this.character)
          
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
          loader.setPath('http://localhost:8080/three-pet/game/') // some models source

          loader.load('mutant-idle.fbx', (a) => { onLoad('idle', a) })
          loader.load('mutant-run.fbx', (a) => { onLoad('run', a) })
          loader.load('mutant-run-left.fbx', (a) => { onLoad('runLeft', a) })
          loader.load('mutant-run-right.fbx', (a) => { onLoad('runRight', a) })
          loader.load('mutant-run-back.fbx', (a) => { onLoad('runBack', a) })
          loader.load('mutant-jumping.fbx', (a) => { onLoad('jumping', a) })
          loader.load('mutant-punch.fbx', (a) => { onLoad('punch', a) })
          loader.load('mutant-swiping.fbx', (a) => { 
            onLoad('swiping', a) 

            this.loadingModels = false
            resolve(this.character)
          })
          
        },
        (xhr) => {
          // if((xhr.loaded / xhr.total) * 100 === 100)
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.log(error)
          reject(error)
        }
      )
    })
  }
  _get() {
    return this.character
  }
  _getMixer() {
    return this.mixer
  }
  _getCharacterPosition() {
    return this.character.position
  }
  _getCharacterRotation() {
    return this.character.rotation
  }
}
class CharacterActionsController {
  constructor(params) {
    this.keyCodes = []
    this.character = params.character
    this.animations = params.animations
    this.mixer = params.mixer
    this.curCharacterState = ''
    this.prevCharacterState = ''

    this.jumpDirection = '+'
    this.hasJumpInState = false
  }
  _idleAnimation(prevAnimation) {
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
  _runAnimation(prevAnimation) {
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
  _runBackAnimation(prevAnimation) {
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
  _runLeftAnimation(prevAnimation) {
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
  _runRightAnimation(prevAnimation) {
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
  _jumpingAnimation(prevAnimation) {
    const jumpingAction = this.animations['jumping'].action
    // const finishedCallBack = () => { this._setCharacterState('idle') }
    // jumpingAction.getMixer().addEventListener('finished', finishedCallBack)
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
    this.hasJumpInState = true
  }
  _punchAnimation(prevAnimation) {
    const punchAction = this.animations['punch'].action
    const finishedCallBack = () => { this._setCharacterState('idle') }
    punchAction.getMixer().addEventListener('finished', finishedCallBack)
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
  _swipingAnimation(prevAnimation) {
    const swipingAction = this.animations['swiping'].action
    const finishedCallBack = () => { this._setCharacterState('idle') }
    swipingAction.getMixer().addEventListener('finished', finishedCallBack)
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
  _setCharacterState(state) {
    if(this.curCharacterState !== state) {
      this.prevCharacterState = this.curCharacterState
      this.curCharacterState = state
      this[`_${state}Animation`](this.prevCharacterState)
    } else {
      this[`_${state}Animation`]()
      this.curCharacterState = state
    }
  }
  _jump() {
    const maxHeight = 1.0
    const jumpSpeed = 0.065
    if(this.jumpDirection == '+') {
      this.character.position.y += jumpSpeed
      if(this.character.position.y >= maxHeight) {
        this.jumpDirection = '-'
      }
    } else {
      this.character.position.y -= jumpSpeed
      if(this.character.position.y <= 0) {
        this.character.position.y = 0
        let state = this.curCharacterState !== 'jumping' ? this.curCharacterState : (this.prevCharacterState || 'idle')
        this._setCharacterState(state)
        this.hasJumpInState = false
        this.jumpDirection = '+'
      }
    }
  }
  _actionStart(event) {
    let which = event.which
    if(!this.keyCodes.includes(which)) {
      this.keyCodes.push(which)
    }
  }
  _actionDraw() {
    const runSpeed = 0.04
    if (!this.keyCodes.length) return false
    let turn = 'idle'
    
    this.keyCodes.forEach(keyCode => {
      if (keyCode == 87) {
        this.character.translateZ(runSpeed)
        if (Math.abs(this.character.position.x) >= 50 || Math.abs(this.character.position.z) >= 50) {
          this.character.translateZ(-(runSpeed *2))
          console.log('конец зоны')
        }
        turn = 'run'
      } else if (keyCode == 83) {
        this.character.translateZ(-runSpeed)
        if (Math.abs(this.character.position.x) >= 50 || Math.abs(this.character.position.z) >= 50) {
          this.character.translateZ((runSpeed * 2))
          console.log('конец зоны')
        }
        turn = 'runBack'
      } else if (keyCode == 68) {
        // this.character.position.x -=runSpeed
        this.character.rotateY(-0.05)
        // turn = 'runRight'
      } else if (keyCode == 65) {
        // this.character.position.x +=runSpeed
        this.character.rotateY(0.05)
        // turn = 'runLeft'
      } else if (keyCode == 32) {
        turn = 'jumping'
      } else if (keyCode == 49) {
        turn = 'punch'
      } else if (keyCode == 50) {
        turn = 'swiping'
      }
    })
    this._setCharacterState(turn)
  }
  _updateMixer(timeElapsed) {
    this._actionDraw()
    if(this.hasJumpInState) this._jump()
    this.mixer.update(0.025)
  }
  _actionEnd(event) {
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
      this._setCharacterState('idle')
    }
  }
}
class MonsterController { 
  constructor(params) {
    this.monster = {}
    this.scene = params.scene
    this.monsterData = {
      health: 25,
      lvl: 1,
      type: 'monster'
    }
  }
  _createMonster() {
    let geometry = new BoxGeometry( 1, 1, 1 )
    let material = new MeshBasicMaterial( {color: 0xffff00} )
    this.monster = new Mesh( geometry, material )
    this.monster.position.set(10,1,10)
    this.scene.add(this.monster)
  }
  _hit(damage) {
    this.height -= damage
    if(this.height <= 0) this._dead()
  }
  _dead() {
    this.scene.remove(this.monster)
  }
}
class Game {
  constructor(container) {
    this.container = container // container (parent of canvas)
    this.frame = 0 // frame
    this.req = {} // request animation frame

    this.gameController = {} // Game render window
    this.cameraController = {} //
    this.sceneController = {} //
    this.characterController = {} //
    this.lightController = {} //
    this.characterActionsController = {} //
    this.previousRAF = null //
    this.renderer = {} // renderer 
    this.scene = {} // scene
    this.camera = {} // camera
    this.plane = {} // платформа
    this.character = {} // персонаж


    this.bindedCharacterActionStart = null
    this.bindedCharacterActionEnd = null
    this.bindedSetScreenSize = this._setContainerSize.bind(this) // bind this for use context
    this.animate = (t) => {
      if (this.previousRAF == null) {
        this.previousRAF = t;
      }
      this.frame += 1
      this.renderer.clear()
      this.characterActionsController._updateMixer()
      this.thirdPersonCamera.Update((t - this.previousRAF) * 0.001)
      this.renderer.render(this.scene, this.camera) // timeElapsed
      this.previousRAF = t
      requestAnimationFrame(this.animate)
    }
  }
  async _init() {
    this.gameController = new GameController(this.container) // создаем и настраиваем окно игры
    this.renderer = this.gameController.renderer // рендерер
    
    this.sceneController = new SceneController() // создаем сцену
    this.scene = this.sceneController.scene // сцена
    
    this.lightController = new LightController({scene: this.scene})

    this.characterController = new CharacterController({scene: this.scene}) // создаем персонажа
    await this.characterController._loadModels()

    this.character = this.characterController._get() // получаем обьект персонажа

    this.cameraController = new CameraController({ width: this.gameController.width, height: this.gameController.height, target: this.character }) // создаем камеру
    this.camera = this.cameraController.camera // камера
    this.thirdPersonCamera = this.cameraController.thirdPersonCamera // камера от 3го лица

    this.plane = new PlatformController({scene: this.scene}).plane // платформа на которой стоит персонаж

    this.characterActionsController = new CharacterActionsController({ character: this.character, animations: this.characterController.animations, mixer: this.characterController._getMixer() })
    
    this.monsterController = new MonsterController({scene: this.scene})
    this.monsterController._createMonster()

    this.bindedCharacterActionStart = this.characterActionsController._actionStart.bind(this.characterActionsController)
    this.bindedCharacterActionEnd = this.characterActionsController._actionEnd.bind(this.characterActionsController)

    this.characterActionsController._setCharacterState('idle')
    

    this.bindedSetScreenSize()
    
    window.addEventListener('resize', this.bindedSetScreenSize)
    window.addEventListener('keydown', this.bindedCharacterActionStart)
    window.addEventListener('keyup', this.bindedCharacterActionEnd)

    this.req = requestAnimationFrame(this.animate)
    return true
  }
  _setContainerSize() {
    // обновляю размеры рендерера
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    // аспект — Соотношение сторон усеченной пирамиды камеры.
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
    // обновляю проэкционную матрицу
    this.camera.updateProjectionMatrix()
  }
  _destroy() {
    cancelAnimationFrame(this.req)
    window.removeEventListener('resize', this.bindedSetScreenSize)
    this.req = {}
    this.frame = 0
    this.gameController = {}
    this.renderer = {}
    this.scene = {}
    this.camera = {}

    this.bindedCharacterActionStart = null
    this.bindedCharacterActionEnd = null
  }
}

export default Game