import RAPIER from "@dimforge/rapier3d-compat";

export default class MathClass{
     static  normalize(v: RAPIER.Vector3): RAPIER.Vector3 {
            const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
            return {
                x: v.x / length,
                y: v.y / length,
                z: v.z / length,
            };
    }
}