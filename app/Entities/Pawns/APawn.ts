import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { BaseEntity } from '../Physiscs/BaseEntity';
import MathClass from '../Math/MathClass';

export default class APawn extends BaseEntity {
  private NamePlayer: string;
  private PlayerVelocity: number;

  constructor(scene: THREE.Scene, World: RAPIER.World, NamePlayer: string, PlayerVelocity: number) {
    super(scene, World);
    this.NamePlayer = NamePlayer;
    this.PlayerVelocity = PlayerVelocity;
  }

  public getPlayerVelocity() {
    return this.PlayerVelocity;
  }

  public update(deltaTime: number): void {
    // Método genérico para ser sobrescrito por subclasses, se necessário
  }

  public Move(direction: RAPIER.Vector3, deltaTime: number): void {
    const normalized = MathClass.normalize(direction);

    const displacement = {
      x: normalized.x * this.PlayerVelocity * deltaTime,
      y: normalized.y * this.PlayerVelocity * deltaTime,
      z: normalized.z * this.PlayerVelocity * deltaTime,
    };

    const currentPos = this.rigidBody.translation();

    const nextPosition = {
      x: currentPos.x + displacement.x,
      y: currentPos.y + displacement.y,
      z: currentPos.z + displacement.z,
    };

    this.rigidBody.setNextKinematicTranslation(nextPosition);
  }
}
