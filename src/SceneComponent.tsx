import { useEffect } from 'react';

import '@babylonjs/loaders';
import { Inspector } from '@babylonjs/inspector';
import {
	AbstractMesh,
	ArcRotateCamera,
	Axis,
	BoundingInfo,
	Color3,
	Color4,
	Engine,
	HemisphericLight,
	LinesBuilder,
	LinesMesh,
	Matrix,
	Mesh,
	MeshBuilder,
	Nullable,
	Plane,
	// Plane,
	PositionGizmo,
	Quaternion,
	Ray,
	RayHelper,
	Scene,
	SceneLoader,
	Space,
	StandardMaterial,
	UtilityLayerRenderer,
	Vector3,
	VertexBuffer,
} from '@babylonjs/core';

var canvas: HTMLCanvasElement;
var engine: Engine;
var scene: Scene;
var camera: ArcRotateCamera;
var femurModel: AbstractMesh;
var tibiaModel: AbstractMesh;
var femurBoundingInfo: BoundingInfo;
var tibiaBoundingInfo: BoundingInfo;
var currentActiveRadioButton: string;
var utilLayer: UtilityLayerRenderer;
var positionGizmo: PositionGizmo;
var mechanicalAxis: LinesMesh;
var anatomicalAxis: LinesMesh;
var TEAxis: LinesMesh;
var projectedTEA: LinesMesh;
var PCAxis: LinesMesh;
var landmarkArray: Mesh[];
var mechanicalAxisPlane: Mesh;

//state
// interface IState {

// }

// props
// interface IProps {

// }

/****************************************
 * Functional React component representing a 3D scene using Babylon.js.
 ****************************************/
export default function SceneComponent() {
	const initialize = () => {
		console.clear();

		canvas = document.getElementById('canvas') as HTMLCanvasElement;
		console.log('Canvas created successfully');

		engine = new Engine(
			canvas,
			true,
			{
				doNotHandleContextLost: true,
			},
			true,
		);
		console.log('Engine initialized succesfully');

		// let axis = new AxesViewer(scene, 100);
		// console.log(axis);

		document.addEventListener('keydown', (event) => {
			keyDown(event);
		});

		document.addEventListener('keyup', (event) => {
			keyUp(event);
		});

		// Add event listener to the canvas
		document.addEventListener('click', (event) => {
			createSphereAtCursor(event);
		});

		window.addEventListener('resize', () => {
			engine.resize(true);
		});

		createScene();
		renderLoop();
	};

	useEffect(() => {
		initialize();
	}, []);

	return (
		<div className='mainDiv'>
			<canvas id='canvas' />
			{/* Menu */}
			<div className='leftDiv'>
				{/* Header */}
				<h1 id='mainlabel'>Knee Preop Planning</h1>

				{/* Femur Centre */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='femCentre_id'
						name='fav_language'
						className='femCentre'
						value='fem'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'femCentre';
						}}
					/>

					{/* Label */}
					<label>
						<b>Femur Centre</b>
					</label>
					<br></br>
				</div>

				{/* Hip Centre */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='hipCentre_id'
						name='fav_language'
						className='hipCentre'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'hipCentre';
						}}
					/>

					{/* Label */}
					<label>
						<b>Hip Centre</b>
					</label>
					<br></br>
				</div>

				{/* Femur Proximal Canal */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='femurProximalCanal_id'
						name='fav_language'
						className='femurProximalCanal'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'femurProximalCanal';
						}}
					/>

					{/* Label */}
					<label>
						<b>Femur Proximal Canal</b>
					</label>
					<br></br>
				</div>

				{/* Femur Distal Canal */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='femurDistalCanal_id'
						name='fav_language'
						className='femurDistalCanal'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'femurDistalCanal';
						}}
					/>

					{/* Label */}
					<label>
						<b>Femur Distal Canal</b>
					</label>
					<br></br>
				</div>

				{/* Medial Epicondyle */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='medialEpicondyle_id'
						name='fav_language'
						className='medialEpicondyle'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'medialEpicondyle';
						}}
					/>

					{/* Label */}
					<label>
						<b>Medial Epicondyle</b>
					</label>
					<br></br>
				</div>

				{/* Lateral Epicondyle */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='lateralEpicondyle_id'
						name='fav_language'
						className='lateralEpicondyle'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'lateralEpicondyle';
						}}
					/>

					{/* Label */}
					<label>
						<b>Lateral Epicondyle</b>
					</label>
					<br></br>
				</div>

				{/* Distal Medial Pt */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='distalMedialPt_id'
						name='fav_language'
						className='distalMedialPt'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'distalMedialPt';
						}}
					/>

					{/* Label */}
					<label>
						<b>Distal Medial Pt</b>
					</label>
					<br></br>
				</div>

				{/* Distal Lateral Pt */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='distalLateralPt_id'
						name='fav_language'
						className='distalLateralPt'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'distalLateralPt';
						}}
					/>

					{/* Label */}
					<label>
						<b>Distal Lateral Pt</b>
					</label>
					<br></br>
				</div>

				{/* Posterior Medial Pt */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='posteriorMedialPt_id'
						name='fav_language'
						className='posteriorMedialPt'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'posteriorMedialPt';
						}}
					/>

					{/* Label */}
					<label>
						<b>Posterior Medial Pt</b>
					</label>
					<br></br>
				</div>

				{/* Posterior Lateral Pt */}
				<div className='radioOpt'>
					<input
						type='radio'
						id='posteriorLateralPt_id'
						name='fav_language'
						className='posteriorLateralPt'
						value='hip'
						style={{
							height: '14px',
							width: '14px',
							cursor: 'pointer',
						}}
						onClick={() => {
							currentActiveRadioButton = 'posteriorLateralPt';
						}}
					/>

					{/* Label */}
					<label>
						<b>Posterior Lateral Pt</b>
					</label>
					<br></br>
				</div>

				{/* Button Containers */}
				<div className='btn_container'>
					{/* Update Button */}
					<button
						id='update_btn_id'
						className='update_btn btn'
						style={{ cursor: 'pointer' }}
						onClick={() => {
							handleUpdateBtn();
						}}
					>
						Update
					</button>
				</div>
			</div>
		</div>
	);
}

