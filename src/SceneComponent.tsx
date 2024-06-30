import { useEffect, useState } from 'react';

import '@babylonjs/loaders';
import { Inspector } from '@babylonjs/inspector';
import {
	AbstractMesh,
	ArcRotateCamera,
	Axis,
	BoundingInfo,
	Color3,
	Engine,
	HemisphericLight,
	LinesMesh,
	Matrix,
	Mesh,
	MeshBuilder,
	Plane,
	PositionGizmo,
	Quaternion,
	Ray,
	RayHelper,
	Scene,
	SceneLoader,
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
var anteriorLine: LinesMesh;
var mechanicalAxisPlane: Mesh;
var varusAxisPlane: Mesh;
var varusPlaneRotationValue: number = 0;
var varusPivotPoint: Vector3;

/****************************************
 * Functional React component representing a 3D scene using Babylon.js.
 ****************************************/
export default function SceneComponent() {
	const [, setVarusPlaneRotationValue] = useState(varusPlaneRotationValue);
	const [isOn, setIsOn] = useState(false);

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

	/**
	 * Handles the increment and decrement of the varus axis plane rotation.
	 * @param number Indicates whether to increment (1) or decrement (0) the rotation.
	 * @returns {void}
	 */
	const handleVarusIncDec = (number: number): void => {
		// Set the rotation increment value
		const rotationIncrement = 1;

		if (varusAxisPlane) {
			if (varusAxisPlane.rotationQuaternion) {
				// Increment or decrement rotation value based on the button clicked
				let rotationQuaternion;
				if (number === 0) {
					// Decrement (rotate anti-clockwise)
					rotationQuaternion = Quaternion.RotationAxis(
						Axis.X,
						-(rotationIncrement / 100),
					);
				} else if (number === 1) {
					// Increment (rotate clockwise)
					rotationQuaternion = Quaternion.RotationAxis(
						Axis.X,
						rotationIncrement / 100,
					);
				}

				varusPlaneRotationValue = rotationIncrement;

				if (rotationQuaternion) {
					// Apply the rotation
					varusAxisPlane.rotationQuaternion =
						rotationQuaternion.multiply(
							varusAxisPlane.rotationQuaternion,
						);
				}
			} else {
				// If no rotation quaternion is used, update the z-axis rotation directly
				if (number === 0) {
					// Decrement (rotate anti-clockwise)
					varusAxisPlane.rotation.x -= rotationIncrement / 100;
					varusPlaneRotationValue -= rotationIncrement;
				} else if (number === 1) {
					// Increment (rotate clockwise)
					varusAxisPlane.rotation.x += rotationIncrement / 100;
					varusPlaneRotationValue += rotationIncrement;
				}
			}
			setVarusPlaneRotationValue(
				Math.round(varusPlaneRotationValue * 100),
			);
		}
	};

	const toggleButton = () => {
		setIsOn(!isOn);
		updateClipPlane(!isOn, mechanicalAxisPlane);
	};

	return (
		<div className='mainDiv'>
			<canvas id='canvas' />
			{/* Left Div */}
			<div className='leftDiv'>
				{/* Header */}
				<h1 id='mainlabel'>Knee Preop Planning</h1>

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

			{/* Right Div */}
			<div className='rightDiv'>
				{/* Header */}
				<h1 id='customLabel'>Varus / Valgus</h1>
				{/* Decrement Varus */}
				<button
					className='btn'
					style={{ cursor: 'pointer' }}
					onClick={() => {
						handleVarusIncDec(0);
					}}
				>
					-
				</button>
				<span className='custSpan'>{varusPlaneRotationValue}</span>
				{/* Increment Varus */}
				<button
					className='btn'
					style={{ cursor: 'pointer' }}
					onClick={() => {
						handleVarusIncDec(1);
					}}
				>
					+
				</button>
				<div className='toggleDiv'>
					<h1 className='labelResection'>Resection</h1>
					<button
						className='toggleBtn'
						onClick={toggleButton}
						style={{ backgroundColor: isOn ? 'green' : 'red' }}
					>
						{isOn ? 'ON' : 'OFF'}
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
			camera.alpha = Math.PI / 2;
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
					{ diameter: 10 },
					scene,
				);

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
		Math.PI / 2,
		Math.PI / 2,
		950,
		Vector3.Zero(),
		scene,
	);

	camera.wheelPrecision = 0.5;

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
				// Ensure there is a material to modify
				if (!femurModel.material) {
					// Create a new standard material with original color and no backface culling
					const material = new StandardMaterial(
						'customMaterial',
						scene,
					);
					material.backFaceCulling = false;
					femurModel.material = material;
				} else {
					// If material exists, ensure backface culling is disabled
					femurModel.material.backFaceCulling = false;
				}
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
				// Ensure there is a material to modify
				if (!tibiaModel.material) {
					// Create a new standard material with original color and no backface culling
					const material = new StandardMaterial(
						'customMaterial',
						scene,
					);
					material.backFaceCulling = false;
					tibiaModel.material = material;
				} else {
					// If material exists, ensure backface culling is disabled
					tibiaModel.material.backFaceCulling = false;
				}

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
	// positionGizmo.attachedMesh = null;
	// positionGizmo.dispose();

	// Mechanical Axis
	var hipCentrePos = scene.getMeshByName('hipCentre')?.position;
	var femurCentrePos = scene.getMeshByName('femCentre')?.position;

	if (hipCentrePos && femurCentrePos) {
		if (mechanicalAxis) {
			console.log('mechanicalAxis line found. Disposing now...');
			mechanicalAxis.dispose();
		}
		mechanicalAxis = MeshBuilder.CreateLines('mechanicalAxis', {
			points: [hipCentrePos, femurCentrePos],
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
	if (hipCentrePos && femurCentrePos) {
		if (mechanicalAxisPlane) {
			mechanicalAxisPlane.dispose();
		}
		mechanicalAxisPlane = createPerpendicularPlane(
			'mechanicalAxis',
			hipCentrePos,
			femurCentrePos,
		);
	}

	// Create Projected TEA
	scene.whenReadyAsync().then(() => {
		let medialEpicondylePromise = Promise.resolve(new Vector3(0, 0, 0));
		let lateralEpicondylePromise = Promise.resolve(new Vector3(0, 0, 0));

		// For point 1
		if (medialEpicondylePos) {
			const landmark = scene.getMeshByName('medialEpicondyle');
			if (landmark) {
				medialEpicondylePromise = createPointOnRotatedPlane(
					scene,
					mechanicalAxisPlane,
					landmark,
				);
			}
		}

		// For point 2
		if (lateralEpicondylePos) {
			const landmark = scene.getMeshByName('lateralEpicondyle');
			if (landmark) {
				lateralEpicondylePromise = createPointOnRotatedPlane(
					scene,
					mechanicalAxisPlane,
					landmark,
				);
			}
		}

		Promise.all([medialEpicondylePromise, lateralEpicondylePromise])
			.then(([newPoint1, newPoint2]) => {
				console.log('Point 1 calculated', newPoint1);
				console.log('Point 2 calculated', newPoint2);

				if (newPoint1 && newPoint2) {
					// Draw Projected TEA
					if (projectedTEA) {
						console.log(
							'projectedTEA line found. Disposing now...',
						);
						projectedTEA.dispose();
					}
					projectedTEA = MeshBuilder.CreateLines('projectedTEA', {
						points: [newPoint1, newPoint2],
					});
					projectedTEA.color = Color3.Red();
					console.log('Drawing projectedTEA done successfully!');

					// Draw Anterior Line
					if (femurCentrePos) {
						console.log('RVG 1');

						const anteriorPoint =
							createPerpendicularPointWithOffset(
								femurCentrePos,
								newPoint1,
								newPoint2,
								20,
							);
						if (anteriorPoint) {
							console.log('RVG 2');

							if (anteriorLine) {
								console.log('RVG 3');
								console.log(
									'anteriorLine line found. Disposing now...',
								);
								anteriorLine.dispose();
							}
							anteriorLine = MeshBuilder.CreateLines(
								'anteriorLine',
								{
									points: [femurCentrePos, anteriorPoint],
								},
							);
							anteriorLine.color = Color3.Blue();

							//Varus Plane rotation
							//Duplicate the plane
							varusAxisPlane =
								mechanicalAxisPlane.clone('varusAxisPlane');
							//Add rotation
							var angle = 0.1;
							rotatePlaneAroundLinePivot(
								varusAxisPlane,
								anteriorLine,
								angle,
							);
						}
					}
				}
			})
			.catch((error) => {
				console.error('Error calculating points:', error);
			});
	});
};

/**
 * Rotates a plane mesh around a line mesh pivot.
 * @param plane The mesh representing the plane to rotate.
 * @param line The lines mesh providing the pivot direction.
 * @param angleInDegrees The angle in degrees by which to rotate the plane.
 * https://playground.babylonjs.com/#1JLGFP#927
 * @returns {void}
 */
const rotatePlaneAroundLinePivot = (
	plane: Mesh,
	line: LinesMesh,
	angleInDegrees: number,
): void => {
	const positions = line.getVerticesData(VertexBuffer.PositionKind);
	if (!positions || positions.length < 6) {
		console.error(
			'Line must have at least two points to determine direction.',
		);
		return;
	}

	const startPoint = new Vector3(positions[0], positions[1], positions[2]);
	const endPoint = new Vector3(positions[3], positions[4], positions[5]);

	varusPivotPoint = endPoint;

	// var pivot = new TransformNode('root');
	// plane.parent = pivot;

	// plane.rotateAround(endPoint, Axis.Z, angleInDegrees);
};

/**
 * Creates a point on a rotated plane using raycasting.
 * @param scene The BabylonJS scene object.
 * @param plane The mesh representing the plane.
 * @param landmark The mesh representing the landmark point.
 * @returns A Promise that resolves with a Vector3 representing the hit point on the plane.
 */
const createPointOnRotatedPlane = (
	scene: Scene,
	plane: Mesh,
	landmark: AbstractMesh,
): Promise<Vector3> => {
	return new Promise((resolve, reject) => {
		try {
			// Direction of the ray along the Y-axis
			const rayDirection = new Vector3(0, -1, 0);

			// Transform existing point to local coordinates of the plane
			let localPoint = landmark.position.subtract(plane.position);
			const rotationQuaternion =
				plane.rotationQuaternion || Quaternion.Identity();
			const matrix = Matrix.Zero();
			Vector3.TransformCoordinatesToRef(
				localPoint,
				rotationQuaternion.toRotationMatrix(matrix),
				localPoint,
			);

			// Create the ray
			const ray = new Ray(landmark.position, rayDirection);

			// Create the ray helper for visualization
			const rayHelper = new RayHelper(ray);
			rayHelper.show(scene, new Color3(1, 1, 0));

			// Perform the raycast
			const hits = scene.multiPickWithRay(ray);

			if (hits) {
				for (let i = 0; i < hits.length; i++) {
					if (hits[i].pickedMesh?.name === plane.name) {
						console.log('RVG : hit to plane');

						const hitPoint = hits[i].pickedPoint;
						if (hitPoint) {
							rayHelper.dispose(); // Dispose of the ray helper
							resolve(hitPoint); // Resolve with the hit point
							return;
						}
					}
				}
			}

			console.log('Ray did not hit the plane: ');
			rayHelper.dispose(); // Dispose of the ray helper even if no hit
			resolve(new Vector3(0, 0, 0)); // Resolve with a default Vector3
		} catch (error) {
			reject(error); // Reject the promise in case of an error
		}
	});
};

/**
 * Creates a new point such that the line from the existing point to the new point is perpendicular to the existing line.
 * @param existingPoint The existing point (Vector3).
 * @param linePoint1 The first point defining the existing line (Vector3).
 * @param linePoint2 The second point defining the existing line (Vector3).
 * @returns The new point (Vector3).
 */
function createPerpendicularPointWithOffset(
	existingPoint: Vector3,
	linePoint1: Vector3,
	linePoint2: Vector3,
	offset: number,
): Vector3 {
	// Calculate the direction vector of the existing line
	const lineDir = linePoint2.subtract(linePoint1).normalize();

	// Calculate a vector from the existing point to the first point of the line
	const toLinePoint = linePoint1.subtract(existingPoint);

	// Project the toLinePoint vector onto the line direction vector
	const projectionLength = Vector3.Dot(toLinePoint, lineDir);
	const projection = lineDir.scale(projectionLength);

	// Calculate the perpendicular vector by subtracting the projection from the toLinePoint vector
	const perpendicular = toLinePoint.subtract(projection).normalize();

	// Scale the perpendicular vector to the desired offset length
	const offsetVector = perpendicular.scale(offset);

	// The new point is the existing point plus the offset vector
	const newPoint = existingPoint.add(offsetVector);

	return newPoint;
}

/****************************************
 * Updates the scene's clipping plane based on the given mesh plane.
 * @param {Mesh} plane - The mesh representing the plane to be used for clipping.
 * @returns {void}
 ****************************************/
const updateClipPlane = (isOn: boolean, plane: Mesh): void => {
	if (isOn) {
		// Get the transformation matrix of the plane
		var transformMatrix = plane.getWorldMatrix();

		// Extract the normal vector (third column of the rotation matrix)
		var normal = new Vector3(
			transformMatrix.m[8],
			transformMatrix.m[9],
			transformMatrix.m[10],
		).normalize();

		var nomalizedNormals: [number, number, number] = [
			normal._x,
			normal._y,
			normal._z,
		];

		//Distance from Origin
		var distance = plane.position.length();

		//Clipping plane to make mesh invisible
		var clipPlane = new Plane(
			nomalizedNormals[0],
			-nomalizedNormals[1],
			nomalizedNormals[2],
			distance,
		);

		// Attach to scene
		scene.clipPlane = clipPlane;
	} else {
		// Dettach to scene
		scene.clipPlane = null;
	}
};

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
