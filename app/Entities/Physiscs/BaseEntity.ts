import * as THREE from "three";
import * as RAPIER from '@dimforge/rapier3d-compat';

/**
 * Classe‑base para qualquer entidade que possua representação 3D e física Rapier.
 * – `MeshObj`   → THREE.Object3D (mesh, group ou sprite)
 * – `rigidBody` → RAPIER.RigidBody correspondente
 *
 * Métodos utilitários ajudam a criar colisores automaticamente.
 */
export abstract class BaseEntity {
  /** Objeto visual inserido na cena (pode ser Mesh, Group ou Sprite) */
  MeshObj!: THREE.Object3D;
  /** Corpo rígido usado pelo Rapier */
  rigidBody!: RAPIER.RigidBody;

  constructor(
    protected scene: THREE.Scene,
    protected world: RAPIER.World
  ) {}

  /**
   * Deve ser chamado a cada frame para manter malha e física sincronizadas.
   */
  update() {
    if (!this.rigidBody || !this.MeshObj) return;
    const p = this.rigidBody.translation();
    const q = this.rigidBody.rotation();
    this.MeshObj.position.set(p.x, p.y, p.z);
    this.MeshObj.quaternion.set(q.x, q.y, q.z, q.w);
  }

  /**
   * Cria um colisor cúbico a partir do bounding‑box do objeto.
   * Útil para colisão rápida e eficiente.
   */
  protected addBoxColliderFromBounds() {
    if (!this.MeshObj) return;
    const bbox = new THREE.Box3().setFromObject(this.MeshObj);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const desc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
    this.world.createCollider(desc, this.rigidBody);
  }

  /**
   * Gera um colisor trimesh com o formato EXATO da malha.
   * ⚠️ Use apenas para objetos *estáticos* (desempenho).
   *
   * @param mesh Mesh cuja geometria será usada para gerar o trimesh
   */
  protected addTrimeshColliderFromMesh(mesh: THREE.Mesh) {
    const geometry = mesh.geometry;

    // Precisamos garantir que existe índice (IndexedBufferGeometry)
    if (!geometry.index) {
      console.warn("Trimesh collider needs indexed geometry. Converting …");
      geometry.setIndex([...Array(geometry.attributes.position.count).keys()]);
    }

    const vertices = geometry.attributes.position.array as Float32Array;
    const indices = geometry.index!.array as Uint32Array;

    const colliderDesc = RAPIER.ColliderDesc.trimesh(
  vertices,
  indices
);

    this.world.createCollider(colliderDesc, this.rigidBody);
  }
}