/****************************************
 * Handles the keydown event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keydown event.
 * @returns {void}
 ****************************************/
const keyDown = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			break;

		case 'G':
		case 'g':
			Inspector.Show(scene, { enablePopup: true });
			break;
	}
};

/****************************************
 * Handles the keyup event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keyup event.
 * @returns {void}
 ****************************************/
const keyUp = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			console.log('E key is Pressed!');
			break;
	}
};

/****************************************
 * Creates and initializes a 3D scene using the Babylon.js framework.
 * @returns {void}
 ****************************************/
const createScene = (): void => {
	scene = new Scene(engine);

	// Create utility layer the gizmo will be rendered on
	utilLayer = new UtilityLayerRenderer(scene);

	// Enable position gizmo
	positionGizmo = new PositionGizmo(utilLayer);

	loadModel().then(() => {
		// Get the min and max points of both bounding boxes
		var minPoint1 = femurBoundingInfo.boundingBox.minimumWorld;
		var maxPoint1 = femurBoundingInfo.boundingBox.maximumWorld;
		var minPoint2 = tibiaBoundingInfo.boundingBox.minimumWorld;
		var maxPoint2 = tibiaBoundingInfo.boundingBox.maximumWorld;

		// Calculate the min and max points of the combined bounding box
		var combinedMinPoint = Vector3.Minimize(minPoint1, minPoint2);
		var combinedMaxPoint = Vector3.Maximize(maxPoint1, maxPoint2);

		// Calculate the center of the combined bounding box
		var combinedCenter = combinedMinPoint.add(combinedMaxPoint).scale(0.5);

		if (camera) {
			camera.target = combinedCenter;
			camera.alpha = -Math.PI / 2;
			camera.beta = Math.PI / 2;
		}
	});

	setupCamera();

	setupLight();
};

/****************************************
 * Creates a sphere at the cursor's position in the 3D scene.
 * @param {MouseEvent} event - The MouseEvent object representing the mouse click event.
 * @returns {void}
 ****************************************/
