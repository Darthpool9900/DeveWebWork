import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { BaseEntity } from './BaseEntity';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export default class BaseMesh extends BaseEntity {
  constructor(scene: THREE.Scene, world: RAPIER.World) {
    super(scene, world);
  }

  static async loadObj(
    scene: THREE.Scene,
    world: RAPIER.World,
    path: string
  ): Promise<BaseMesh> {
    const ent = new BaseMesh(scene, world);
    const ext = path.split('.').pop()?.toLowerCase();

    let loadedObj: THREE.Object3D | null = null;

    switch (ext) {
      case 'fbx': {
        const objFbx = await new FBXLoader().loadAsync(path);
        loadedObj = objFbx;
        break;
      }

      case 'glb': {
        const objGlb = await new GLTFLoader().loadAsync(path);
        loadedObj = objGlb.scene;
        break;
      }

      default:
        console.warn(`Formato de arquivo não suportado: ${ext}`);
        return ent;
    }

    // Define a MeshObj visível
    ent.MeshObj = loadedObj;
    scene.add(ent.MeshObj);

    // Cria corpo físico dinâmico
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
      ent.MeshObj.position.x,
      ent.MeshObj.position.y,
      ent.MeshObj.position.z
    );
    ent.rigidBody = world.createRigidBody(bodyDesc);

    // Usa colisor cúbico com base no bounding box
   ent.addTrimeshColliderFromMesh(loadedObj as THREE.Mesh);


    return ent;
  }
}
