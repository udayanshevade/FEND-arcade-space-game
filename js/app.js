var pi = Math.PI;
var tau = pi * 2;
var canvasWidth = 800;
var canvasHeight = 600;

keys = [];

var crashFrames = [];
for (var m = 0; m < 512; m += 128) {
  for (var n = 0; n < 768; n += 256) {
    crashFrames.push({'sx': n, 'sy': m});
  }
}

var crashFrameIndex = 0;


/*********************************************

******** || Background Stars class || ********

*********************************************/

/*
* Background constructor
* Creates a tile object for each (x, y) coordinate
*/
var BackgroundStars = function(x, y) {
  this.src = 'img/stars-background.png';
  this.soundOne = 'audio/space-ambience.wav';
  this.soundTwo = 'audio/space-bass.wav';
  this.x = x;
  this.y = y;
  this.width = 512;
  this.height = 256;
  this.velX;
  this.velY;
  this.panSpeed = 7;
}

// Updates background stars tile object
BackgroundStars.prototype.update = function() {

  // wraps around the screen so only limited tiles are reused
  this.wrap();

  // tiles respond to player input (vertical)
  this.panVertical();
  // responds to player input (horizontal)
  this.panHorizontal();

  // keeps count of how far protagonist has traveled since last reset
  //protagonist.traveled;
};


// Renders the background star tile objects
BackgroundStars.prototype.render = function() {
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.width,
                this.height);
};


// Responds to player input (vertical)
BackgroundStars.prototype.panVertical = function() {
  this.velY = -protagonist.velY * this.panSpeed;
  this.y += this.velY;
};


// Responds to player input (horizontal)
BackgroundStars.prototype.panHorizontal = function() {
  this.velX = -protagonist.velX * this.panSpeed;
  this.x += this.velX;
};

BackgroundStars.prototype.wrap = function() {
  if (this.y < -256) {
    this.y = canvasHeight + 256;
  }
  if (this.y > canvasHeight + 256) {
    this.y = -256;
  }
  if (this.x < -512) {
    this.x = canvasWidth + 512;
  }
  if (this.x > canvasWidth + 512) {
    this.x = -512;
  }
};



/**********************************************

*********** || Home Planet Class || ***********

**********************************************/

var Home = function() {
  this.src = 'img/planet2.png';
  this.size = 800;
  this.x = canvasWidth/2 - this.size/2;
  this.y = 0;
  this.panSpeed = 10;
}

Home.prototype.render = function() {
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.size,
                this.size);
};

Home.prototype.update = function() {
  this.panVertical();
  this.panHorizontal();
};

// Responds to player input (vertical)
Home.prototype.panVertical = function() {
  this.velY = -protagonist.velY * this.panSpeed;
  this.y += this.velY;
};


// Responds to player input (horizontal)
Home.prototype.panHorizontal = function() {
  this.velX = -protagonist.velX * this.panSpeed;
  this.x += this.velX;
};

/**********************************************

************* || Station Class || *************

**********************************************/

var Station = function() {
  this.src = 'img/station.png';
  this.size = 350;
  this.x = canvasWidth/2 + this.size/2;
  this.y = home.size * 0.75;
  this.panSpeed = 12;
  this.rotationRate = 0.0005;
  this.angle = 0;
}

Station.prototype.render = function() {
  ctx.save();
  ctx.translate(this.x + this.size/2, this.y + this.size/2);
  ctx.rotate(this.angle);
  ctx.translate(-this.x-this.size/2, -this.y-this.size/2);
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.size,
                this.size);
  ctx.restore();
};

Station.prototype.update = function() {
  this.rotate();
  this.panVertical();
  this.panHorizontal();
};

// Responds to player input (vertical)
Station.prototype.panVertical = function() {
  this.velY = -protagonist.velY * this.panSpeed;
  this.y += this.velY;
};


// Responds to player input (horizontal)
Station.prototype.panHorizontal = function() {
  this.velX = -protagonist.velX * this.panSpeed;
  this.x += this.velX;
};

// rotates station
Station.prototype.rotate = function() {
  if (this.angle < tau) {
    this.angle += tau * this.rotationRate;
  }
  else {
    this.angle = 0;
  }
};