const createSphereAtCursor = (event: MouseEvent): void => {
	// Calculate mouse position relative to the canvas
	const canvasRect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - canvasRect.left;
	const mouseY = event.clientY - canvasRect.top;

	// Convert screen coordinates to 3D scene coordinates
	const pickInfo = scene.pick(mouseX, mouseY);
	const worldCoordinates = pickInfo?.pickedPoint;

	if (currentActiveRadioButton) {
		// Check if a sphere with this name already exists
		const existingSphere = scene.getMeshByName(currentActiveRadioButton);
		if (existingSphere) {
			positionGizmo.attachedMesh = existingSphere;

			// Keep the gizmo fixed to world rotation
			positionGizmo.updateGizmoRotationToMatchAttachedMesh = false;
			positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;

			if (pickInfo.pickedMesh?.name == currentActiveRadioButton) {
				console.log(
					'sphere already existed',
					pickInfo.pickedMesh?.name,
				);
			}
		} else {
			positionGizmo.attachedMesh = null;

			if (worldCoordinates) {
				// Create sphere
				const sphere = MeshBuilder.CreateSphere(
					currentActiveRadioButton,
					{ diameter: 15 },
					scene,
				);

				// scene.whenReadyAsync().then(() => {
				// 	landmarkArray.push(sphere);
				// 	console.log(landmarkArray);
				// });

				positionGizmo.attachedMesh = sphere;

				// Position sphere at the picked point
				sphere.position.copyFrom(worldCoordinates);

				// Add material or color to the sphere
				const sphereMaterial = new StandardMaterial(
					'sphereMaterial',
					scene,
				);
				sphereMaterial.diffuseColor = new Color3(1, 0, 0); // Red color
				sphere.material = sphereMaterial;
			}
		}
	}
};

/****************************************
 * Sets up and configures the camera for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupCamera = (): void => {
	camera = new ArcRotateCamera(
		'Camera',
		-Math.PI / 2,
		Math.PI / 2,
		950,
		Vector3.Zero(),
		scene,
	);

	console.log('Camera created successfully!');

	camera.attachControl(canvas, true);
};

/****************************************
 * Sets up and configures lighting for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupLight = (): void => {
	var hemiLight = new HemisphericLight(
		'hemiLight',
		new Vector3(-1, 1, 0),
		scene,
	);

	hemiLight.intensity = 1.0;
};

/****************************************
 * Loads a 3D model into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadModel = async (): Promise<void> => {
	await loadFemur();

	await loadTibia();
};

/****************************************
 * Loads the Right Femur model into the scene.
 * @returns {Promise<void>} A promise that resolves when the model is loaded.
 ****************************************/
const loadFemur = (): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		SceneLoader.ImportMesh(
			'',
			'/assets/',
			'Right_Femur.stl',
			scene,
			(meshes, _particleSystems, _skeleton, _animationGroups) => {
				femurModel = meshes[0];
				femurBoundingInfo = femurModel.getBoundingInfo();
				console.log('Right Femur model loaded successfully!');
				resolve();
			},
			null,
			(_scene, message, exception) => {
				console.error(
					'Failed to load Right Femur model:',
					message,
					exception,
				);
				reject(message);
			},
		);
	});
};

/****************************************
 * Loads the Right Tibia model into the scene.
 * @returns {Promise<void>} A promise that resolves when the model is loaded.
 ****************************************/
const loadTibia = (): Promise<void> => {
	return new Promise<void>((resolve, reject) => {
		SceneLoader.ImportMesh(
			'',
			'/assets/',
			'Right_Tibia.stl',
			scene,
			(meshes, _particleSystems, _skeleton, _animationGroups) => {
				tibiaModel = meshes[0];
				tibiaBoundingInfo = tibiaModel.getBoundingInfo();
				console.log('Right Tibia model loaded successfully!');
				resolve();
			},
			null,
			(_scene, message, exception) => {
				console.error(
					'Failed to load Right Tibia model:',
					message,
					exception,
				);
				reject(message);
			},
		);
	});
};

