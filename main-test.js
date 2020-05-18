let camera, scene;

function init() {
	scene = new THREE.Scene();
	var clock = new THREE.Clock();

	var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
	var plane = getPlane(planeMaterial, 100, 50);
	plane.name = 'plane-1';

	var light1 = getSpotLight(1000, 'rgb(255, 220, 180)');
	var light2 = getSpotLight(1000, 'rgb(255, 220, 180)');



	// manipulate objects
	plane.rotation.x = Math.PI/2;

	light1.position.x = -5;
	light1.position.y = 5;
	light1.position.z = -4;

	light2.position.x = 5;
	light2.position.y = 5;
	light2.position.z = -4;

	// load cube map
	var path = './IceRiver/';
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    var reflectionCube = new THREE.CubeTextureLoader().load(urls);
	reflectionCube.format = THREE.RGBFormat;

	scene.background = new THREE.Color( 0xaaccff );
	scene.fog = new THREE.FogExp2( 0xaaccff, 0.0085 );

	var loader = new THREE.TextureLoader();
	//planeMaterial.map = loader.load('./assets/textures/concrete.jpg');
	planeMaterial.bumpMap = loader.load('./assets/textures/concrete.jpg');
	planeMaterial.metalness = 1;
	// planeMaterial.roughness = 0;
	planeMaterial.envMap = reflectionCube;
	planeMaterial.transparent = true;
	planeMaterial.transparency = 0.1;

	var maps = ['bumpMap'];
	maps.forEach(function(mapName) {
		var texture = planeMaterial[mapName];
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(50, 50);
	});

	// add objects to the scene

	// scene.add(sphere);
	scene.add(plane);

	scene.add(light1);
	scene.add(light2);

	// camera
	camera = new THREE.PerspectiveCamera(
		45, // field of view
		window.innerWidth / window.innerHeight, // aspect ratio
		1, // near clipping plane
		5000 // far clipping plane
	);
	// camera.position.z = 7;
	// camera.position.x = -2;
	// camera.position.y = 7;
	camera.position.set( 0, 4, 0 );
	// camera.lookAt(new THREE.Vector3(0, 0, 0));

	window.addEventListener( 'wheel', onMouseWheel, false );
   	// window.addEventListener( 'resize', onWindowResize, false );

	// renderer
	var renderer = new THREE.WebGLRenderer({canvas : mississippi});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	// document.getElementById('webgl').appendChild(renderer.domElement);

	
	// var controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	update(renderer, scene, camera, clock);

	return scene;
}

function onMouseWheel( event ) {

	event.preventDefault();
	camera.position.z -= event.deltaY * 0.1;
  
  // prevent scrolling beyond a min/max value
  
  camera.position.clampScalar( -500, 100 );

}


function getMaterial(type, color) {
	var selectedMaterial;
	var materialOptions = {
		color: color === undefined ? 'rgb(255, 255, 255)' : color,
		transparent: true,
        transparency: 0.5,
	};

	switch (type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
		case 'lambert':
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
			break;
		case 'phong':
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
			break;
		case 'standard':
			selectedMaterial = new THREE.MeshPhysicalMaterial(materialOptions);
			break;
		default: 
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
	}

	return selectedMaterial;
}

function getSpotLight(intensity, color) {
	color = color === undefined ? 'rgb(255, 255, 255)' : color;
	var light = new THREE.SpotLight(color, intensity);
	light.castShadow = true;
	light.penumbra = 0.5;

	//Set up shadow properties for the light
	light.shadow.mapSize.width = 2048;  // default: 512
	light.shadow.mapSize.height = 2048; // default: 512
	light.shadow.bias = 0.001;

	return light;
}

function getPlane(material, size, segments) {
	var geometry = new THREE.PlaneGeometry(size, size * 10, segments, segments * 5);
	material.side = THREE.DoubleSide;
	var obj = new THREE.Mesh(geometry, material);
	obj.receiveShadow = true;
	obj.castShadow = true;

	return obj;
}

 window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

function update(renderer, scene, camera, clock) {
	// controls.update();

	var elapsedTime = clock.getElapsedTime();


	//var sphere = scene.getObjectByName('sphere-1');
	//var sphereGeo = sphere.geometry;
	//sphereGeo.position.y += Math.sin(elapsedTime);

	var plane = scene.getObjectByName('plane-1');
	var planeGeo = plane.geometry;
	planeGeo.vertices.forEach(function (vertex, index) {
		var z = elapsedTime + index;
		vertex.z += (noise.simplex2(z, z) + noise.simplex2(z+1, z))/2 * 0.2;
	});
	planeGeo.verticesNeedUpdate = true;

	renderer.render(scene, camera);
	requestAnimationFrame(function() {
		update(renderer, scene, camera, clock);
	});
}
init();