/*********************************************

********** || Protagonist class || ***********

*********************************************/

// Protagonist constructor
var Protagonist = function() {
  // default ship orientation = downwards
  this.sprite = 'img/protagonist/ship.png';
  // explosion spritesheet
  this.explosionSrc = 'img/protagonist/blue-explosion.png';
  this.size = 70;
  // centers player overhead at the beginning
  this.x = canvasWidth/2 - this.size/2;
  this.y = canvasHeight/2 - this.size/2;
  // the angle which the ship is facing
  this.direction = pi;
  // angle which the ship is accelerating
  this.bearing = this.direction;
  // slight residual velocity for in media res effect
  this.velocity = 1;
  this.velX = 0;
  this.velY = 0;
  // gradual brakes
  this.deceleration = 0.1;
  // maximum allowed speed
  this.maxSpeed = 3;
  // keeps track of how long protagonist has traveled since reset
  this.traveled = 0;
  this.objectReset = 0;
  // state describing player carrying load
  this.carrying = false;
  // state describing crash
  this.crashed = false;
  this.weight = 1;
};

// Updates the protagonist instance with every animation request
Protagonist.prototype.update = function() {
  console.log(this.weight);
  // takes in key input
  this.handleInput();
  // moves according to current velocity
  this.move();
};


// Renders the image of the protagonist
Protagonist.prototype.render = function() {
  ctx.save();
  ctx.translate(this.x + this.size/2, this.y + this.size/2);
  ctx.rotate(this.direction);
  ctx.translate(-this.x-this.size/2, -this.y-this.size/2);
  ctx.drawImage(Resources.get(this.sprite),
                this.x,
                this.y,
                this.size,
                this.size);
  ctx.restore();
};


// Controls overall player motion
Protagonist.prototype.move = function() {
  this.velX = this.velocity * Math.sin(this.bearing) * 0.2 / this.weight;
  this.velY = -this.velocity * Math.cos(this.bearing) * 0.2 / this.weight;
}


Protagonist.prototype.handleInput = function() {
  // accelerate (up or w)
  if (keys[87] || keys[38]) {
    // if velocity is lower than maximum
    if (this.velocity < this.maxSpeed) {
      // reset velocity for quick transition
      // add increment to speed
      this.velocity += 0.1;
    }
    // if ship rotation has changed
    if (this.bearing != this.direction) {
      // accelerate in that new direction
      this.bearing = this.direction;
      this.velocity /= 2;
    }
  }
  // reverse (down or s)
  if (keys[83] || keys[40]) {
    if (this.velocity > -this.maxSpeed) {
      this.velocity -= 0.1;
    }
    if (this.bearing != this.direction) {
      this.bearing = this.direction;
      this.velocity /= 2;
    }
  }
  // rotate right (right or d)
  if (keys[68] || keys[39]) {
    // if direction angle less than tau
    if (this.direction < tau) {
      // add incremental angle
      this.direction += 0.1;
    }
    else {
      // reset angle to 0
      this.direction = 0;
    }
  }
  // rotate left (left or a)
  if (keys[65] || keys[37]) {
    if (this.direction > 0) {
      this.direction -= 0.1;
    }
    else {
      this.direction = tau;
    }
  }
};


/**********************************************

********** || Tractor Beam class || ***********

**********************************************/

// declares relevant properties of tractor beams
var Tractor = function() {
  this.size = 65;
  this.srcs = ['img/warp-cursor.png',
              'img/protagonist/tractor-free.png',
              'img/protagonist/tractor-locked.png'];
  this.srcIndex = 0;
  this.attractCount = 0;
  this.sy = this.size;
  this.x = protagonist.x + protagonist.size/2 - this.size/2;
  this.y = protagonist.y + protagonist.size/2 - this.size/2;
  this.tractorOn = false;
  this.tracting = false;
};