/****************************************
 * Creates and loads primitive shapes into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const handleUpdateBtn = (): void => {
	positionGizmo.attachedMesh = null;

	// Mechanical Axis
	var femurCentrePos = scene.getMeshByName('femCentre')?.position;
	var hipCentrePos = scene.getMeshByName('hipCentre')?.position;

	if (femurCentrePos && hipCentrePos) {
		if (mechanicalAxis) {
			console.log('mechanicalAxis line found. Disposing now...');
			mechanicalAxis.dispose();
		}
		mechanicalAxis = MeshBuilder.CreateLines('mechanicalAxis', {
			points: [femurCentrePos, hipCentrePos],
		});
		mechanicalAxis.color = Color3.Red();
	}

	// Anatomical Axis
	var femurProximalCanalPos =
		scene.getMeshByName('femurProximalCanal')?.position;
	var femurDistalCanalPos = scene.getMeshByName('femurDistalCanal')?.position;

	if (femurProximalCanalPos && femurDistalCanalPos) {
		if (anatomicalAxis) {
			console.log('anatomicalAxis line found. Disposing now...');
			anatomicalAxis.dispose();
		}
		anatomicalAxis = MeshBuilder.CreateLines('anatomicalAxis', {
			points: [femurProximalCanalPos, femurDistalCanalPos],
		});
		anatomicalAxis.color = Color3.Green();
	}

	// TEA (Trans epicondyle Axis)
	var medialEpicondylePos = scene.getMeshByName('medialEpicondyle')?.position;
	var lateralEpicondylePos =
		scene.getMeshByName('lateralEpicondyle')?.position;

	if (medialEpicondylePos && lateralEpicondylePos) {
		if (TEAxis) {
			console.log('TEAxis line found. Disposing now...');
			TEAxis.dispose();
		}
		TEAxis = MeshBuilder.CreateLines('TEAxis', {
			points: [medialEpicondylePos, lateralEpicondylePos],
		});
		TEAxis.color = Color3.Blue();
	}

	// PCA (Posterior Condyle Axis)
	var posteriorMedialPtPos =
		scene.getMeshByName('posteriorMedialPt')?.position;
	var posteriorLateralPtPos =
		scene.getMeshByName('posteriorLateralPt')?.position;

	if (posteriorMedialPtPos && posteriorLateralPtPos) {
		if (PCAxis) {
			console.log('PCAxis line found. Disposing now...');
			PCAxis.dispose();
		}
		PCAxis = MeshBuilder.CreateLines('PCAxis', {
			points: [posteriorMedialPtPos, posteriorLateralPtPos],
		});
		PCAxis.color = Color3.Yellow();
	}

	// Create Mechanical axis plane
	if (femurCentrePos && hipCentrePos) {
		mechanicalAxisPlane = createPerpendicularPlane(
			'mechanicalAxis',
			femurCentrePos,
			hipCentrePos,
		);
	}

	//Create Projected TEA
	scene.whenReadyAsync().then(() => {
		var newPoint1: Nullable<Vector3> | undefined;
		var newPoint2: Nullable<Vector3> | undefined;
		//For point 1
		if (medialEpicondylePos) {
			var landmark = scene.getMeshByName('medialEpicondyle');
			if (landmark) {
				newPoint1 = createPointOnRotatedPlaneWithRaycast(
					scene,
					mechanicalAxisPlane,
					landmark,
				);
				console.log('Point 1 calculated');
			}
		}

		//For point 2
		if (lateralEpicondylePos) {
			var landmark = scene.getMeshByName('lateralEpicondyle');
			if (landmark) {
				newPoint2 = createPointOnRotatedPlaneWithRaycast(
					scene,
					mechanicalAxisPlane,
					landmark,
				);
				console.log('Point 2 calculated');
			}
		}

		//Draw Projected TEA
		if (newPoint1 && newPoint2) {
			if (projectedTEA) {
				console.log('projectedTEA line found. Disposing now...');
				projectedTEA.dispose();
			}
			projectedTEA = MeshBuilder.CreateLines('projectedTEA', {
				points: [newPoint1, newPoint2],
			});
			projectedTEA.color = Color3.Red();
			console.log('Drawing projectedTEA done successfully!');
		}
	});
};

// Function to create a point on the rotated plane along the Y-axis of an existing point using raycasting
const createPointOnRotatedPlaneWithRaycast = (
	scene: Scene,
	plane: Mesh,
	landmark: AbstractMesh,
) => {
	// Direction of the ray along the Y-axis
	let rayDirection = new Vector3(0, -1, 0);

	// Transform existing point to local coordinates of the plane
	let localPoint = landmark.position.subtract(plane.position);
	let rotationQuaternion = plane.rotationQuaternion || Quaternion.Identity();
	const matrix = Matrix.Zero();
	Vector3.TransformCoordinatesToRef(
		localPoint,
		rotationQuaternion.toRotationMatrix(matrix),
		localPoint,
	);

	// Create the ray
	const ray = new Ray(landmark.position, rayDirection);
	// var ray1Helper = new RayHelper(ray);
	// ray1Helper.show(scene, new Color3(1, 1, 0));

	// Perform the raycast
	const hits = scene.multiPickWithRay(ray);

	if (hits) {
		console.log('CHECK 1', hits);
		for (let i = 0; i < hits.length; i++) {
			if (hits[i].pickedMesh?.name === plane.name) {
				var hitPoint = hits[i].pickedPoint;
				return hitPoint;
			}
		}
	} else {
		console.log('Ray did not hit the plane: ');
		return null;
	}
};

/****************************************
 * Updates the scene's clipping plane based on the given mesh plane.
 * @param {Mesh} plane - The mesh representing the plane to be used for clipping.
 * @returns {void}
 ****************************************/
