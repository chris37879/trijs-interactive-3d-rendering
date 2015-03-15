var BitCity = {
    Util: {},
    wireframeMaterial: new THREE.MeshBasicMaterial({
        color: 0x222222,
        wireframe: false
    })
};

BitCity.City = function(options){
    var _options = BitCity.Util.mergeOptions({
        numBlocksX: 25,
        numBlocksY: 25
    }, options);

    //BitCity.CityPlanner
    var cityPlanner = new BitCity.CityPlanner({
        numBlocksX: _options.numBlocksX,
        numBlocksY: _options.numBlocksY
    });

    this.getMeshes = function(){
        var meshes = [];
        for(var block in cityPlanner.blocks){
            for(var building in cityPlanner.blocks[block].buildings){
                meshes.push(cityPlanner.blocks[block].buildings[building].getMesh());
            }
        }
        return meshes;
    };

}

BitCity.CityPlanner = function(options){
    var _options = BitCity.Util.mergeOptions({
        numBlocksX: 10,
        numBlocksY: 10
    }, options);


    var width = 1500;
    var depth = 1500;

    //Array<BitCity.CityBlock>
    this.blocks = [];
    for(var i = _options.numBlocksX; i > 0; i--){
        for(var j = _options.numBlocksY; j > 0; j--){
            this.blocks.push(new BitCity.CityBlock({
                width: width,
                depth: depth,
                x: (i === 0) ? (width * i) : (width + (width*0.1)) * i,
                y: (j === 0) ? (depth * j) : (depth + (depth*0.1)) * j
            }));
        }
    }
    this.blocks = BitCity.Util.shuffleArray(this.blocks);
}

BitCity.CityBlock = function(options){
    var _options = BitCity.Util.mergeOptions({
        width: 0,
        depth: 0,
        x: 0,
        y: 0
    }, options);

    //Array<BitCity.Building>
    this.buildings = [];
    //TODO: Fancy masonry logic for building layout, using 16 buildings for now.
    var heights = [];
    for(var i = 0; i < 16; i++){
        var skyscraper = (Math.random() > 0.9);
        if(skyscraper){
            heights.push(Math.floor(Math.random() * 1000) + 1500);
        }else{
            heights.push(Math.floor(Math.random() * 1000) + 100);
        }
    }
    var width = 300;
    var depth = 300;

    var counter = 0;
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
            this.buildings.push(new BitCity.Building({
                height: heights[counter],
                width: width,
                depth: depth,
                x: (i === 0) ? _options.x + (width * i) : _options.x + (width + 50) * i,
                y: (j === 0) ? _options.y + (depth * j) : _options.y + (depth + 50) * j,
            }));
            counter++;
        }
    }

    this.width = _options.width;
    this.depth = _options.depth;
    this.x = _options.x;
    this.y = _options.y;
}

BitCity.Building = function(options){
    var _options = BitCity.Util.mergeOptions({
        height: 0,
        width: 0,
        depth: 0,
        x: 0,
        y: 0
    }, options);

    this.height = _options.height;
    this.width = _options.width;
    this.depth = _options.depth;
    this.x = _options.x;
    this.y = _options.y;

    this.getMesh = function(){
        //TODO: Generate Building Geometry & Material to form a mesh.
        var geometry = new THREE.BoxGeometry(_options.width, _options.height, _options.depth);
        var material = new THREE.MeshBasicMaterial({ color: 0x666666 });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = this.x;
        mesh.position.y = (this.height / 2);
        mesh.position.z = this.y;
        return mesh;
    }
}

BitCity.Scene = function(container){
    var self = this;
    var container = container;

    //BitCity.City
    var city;

    //THREE.Scene
    var scene;
    //THREE.Camera
    var camera;
    //THREE.Renderer
    var renderer;
    //THREE.Controls
    var controls;

    this.upscaleFactor = 1;

    this.init = function(){
        //Make a new City
        city = new BitCity.City({
            numBlocksX: 50,
            numBlocksY: 50
        });

        //Make a new empty scene
        scene = new THREE.Scene();

        //Make a new perspective camera
        camera = new THREE.PerspectiveCamera(
            75,
            container.offsetWidth / container.offsetHeight,
            0.1,
            10000000
        );

        var meshes = city.getMeshes();
        var geometry = new THREE.Geometry();
        var materials = [];
        var materialIndexOffset = 0;
        for(var mesh in meshes){
            var thing = meshes[mesh];
            thing.matrixAutoUpdate && thing.updateMatrix();
            geometry.merge(thing.geometry, thing.matrix, materialIndexOffset);
        }

        var groundplane = new THREE.Mesh(new THREE.PlaneGeometry(1500000, 1500000), new THREE.MeshBasicMaterial({color: 0x222222, side: THREE.DoubleSide}));
        //TODO Figure out positioning for groundplane.
        groundplane.position.set(-1000, -1500, -1000);
        groundplane.rotation.x = 1.57079633;

        var mergedMesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({color: 0x666666}));

        scene.add(mergedMesh);
        //scene.add(groundplane);

        camera.position = geometry.center();
        controls = new THREE.OrbitControls(camera);
        controls.damping = 0.2;

        //Make a new Renderer
        renderer = new THREE.WebGLRenderer();
        //Configure the Renderer
        renderer.setSize(container.offsetWidth * self.upscaleFactor, container.offsetHeight * self.upscaleFactor);
        renderer.antialias = true;
        renderer.stencil = true;
        renderer.setClearColor(0xEEEEEE);
        //renderer.setClearColor(0x000000);
        renderer.shadowMapType = THREE.PCFSoftShadowMap;

        //Add the renderer's dom element to the contianer
        container.appendChild(renderer.domElement);
        camera.position.x = 50;
        camera.position.y = 50;
        camera.position.z = 50;
        console.log(camera);
    }

    this.render = function(){
        requestAnimationFrame(self.render);
        renderer.render(scene, camera);
        controls.update();
    }

    this.resize = function(){
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth * self.upscaleFactor, container.offsetHeight * self.upscaleFactor);
    }
}

BitCity.Util.mergeOptions = function(defaults, options){
    var _options = {};

    for (var attribute in defaults) {
        _options[attribute] = defaults[attribute];
    }

    for (var attribute in options) {
        _options[attribute] = options[attribute];
    }

    return _options;
}

BitCity.Util.shuffleArray = function(arr){
    var counter = 100;
    while (--counter){
        var i = arr.length, j, temp;
        if ( i == 0 ) return;
        while ( --i ) {
            j = Math.floor( Math.random() * ( i + 1 ) );
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    return arr;
}