// renders tractor beam and animates
Tractor.prototype.render = function() {
  if (this.srcIndex != 0) {
    ctx.save();
    ctx.translate(this.x + this.size/2, this.y + this.size/2);
    ctx.rotate(protagonist.direction);
    ctx.translate(-this.x-this.size/2, -this.y-this.size/2);
  }
  ctx.drawImage(Resources.get(this.srcs[this.srcIndex]),
                0,
                0,
                this.size,
                this.sy,
                this.x,
                this.y,
                this.size,
                this.sy);
  ctx.restore();
};

// updates tractor values
Tractor.prototype.update = function() {
  this.changeMode();
  this.revolve();
  this.attract();
};

// revolves the tractor around the player
Tractor.prototype.revolve = function() {
  this.x = protagonist.x + protagonist.size/2 - this.size/2
          - protagonist.size * Math.sin(protagonist.direction);
  this.y = protagonist.y + protagonist.size/2 - this.size/2
          + protagonist.size * Math.cos(protagonist.direction);
};

// Changes the mode of the tractor
Tractor.prototype.changeMode = function() {
  if (this.tractorOn) {
    if (this.tracting) {
      this.srcIndex = 2;
    }
    else {
      this.srcIndex = 1;
    }
  }
  else {
    this.srcIndex = 0;
  }
};

// Animates tractor and turns it off
Tractor.prototype.attract = function() {
  if (this.tractorOn) {
    if (this.sy < this.size) {
      this.sy++;
    }
    else if (!this.tracting && this.sy >= this.size) {
      this.sy = 0;
      this.attractCount++;
      if (this.attractCount > 3) {
        this.attractCount = 0;
        this.sy = this.size;
        this.srcIndex = 0;
        this.tractorOn = false;
      }
    }
  }
  else {
    this.sy = this.size;
  }
};

/**********************************************

************ || Asteroid class || *************

**********************************************/

// declares basic asteroid properties
var Asteroid = function(x, y, vel, size) {
  this.size = size;
  this.x = x;
  this.y = y;
  this.vel = vel;
  this.angle = Math.random() * tau;
  this.src = 'img/asteroid-1.png';
  this.rotationRate = Math.random() * 0.0025;
  this.inView = false;
  this.insideTractor = false;
  this.tracting = false;
  this.panSpeed = 12;
  this.weight = Math.floor(this.size/45) * 2;
}

// updates asteroid properties
Asteroid.prototype.update = function() {
  if (!this.tracting) {
    // moves according to randomly generated velocity
    this.drift();
    // responds to player movement
    this.panVertical();
    this.panHorizontal();
    // checks if asteroid moves into of bounds
    this.checkBounds();
    // checks if asteroid has crashed into player
    this.checkCrash();
    // checks if tractor has latched on
    if (tractor.tractorOn) {
      this.checkTractorEntry();
    }
  }
  else {
    this.lug();
  }
  // rotates
  this.rotate();
};

Asteroid.prototype.checkCrash = function() {
  var halfShipWidth = protagonist.size/2;
  var halfShipHeight = protagonist.size/2;
  // recalculates center as player position changes
  var thisCenterX = this.x + this.size/2;
  var thisCenterY = this.y + this.size/2;
  var protagonistCenterX = protagonist.x + halfShipWidth;
  var protagonistCenterY = protagonist.y + halfShipHeight;
  var xDist = Math.abs(thisCenterX - protagonistCenterX);
  var yDist = Math.abs(thisCenterY - protagonistCenterY);
  if (xDist < halfShipWidth && yDist < halfShipHeight) {
    this.crashing = true;
  }
};

Asteroid.prototype.animateCrash = function(x, y) {
  var sx = crashFrames[crashFrameIndex].sx;
  var sy = crashFrames[crashFrameIndex].sy;
  ctx.drawImage(Resources.get(protagonist.explosionSrc),
                sx,
                sy,
                256,
                128,
                x - 128,
                y - 64,
                256,
                128);
  if (crashFrameIndex < crashFrames.length - 1) {
    crashFrameIndex++;
  }
  else {
    crashFrameIndex = 0;
    this.crashing = false;
  }
};

