import { Camera } from './Camera.js';
import { Canvas } from './Canvas.js';
import * as rec from './Recognition.js';
import { updateFPS } from "./fpsModule.js"; 
import { GameManager } from './GameObjects.js';

const camera = new Camera();
const canvas = new Canvas();
const gameManager = new GameManager(canvas);

// Load Networks
rec.loadPoseNet(poseDetection.SupportedModels.MoveNet, {
  modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
});

rec.loadHandNet(handPoseDetection.SupportedModels.MediaPipeHands, {
  runtime: 'tfjs',
  modelType: 'full',
  maxHands: 4,
  detectorModelUrl: undefined,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})

// Event Listeners
camera.getVideo().addEventListener('loadeddata', function() {
    runInference(canvas, camera);
}, false);

const buttonStart = document.getElementById('b-start-webcam');
buttonStart.addEventListener('click', function() { 
  camera.start(canvas);
}, false);

const buttonStop = document.getElementById('b-stop-webcam');
buttonStop.addEventListener('click', function() { 
  camera.stop();
}, false);

async function runInference(canvas, camera) {
  const image = camera.getVideo();

  const poses = await rec.estimatePoses(image);
  const hands = await rec.estimateHands(image, {
    flipHorizontal: false,
    staticImageMode: false,
    maxNumHands: 4,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  canvas.drawCameraFrame(camera);
  
  // Actualizar y dibujar objetos del juego
  gameManager.update(Date.now(), poses);
  gameManager.draw();
  
  // Dibujar poses y manos
  canvas.drawResultsPoses(poses);
  canvas.drawResultsHands(hands);

  updateFPS();

  requestAnimationFrame(() => runInference(canvas, camera));
}