import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createJensenMesh } from "./three-models";

export function exportJensenToGLB(filename: string = "Jensen_Huang_Chibi.glb") {
  const jensen = createJensenMesh();
  const scene = new THREE.Scene();
  scene.add(jensen.group);

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const blob = new Blob([gltf as ArrayBuffer], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    (error) => {
      console.error("Error exporting GLB model:", error);
    },
    { binary: true }
  );
}

