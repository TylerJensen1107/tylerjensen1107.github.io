function Person (Graphics, stage, x, y) {
	var person = this;
    this.color = "black";
   	this.x = x;
   	this.y = y;
   	this.size = 10;
   	this.goToX = x;
   	this.goToY = y;
   	this.speed = 2;
   	this.selected = false;

   	this.atPosition = function() {
   		return this.x < this.goToX + this.size && this.x > this.goToX - this.size && 
   		this.y < this.goToY + this.size && this.y > this.goToY + this.size;
   	}

    this.getInfo = function() {
        return this.color + ' ' + this.type + ' apple';
    }

    //Create a rectangle object that defines the position and
  //size of the sub-image you want to extract from the texture
  rectangle = new Graphics();
  rectangle.beginFill(0xFF0000);
  rectangle.drawRect(0, 0, 10, 10);
  rectangle.endFill();
  rectangle.interactive = true;
  // make circle non-transparent when mouse is over it
	rectangle.mouseover = function(mouseData) {
	  this.beginFill(0xFFFF00);
	  this.drawRect(0, 0, 10, 10);
	  this.endFill();
	}

   rectangle.mouseout = function(mouseData) {
	  if(!person.selected) { 
		  this.beginFill(0xFF0000);
		  this.drawRect(0, 0, 10, 10);
		  this.endFill();
	   }
	}

	rectangle.click = function(mouseData) {
	  person.selected = true;
	  this.beginFill(0xFFFF00);
	  this.drawRect(0, 0, 10, 10);
	  this.endFill();
	}

  this.graphics = rectangle;
  this.graphics.x = this.x;
  this.graphics.y = this.y;
  stage.addChild(rectangle);
}

function Space() {
	this.type = "plain";
	this.contains = [];
}

function Shot(x, y, goToX, goToY) {
	this.type = "small";
	this.x = x;
   	this.y = y;
   	this.goToX = goToX;
   	this.goToY = goToY;
   	this.speed = 20;

   	this.atPosition = function() {
   		return this.x == this.goToX && this.y == this.goToY;
   	}
}

//init the grid matrix

var matrix = [],
    cols = 10;
var unitList = [];
var shotList = [];

for ( var i = 0; i < cols; i++ ) {
    matrix[i] = []; 
}


for( var i = 0; i < cols; i++) {
	for( var j = 0; j < cols; j++) {
		matrix[i].push(new Space());
	}
}


var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    TextureCache = PIXI.TextureCache,
    Rectangle = PIXI.Rectangle;
    Graphics = PIXI.Graphics;

var state, rectangle;

//Create a Pixi stage and renderer and add the 
//renderer.view to the DOM
var stage = new PIXI.Stage(0x000000, true),
    renderer = autoDetectRenderer(500, 500);
document.body.appendChild(renderer.view);

renderer.view.onmousedown = function(mouseData) {

	//start drawing box
	var startX = mouseData.offsetX,
		startY = mouseData.offsetY;
	rectangle = new Graphics();
	rectangle.alpha = .1;
 	rectangle.lineWidth = 5;
 	rectangle.lineColor = "pink";
 	rectangle.beginFill(0xFF00FF);
  	rectangle.drawRect(startX, startY, 1, 1);
  	rectangle.endFill();
  	stage.addChild(rectangle);

  	//Highlight clicked units
	for(var i = 0; i < unitList.length; i++) {
		var unit = unitList[i];
		if(unit.selected && !unit.graphics.containsPoint(new PIXI.Point(mouseData.offsetX, mouseData.offsetY))) {
			unit.selected = false;
			unit.graphics.beginFill(0xFF0000);
		  	unit.graphics.drawRect(0, 0, 10, 10);
		 	unit.graphics.endFill();
		 	unit.goToX = mouseData.offsetX;
		 	unit.goToY = mouseData.offsetY;
		}
	}


	renderer.view.onmousemove = function(mouseData) {
		rectangle.beginFill(0xFF00FF);
		rectangle.drawRect(startX, startY, mouseData.offsetX - startX, mouseData.offsetY - startY);
		rectangle.endFill();
	}

	renderer.view.onmouseup = function(mouseData) {
		for( var i = 0; i < unitList.length; i++) {
			var unit = unitList[i];
			if(startX < unit.x && unit.x < mouseData.offsetX) {
				if(startY < unit.y && unit.y < mouseData.offsetY ||
					startY > unit.y && unit.y > mouseData.offsetY) {
					unit.selected = true;
					unit.graphics.beginFill(0xFFFF00);
					unit.graphics.drawRect(0, 0, 10, 10);
					unit.graphics.endFill();
				}
			}
			if(startY < unit.y && unit.y < mouseData.offsetY) {
				if(startX < unit.x && unit.x < mouseData.offsetX ||
					startX > unit.x && unit.x > mouseData.offsetX) {
					unit.selected = true;
					unit.graphics.beginFill(0xFFFF00);
					unit.graphics.drawRect(0, 0, 10, 10);
					unit.graphics.endFill();
				}
			}
		}
		stage.removeChild(rectangle);
	}
}


