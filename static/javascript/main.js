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
    for (var i = 0; i < 6; i++)
        color += letters[Math.floor(Math.random() * 16)];
    return color;
}


function createCyl(image,y){
    var cylinderG = new THREE.CylinderGeometry(400,400, 1, 680 , 1, true);
    var cylinderM = 
    //paredes
    new THREE.MeshBasicMaterial({
        side         : THREE.BackSide,
        vertexColors : THREE.FaceColors
    });
    for(var x=0;x<cylinderG.faces.length;x++) {
        var line = image[y].slice().reverse();
        var pixel = line[x];
        var r = pixel[0];
        var g = pixel[1];
        var b = pixel[2];
        var a = pixel[3];
        cylinderG.faces[x].color.setRGB(r,g,b);
        cylinderG.faces[++x].color.setRGB(r,g,b);
    }
    return new THREE.Mesh(cylinderG,cylinderM);
}


function chunkArrayInGroups(arr, size) {
    var myArray = [];
    for(var i = 0; i < arr.length; i += size)
        myArray.push(arr.slice(i, i+size));
    return myArray;
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback({error:false,response:xmlHttp.responseText});
        else
            callback({error:true});
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

let draw_line = (x1, y1, x2, y2) => {
    let pixels = new Array();
    let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
    dx = x2 - x1;
    dy = y2 - y1;
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;
    if (dy1 <= dx1) {
        if (dx >= 0) {
            x = x1; y = y1; xe = x2;
        } else {
            x = x2; y = y2; xe = x1;
        }
        pixels.push({x,y});
        for (i = 0; x < xe; i++) {
            x = x + 1;
            if (px < 0) px = px + 2 * dy1;
            else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0))
                    y = y + 1;
                else
                    y = y - 1;
                px = px + 2 * (dy1 - dx1);
            }
            pixels.push({x,y});
        }
    } else {
        if (dy >= 0) {
            x = x1; y = y1; ye = y2;
        } else {
            x = x2; y = y2; ye = y1;
        }
        pixels.push({x,y});
        for (i = 0; y < ye; i++) {
            y = y + 1;
            if (py <= 0)
                py = py + 2 * dx1;
            else {
                if ((dx < 0 && dy<0) || (dx > 0 && dy > 0))
                    x = x + 1;
                else
                    x = x - 1;
                py = py + 2 * (dx1 - dy1);
            }
            pixels.push({x,y});
        }
    }
    return pixels;
 }


function requestImage(){
    httpGetAsync("http://127.0.0.1/image",(data)=>{
        if(data.error == true) {
            return
        }
        init(JSON.parse(data.response));
    });
}

function calculateFromMouse(coordinate) {
}

function init(image) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,2000);

    var ambientLight = new THREE.AmbientLight("white");
    scene.add(ambientLight);                

    var cylinders = new THREE.Group();
    for(var i=0;i<500;i++) {
        var cyl = createCyl(image,i);
        cyl.position.set(0,500-i,0);
        cylinders.add(cyl);
    }
    scene.add(cylinders);
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0,100,0);
    scene.add(spotLight);

    var renderer = new THREE.WebGLRenderer({
        powerPreference:"high-performance"
    });
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

    var raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse0 = {"clientX":0,"clientY":0};
    mouse1 = {"clientX":0,"clientY":0};

    leftButtonDown = false;
    window.addEventListener( 'mousedown', function ( e ) {
        // Left mouse button was pressed, set flag
        if(e.which === 1) leftButtonDown = true;
    });
    window.addEventListener( 'mouseup', function ( e ) {
        // Left mouse button was released, clear flag
        if(e.which === 1) leftButtonDown = false;
    });
    function tweakMouseMoveEvent(e){
        // If left button is not set, set which to 0
        // This indicates no buttons pressed
        if(e.which === 1 && !leftButtonDown) e.which = 0;
    }
    window.addEventListener( 'mousemove', function ( event ) {
        if(!controls.enabled) {
            tweakMouseMoveEvent(event);
            mouse0.clientX = mouse1.clientX;
            mouse0.clientY = mouse1.clientY;
            mouse1.clientX = event.clientX;
            mouse1.clientY = event.clientY;
        }
    }, false );














    console.log(scene.children);
    function animate() {
        if(!controls.enabled && leftButtonDown) {
            draw_line(mouse0.clientX,mouse0.clientY,mouse1.clientX,mouse1.clientY).forEach((coordinates)=>{
                mouse.x = ( coordinates.x / window.innerWidth ) * 2 - 1;
                mouse.y = - ( coordinates.y / window.innerHeight ) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                var intersects = raycaster.intersectObjects( cylinders.children );
                intersects[0].object.geometry.colorsNeedUpdate = true;
                intersects[0].face.color.setRGB(1,1,1);
                if(intersects[0].faceIndex % 2 == 0)
                    intersects[0].object.geometry.faces[intersects[0].faceIndex+1].color.setRGB(1,1,1);
                else
                    intersects[0].object.geometry.faces[intersects[0].faceIndex-1].color.setRGB(1,1,1);
            });
        }
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene,camera);
        if(!rendered)
            {
                document.getElementById("loading").style.display = "none";
                document.getElementById("controls").style.display = "block";
                rendered = true;
                document.getElementById("draw").addEventListener("click",(event)=>{
                    controls.enabled = false;
                });
                document.getElementById("explore").addEventListener("click",(event)=>{
                    controls.enabled = true;
                });
            }
    }

    animate();
}
rendered = false;
requestImage();