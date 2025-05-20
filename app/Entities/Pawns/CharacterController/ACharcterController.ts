import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import APawn from '../APawn';
import MathClass from '../../Math/MathClass';

export default class ACharacterController extends APawn {
  private keys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
  };

  private direction: RAPIER.Vector3 = new RAPIER.Vector3(0, 0, 0);
  private deltaTime: number = 0;

  constructor(scene: THREE.Scene, world: RAPIER.World, name: string, velocity: number) {
    super(scene, world, name, velocity);
    this.setupKeyboardControls();
  }

  private setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in this.keys) this.keys[key] = false;
    });
  }

  // Este método deve ser chamado no loop de animação
  public update(deltaTime: number) {
    this.deltaTime = deltaTime;
    this.updateDirection();
    this.Move(this.direction, this.deltaTime);
  }

  private updateDirection() {
    this.direction = new RAPIER.Vector3(0, 0, 0);

    if (this.keys.w) this.direction.z -= 1;
    if (this.keys.s) this.direction.z += 1;
    if (this.keys.a) this.direction.x -= 1;
    if (this.keys.d) this.direction.x += 1;

    this.direction = MathClass.normalize(this.direction);
  }

  public override Move(direction: RAPIER.Vector3, deltaTime: number) {
  const speed = this.getPlayerVelocity();

  const displacement = {
    x: direction.x * speed * deltaTime,
    y: 0,
    z: direction.z * speed * deltaTime,
  };

  const currentPos = this.rigidBody.translation();
  const newPos = {
    x: currentPos.x + displacement.x,
    y: currentPos.y,
    z: currentPos.z + displacement.z,
  };

  this.rigidBody.setNextKinematicTranslation(newPos);
}

}
