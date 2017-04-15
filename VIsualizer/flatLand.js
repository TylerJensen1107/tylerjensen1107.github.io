//Variables that effect the visual
var xRotate = .01;
var zRotate = .01;
var yRotate = .01;
//How much shift there is after the circle starts to repeat from the center
var DIFF_CONSTANT = .05;
//Shift of each line on each tick
var DIFF = Math.random() * 3.14;
var TIGHTNESS = Math.random();
var DELETE = false;
var counterMax = 1000 * DIFF;
var SYNCMUSIC = false;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

addListeners();

var song = document.getElementById("music");
var bufferLength;

song.addEventListener("canplay", function() {
    var source = audioCtx.createMediaElementSource(song);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    //This changes a few things, hard to describe. A higher count makes the sphere smaller and "smoother"
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
});

var file = document.getElementById("file");

// file.addEventListener("change", function(event) {
//     form = new FormData();
//     form.append("song", file.files[0]);
//     var xhr = new XMLHttpRequest();
//     xhr.onload = function() {
//         console.log("Upload complete.");
//     };
//     console.log(window.location.pathname);
//     xhr.open("post", "/tylerj11/visualizer/process.php", true);
//     xhr.send(form);

// });


//Now set up threejs
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000 );


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


       

camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
camera.lookAt({x : 0, y : 0, z : 0});

var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

var colors = new Array();

var nextChild = 0;

for(var i = 0; i < 3; i++) {
    colors.push(getRandomColor());
}

var counter = 0;
var oldVectors = new Array();
for(var i = 0; i < colors.length; i++) 
    oldVectors.push(new THREE.Vector3(0,0,0));
var test = 0;



function render() {
    //Get frequency data (Still don't know what "frequency" really means in terms of an integer)


    // camera.position.y += ( - mouseY + 5 - camera.position.y ) * .05;
    //             camera.lookAt( scene.position );
    // camera.position.x += ( - mouseX + 5 - camera.position.x ) * .05;
    //             camera.lookAt( scene.position );

    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    var sumFreq= 0;

    for(var i = 0; i < dataArray.length; i++) {
        sumFreq += dataArray[i];
    }

    var averageFreq = sumFreq / dataArray.length;

    if(SYNCMUSIC)
        sumFreq =  averageFreq / 32;
    else
        sumFreq = 4;


    requestAnimationFrame( render );
    if(counter >= counterMax) {
        counter = counter % counterMax + DIFF_CONSTANT;
        for(var i = 0; i < colors.length; i++) 
            oldVectors[i] = new THREE.Vector3(0,0,0);
        scene.children = new Array();
        for(var i = 0; i < 3; i++)
            colors[i] = getRandomColor();
        if(!document.getElementById("Shape").value) {
            var oldDIff = DIFF;
            DIFF = Math.random() * 3.14;
            counterMax = (counterMax/oldDIff) * DIFF;
            TIGHTNESS = Math.random();
        }

    } else {
        for(var i = 0; i < colors.length; i++) {
            var geometry = new THREE.Geometry();
            var vector1 = oldVectors[i];
            var vector2 = vector1.clone();
            vector2.x = (vector2.x + Math.sin(counter + i) / TIGHTNESS) * counter / (1000* DIFF);
            vector2.y = (vector2.y + Math.cos(counter + i) / TIGHTNESS) * counter / (1000* DIFF);
            oldVectors[i] = vector2;
            geometry.vertices.push(vector1);
            geometry.vertices.push(vector2);
            var material = new THREE.LineBasicMaterial({color : colors[i] });
            var newCube = new THREE.Line(geometry, material);
            scene.add(newCube);
        }


        scene.rotation.z += zRotate;
        scene.rotation.x += xRotate;
        scene.rotation.y += yRotate;
        scene.scale.x = sumFreq;
        scene.scale.y = sumFreq;
        counter += DIFF;
    }

    if(DELETE) {
     if(counter >= (counterMax / 2)) {
        scene.remove(scene.children[nextChild]);
        nextChild++;
    }
    }


    renderer.render( scene, camera );


}

function getRandomColor() {
    var letters = '0123CDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 8)];
    }
    return color;
}

function oneOrNegativeOne() {
    var rand = Math.random();
    if(rand < .5) {
        return -1;
    } else {
        return 1;
    }
}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

}

function addListeners() {
    document.getElementById("newShape").addEventListener("click", changeShape);
    document.getElementById("start").addEventListener("click", startVisual);
    document.getElementById("refresh").addEventListener("click", refresh)
}

function changeShape() {
    DIFF = Math.random() * 3.14;
}

function refresh() {
    if(document.getElementById("xRot").value)
        xRotate = Number(document.getElementById("xRot").value);
    if(document.getElementById("yRot").value)
        yRotate = Number(document.getElementById("yRot").value);
    if(document.getElementById("xRot").value)
        zRotate = Number(document.getElementById("zRot").value);
    if(document.getElementById("Shape").value)
        DIFF = Number(document.getElementById("Shape").value);
    if(document.getElementById("Tightness").value)
        TIGHTNESS = Number(document.getElementById("Tightness").value);
    if(document.getElementById("CounterMax").value)
        counterMax = Number(document.getElementById("CounterMax").value) * DIFF;
    SYNCMUSIC = document.getElementById("Sync").value;
    DELETE = document.getElementById("Delete").value;
    
}

function startVisual() {
    document.getElementById("start").disabled = true;
    if(document.getElementById("xRot").value)
        xRotate = Number(document.getElementById("xRot").value);
    if(document.getElementById("yRot").value)
        yRotate = Number(document.getElementById("yRot").value);
    if(document.getElementById("xRot").value)
        zRotate = Number(document.getElementById("zRot").value);
    if(document.getElementById("Shape").value) {
        DIFF = Number(document.getElementById("Shape").value);
        counterMax = DIFF * 1000;
    }
    TIGHTNESS = Number(document.getElementById("Tightness").value) || Math.random();
    DELETE = Number(document.getElementById("Delete").value);
    SYNCMUSIC = Number(document.getElementById("Sync").value);
    if(document.getElementById("CounterMax").value) 
        counterMax = Number(document.getElementById("CounterMax").value) * DIFF;
    render();
    song.play();

    
}