// renders asteroid image and rotates image
Asteroid.prototype.render = function() {
  if (this.inView) {
    if (!this.crashing) {
      var centerX = this.x + this.size/2;
      var centerY = this.y + this.size/2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.angle);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(Resources.get(this.src),
                    this.x,
                    this.y,
                    this.size,
                    this.size);
      ctx.restore();
    }
    else {
      this.animateCrash(this.x, this.y);
    }
  }
};

// controls asteroid motion
Asteroid.prototype.drift = function() {
};

// lugs asteroids along player
Asteroid.prototype.lug = function() {
  this.x = protagonist.x + protagonist.size/2 - this.size/2
          - protagonist.size * Math.sin(protagonist.direction);
  this.y = protagonist.y + protagonist.size/2 - this.size/2
          + protagonist.size * Math.cos(protagonist.direction);
}


// rotates asteroid
Asteroid.prototype.rotate = function() {
  if (this.angle < tau) {
    this.angle += tau * this.rotationRate;
  }
  else {
    this.angle = 0;
  }
};

// checks when asteroid travels out visible bounds
Asteroid.prototype.checkBounds = function() {
  if (this.x + this.size > 0
    && this.x < canvasWidth
    && this.y + this.size > 0
    && this.y < canvasHeight) {
    this.inView = true;
  }
  else {
    this.inView = false;
  }
};


// checks if asteroid is inside warp gate
Asteroid.prototype.checkTractorEntry = function() {
  var halfTractorWidth = tractor.size/2;
  var halfTractorHeight = tractor.sy/2;
  // recalculates center as player position changes
  var thisCenterX = this.x + this.size/2;
  var thisCenterY = this.y + this.size/2;
  var tractorCenterX = tractor.x + halfTractorWidth;
  var tractorCenterY = tractor.y + halfTractorHeight;
  var xDist = Math.abs(thisCenterX - tractorCenterX);
  var yDist = Math.abs(thisCenterY - tractorCenterY);
  if (xDist < halfTractorWidth && yDist < halfTractorHeight) {
    if (!this.insideTractor) {
      protagonist.weight += this.weight;
    }
    this.tracting = true;
    this.insideTractor = true;
    tractor.tracting = true;
  }
};

// Responds to player input (vertical)
Asteroid.prototype.panVertical = function() {
  this.velY = -protagonist.velY * this.panSpeed;
  this.y += this.velY;
};


// Responds to player input (horizontal)
Asteroid.prototype.panHorizontal = function() {
  this.velX = -protagonist.velX * this.panSpeed;
  this.x += this.velX;
};

// updates score if asteroid inside station bounds
Asteroid.prototype.checkStorage = function() {
  if (this.x < station.x + station.size) {

  }
};


/*****
  Instantiate all classes
*****/

protagonist = new Protagonist();

tractor = new Tractor();

home = new Home();

station = new Station();

// For background star tile objects
var starQuadrants = [];
var starQuadIndex = 0;

for (var w = -512; w < canvasWidth + 512; w += 512) {
  for (var h = -256; h < canvasHeight + 256; h += 256) {
    starQuadrants[starQuadIndex] = new BackgroundStars(w, h);
    starQuadIndex++;
  }
}

maxAsteroids = 1;
var allAsteroids = [];

for (var asteroidIndex = 0; asteroidIndex < maxAsteroids; asteroidIndex++) {
  var newX = Math.random() * canvasWidth;
  var newY = canvasHeight * 2;
  var newVel = 0;
  var newSize = 45;
  allAsteroids[asteroidIndex] = new Asteroid(newX, newY, newVel, newSize);
}


/*****
***** This code handles player movement.
*****/

document.addEventListener('keydown', function(e) {
  if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault();
  }
  keys[e.keyCode] = true;
  keydown = true;
});

document.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
});

document.addEventListener('keypress', function(e) {
  if (e.keyCode === 32) {
    console.log(allAsteroids);
    protagonist.carrying = !protagonist.carrying;
    tractor.tractorOn = !tractor.tractorOn;
    if (tractor.tracting) {
      tractor.tracting = !tractor.tracting;
    }
    allAsteroids.forEach(function(asteroid) {
      if (asteroid.tracting) {
        asteroid.tracting = !asteroid.tracting;
      }
    });
  }
});