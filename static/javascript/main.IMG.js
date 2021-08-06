function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;
    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function createCyl(y){
    var cylinderG = new THREE.CylinderGeometry(400,400, 1, 680 , 1, true);
    var cylinderM = 
    //paredes
    new THREE.MeshBasicMaterial({
        side         : THREE.BackSide,
        vertexColors : THREE.FaceColors
    });
    console.log(cylinderG.faces.length);
    for(var x=0;x<cylinderG.faces.length;x++) {
        try{
            var line = image[y].slice().reverse();
            var pixel = line[x];
            var r = pixel[0]/255;
            var g = pixel[1]/255;
            var b = pixel[2]/255;
            var a = pixel[3]/255;
            cylinderG.faces[x].color.setRGB(r,g,b);
            cylinderG.faces[++x].color.setRGB(r,g,b);
        }catch(e) {
            cylinderG.faces[x].color.setHex(0x000000);
            try{
                cylinderG.faces[++x].color.setHex(0x000000);
            }catch(e){}
        }
    }
    return new THREE.Mesh(cylinderG,cylinderM);
}


function chunkArrayInGroups(arr, size) {
    var myArray = [];
    for(var i = 0; i < arr.length; i += size)
        myArray.push(arr.slice(i, i+size));
    return myArray;
}


function init() {
    var img=document.getElementById("img");
    var c=document.getElementById("myCanvas");
    var ctx=c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, 1360, 500).data;
    image = chunkArrayInGroups(imgData,4);
    image = chunkArrayInGroups(image,1360);
    
    console.log(image);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);

    var ambientLight = new THREE.AmbientLight("white");
    scene.add(ambientLight);                

    for(var i=0;i<500;i++) {
        var cyl = createCyl(i);
        cyl.position.set(0,500-i,0);
        scene.add(cyl);
    }
   

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0,100,0);
    scene.add(spotLight);

    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color("black"));
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.position.set(-400,500/2,0);
   
    var controls = new THREE.OrbitControls( camera );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.35;
    controls.enableKeys = true;
    controls.target.set(0,500/2,0);
    controls.enableZoom = false;
    controls.keyPanSpeed = 700;
    controls.update();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    // stop autorotate after the first interaction
    controls.addEventListener('start', function(){
        if(controls.autoRotate)
            controls.autoRotate = false;
    });

    var axes = new THREE.AxesHelper(100);
    scene.add(axes);

    document.getElementById("webgl-output").appendChild(renderer.domElement);

    function animate(){
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
    }

    animate();
}


window.onload = init;