// const updateClipPlane = (plane: Mesh): void => {
// 	// Get the plane's normal vector (taking rotation into account)
// 	const normal = new Vector3(0, 1, 0);
// 	const transformedNormal = Vector3.TransformNormal(
// 		normal,
// 		plane.getWorldMatrix(),
// 	);

// 	// Calculate the plane's distance from the origin
// 	const distance = Vector3.Dot(transformedNormal, plane.position);

// 	// Create the mathematical plane
// 	const clipPlane = new Plane(
// 		transformedNormal.x,
// 		transformedNormal.y,
// 		transformedNormal.z,
// 		distance,
// 	);

// 	// Set the scene's clip plane
// 	scene.clipPlane4 = clipPlane;
// };

/****************************************
 * Creates a plane perpendicular to the line defined by two points.
 * @param {string} meshName - The name to be given to the created plane mesh.
 * @param {Vector3} point1 - The first point defining the line.
 * @param {Vector3} point2 - The second point defining the line.
 * @returns {Mesh} The created plane mesh.
 ****************************************/
const createPerpendicularPlane = (
	meshName: string,
	point1: Vector3,
	point2: Vector3,
): Mesh => {
	if (scene.getMeshByName(meshName + 'Plane')) {
		console.log('Existing mesh ' + meshName + ' found. Disposing now...');
		scene.getMeshByName(meshName + 'Plane')?.dispose();
	}

	// Calculate the direction vector from point1 to point2
	const lineDirection = point1.subtract(point2).normalize();

	// Find a vector perpendicular to the line direction
	let perpendicularVector = Vector3.Cross(
		lineDirection,
		new Vector3(1, 0, 0),
	);

	if (perpendicularVector.length() === 0) {
		// If the cross product is zero, it means the line is along the x-axis, so we use another axis
		perpendicularVector = Vector3.Cross(
			lineDirection,
			new Vector3(0, 1, 0),
		);
	}
	perpendicularVector.normalize();

	// Create the plane
	const plane = MeshBuilder.CreatePlane(
		meshName + 'Plane',
		{ size: 200 },
		scene,
	);

	// Position the plane at point1
	plane.position = point2;
	plane.flipFaces(true);
	plane.lookAt(point1);

	// Optionally, apply a material to the plane for visualization
	const planeMaterial = new StandardMaterial(meshName + 'Material', scene);
	planeMaterial.emissiveColor = new Color3(1, 1, 1); // Red color for visibility
	planeMaterial.backFaceCulling = false;
	planeMaterial.disableLighting = true;
	plane.material = planeMaterial;

	return plane;
};

/****************************************
 * Initiates the rendering loop for continuous updates and rendering of the Babylon.js scene.
 * @returns {void}
 ****************************************/
const renderLoop = () => {
	engine.runRenderLoop(() => {
		scene.render();
	});
};