// create a texture from an image path
setup();

function setup() {

	var newUnit = new Person(Graphics, stage, 0, 0);
	unitList.push(newUnit)
	matrix[0][0].contains.push(newUnit);

	unitList[0].goToX = 20;
	unitList[0].goToY = 20;

	// var newUnit2 = new Person(Graphics, stage, 200, 200);
	// unitList.push(newUnit2)
	// matrix[0][0].contains.push(newUnit2);

	// unitList[1].goToX = 10;
	// unitList[1].goToY = 200;


  state = play;
  gameLoop();
}

function gameLoop() {

  //Loop this function at 60 frames per second
  requestAnimationFrame(gameLoop);

  //Update the current game state:
  state();

  //Render the stage to see the animation
  renderer.render(stage);
}


function play() {

	//animate shots
	for(var i = 0; i < shotList.length; i++) {
		var shot = shotList[i];
		updatePos(shot);
	}

	//move units
	for(var i = 0; i < unitList.length; i++) {
		var unit = unitList[i];
		updatePos(unit, i, i < unitList.length - 1);
	}
}

function updatePos(object, i , possibleNextUnit) {
	var totalDist = Math.abs(object.goToX - object.x) + Math.abs(object.goToY - object.y);
	var xRatio = (object.goToX - object.x) / totalDist;
	var yRatio = (object.goToY - object.y) / totalDist;
	if(!object.atPosition() && totalDist != 0) {
		object.x += (xRatio * object.speed);
		object.graphics.x += (xRatio  * object.speed);
		object.y += (yRatio  * object.speed);
		object.graphics.y += (yRatio  * object.speed);
	} else if (possibleNextUnit) {
		checkCollision(object, unitList[i + 1]);
	} else {
		checkCollision(object, unitList[0]);
	}
}

function fire(unit1, unit2) {
  var shot = new Shot(unit1.x, unit1.y, unit2.x, unit2.y);
  shotList.push(shot);
  rectangle = new Graphics();
  rectangle.beginFill(0xFFFF00);
  rectangle.drawRect(shot.x, shot.y, 2, 2);
  rectangle.endFill();
  shot.graphics = rectangle;
  stage.addChild(rectangle);
}


//Keyboard code
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function(event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function checkCollision(person1, person2) {
	console.log("checkCollision");
	
	//person 2 is withitin person 1
	if(person1.x < person2.x && person1.x + person1.size > person2.x &&
		person1.y < person2.y && person1.y + person1.size > person2.y) {
		person1.goToY += person1.size * 3;
		person1.goToX -= person1.size * 3;
		person2.goToX += person1.size * 3;
		person2.goToY -= person1.size * 3;
	}
}

//Capture the keyboard arrow keys
var left = keyboard(37),
  up = keyboard(38),
  right = keyboard(39),
  down = keyboard(40);

//Left arrow key `press` method
left.press = function() {

//Change the cat's velocity when the key is pressed
cat.vx = -5;
cat.vy = 0;
};

//Left arrow key `release` method
left.release = function() {

//If the left arrow has been released, and the right arrow isn't down,
//and the cat isn't moving vertically:
//Stop the cat
if (!right.isDown && cat.vy === 0) {
  cat.vx = 0;
}
};

//Up
up.press = function() {
  var newUnit = new Person(Graphics, stage, Math.random() * 200, Math.random() * 200);
  unitList.push(newUnit)
};
up.release = function() {

};

//Right
right.press = function() {
	console.log(unitList);
};
right.release = function() {

};

//Down
down.press = function() {
cat.vy = 5;
cat.vx = 0;
};
down.release = function() {
if (!up.isDown && cat.vx === 0) {
  cat.vy = 0;
}
};






