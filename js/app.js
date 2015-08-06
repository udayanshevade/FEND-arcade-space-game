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
  this.x = 2 * canvasWidth/5;
  this.y = home.size * 0.4;
  this.panSpeed = 15;
  this.rotationRate = 0.0005;
  this.angle = 0;
  this.score = 1;
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

// updates score
Station.prototype.updateScore = function(amount) {
  this.score += Math.floor(amount/45);
};

/*********************************************

********** || Protagonist class || ***********

*********************************************/

// Protagonist constructor
var Protagonist = function() {
  // default ship orientation = downwards
  this.sprite = 'img/protagonist/ship.png';
  // explosion spritesheet
  this.explosionSrc = 'img/explosion.png';
  this.size = 70;
  // centers player overhead at the beginning
  this.x = canvasWidth/2 - this.size/2;
  this.y = canvasHeight/2 - this.size/2;
  // the angle which the ship is facing
  this.direction = pi;
  // angle which the ship is accelerating
  this.bearing = this.direction;
  // slight residual velocity for in media res effect
  this.velUnit = 0.01;
  this.velX = 0;
  this.velY = 0.08;
  // gradual brakes
  this.deceleration = 0.1;
  // indicates whether moving deliberately
  this.accelerating = false;
  // maximum allowed speed
  this.maxSpeed = 0.6;
  // keeps track of how long protagonist has traveled since reset
  this.traveled = 0;
  this.objectReset = 0;
  // state describing player carrying load
  this.carrying = false;
  // state describing crash
  this.crashed = false;
  this.weight = 1;
  // keeps track of shield status
  this.exposed = false;
};

// Updates the protagonist instance with every animation request
Protagonist.prototype.update = function() {
  // takes in key input
  this.handleInput();
  // keeps player within camera bounds
  this.checkViewBounds();
  // view reacts to movement
  //this.lerp();
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
Protagonist.prototype.move = function(direction) {
  if (direction === 'forwards') {
    var oriented = 1;
  }
  if (direction === 'backwards') {
    var oriented = -1;
  }
  this.velX += this.velUnit * Math.sin(this.bearing)
                * 0.2 * oriented;
  this.velY += -this.velUnit * Math.cos(this.bearing)
                * 0.2 * oriented;
};


Protagonist.prototype.handleInput = function() {
  // accelerate (w)
  if (keys[87]) {
    // if velocity is lower than maximum
    if (Math.abs(this.velX) < this.maxSpeed ||
        Math.abs(this.velY) < this.maxSpeed) {
      // reset velocity for quick transition
      // add increment to speed
      this.move('forwards');
    }
    // if ship rotation has changed
    if (this.bearing != this.direction) {
      // accelerate in that new direction
      this.bearing = this.direction;
      this.velX /= 1.05;
      this.velY /= 1.05;
    }
  }
  // reverse (s)
  if (keys[83]) {
    if (Math.abs(this.velX) < this.maxSpeed ||
        Math.abs(this.velY) < this.maxSpeed) {
      this.move('backwards');
    }
    if (this.bearing != this.direction) {
      this.bearing = this.direction;
      this.velX /= 1.05;
      this.velY /= 1.05;
    }
  }
  // rotate right (right)
  if (keys[39]) {
    // if direction angle less than tau
    if (this.direction < tau) {
      // add incremental angle
      this.direction += 0.05;
    }
    else {
      // reset angle to 0
      this.direction = 0;
    }
  }
  // rotate left (left)
  if (keys[37]) {
    if (this.direction > 0) {
      this.direction -= 0.05;
    }
    else {
      this.direction = tau;
    }
  }
};


// ensures player stays within movement window
Protagonist.prototype.checkViewBounds = function() {
  if (this.x + this.size > canvasWidth * 0.75) {
    this.x = canvasWidth * 0.75 - this.size;
  }
  if (this.x < canvasWidth/4) {
    this.x = canvasWidth/4;
  }
  if (this.y + this.size > canvasHeight * 0.75) {
    this.y = canvasHeight * 0.75 - this.size;
  }
  if (this.y < canvasHeight/4) {
    this.y = canvasHeight/4;
  }
};

// viewport reflects player movement
Protagonist.prototype.lerp = function() {
  var screenCenterX = canvasWidth/2 - this.size/2;
  var screenCenterY = canvasHeight/2 - this.size/2;
  if (this.accelerating) {
    this.x -= this.velX;
    this.y -= this.velY;
  }
  if (!this.accelerating) {
    if (this.x < screenCenterX) {
      this.x += Math.abs(this.velX);
    }
    if (this.x > screenCenterX) {
      this.x -= Math.abs(this.velX);
    }
    if (this.y < screenCenterY) {
      this.y += Math.abs(this.velY);
    }
    if (this.y < screenCenterY) {
      this.y -= Math.abs(this.velY);
    }
  };
};

/**********************************************

********** || GPS Guidance class || ***********

**********************************************/

var Guidance = function() {
  this.color = 'green';
  this.alpha = 0;
  this.maxAlpha = 0.4;
  this.active = true;
}

Guidance.prototype.update = function() {
  this.fade();
};

Guidance.prototype.render = function() {
  if (guidance.active) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.moveTo(station.x + station.size/2, station.y + station.size/2);
    ctx.lineTo(protagonist.x + protagonist.size/2,
                protagonist.y + protagonist.size/2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
};

Guidance.prototype.fade = function() {
  if (this.active && station.visible && this.alpha > 0) {
    this.alpha -= 0.006;
  }
  else if (!station.visible && this.alpha < this.maxAlpha) {
    this.alpha += 0.006;
  }
};

/**********************************************

************* || Shield class || **************

**********************************************/

var Shield = function() {
  this.width = 145;
  this.height = 140;
  this.explosionSrc = 'img/protagonist/blue-explosion.png';
  this.srcs = ['img/protagonist/shield3.png',
              'img/protagonist/shield2.png',
              'img/protagonist/shield1.png'];
  this.srcIndex = 0;
  this.x = protagonist.x + protagonist.size/2 - this.width/2;
  this.y = protagonist.y + protagonist.size/2 - this.height/2;
  this.hitCount = 0;
};

Shield.prototype.render = function() {
  if (!protagonist.exposed) {
    ctx.save();
    this.globalAlpha = 0.5;
    ctx.translate(this.x + this.width/2, this.y + this.height/2);
    ctx.rotate(protagonist.direction);
    ctx.translate(-this.x - this.width/2, -this.y - this.height/2);
    ctx.drawImage(Resources.get(this.srcs[this.srcIndex]),
                  this.x,
                  this.y,
                  this.width,
                  this.height);
    ctx.restore();
  }
};

Shield.prototype.update = function() {
  this.changeMode();
};


Shield.prototype.changeMode = function() {
  if (this.hitCount < 2) {
    this.srcIndex = this.hitCount;
  }
  else {
    protagonist.exposed = true;
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
  this.animateIndex = 0;
  this.load = 0;
  this.maxLoad = 1;
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
  if (this.tractorOn && !protagonist.crashing) {
    if (this.sy < this.size) {
      this.sy++;
    }
    else if (!this.tracting && this.sy >= this.size) {
      this.sy = 0;
      this.animateIndex++;
      if (this.animateIndex > 3) {
        this.animateIndex = 0;
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
  this.driftVel = vel;
  this.angle = Math.random() * tau;
  this.explosionSrc = shield.explosionSrc;
  this.src = 'img/asteroid-1.png';
  this.rotationRate = Math.random() * 0.0025;
  this.inView = false;
  this.insideTractor = false;
  this.tracted = false;
  this.tracting = false;
  this.panSpeed = 20;
  this.weight = 1 + Math.floor(this.size/45);
}

// renders asteroid image and rotates image
Asteroid.prototype.render = function() {
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
    if (protagonist.exposed) {
      this.explosionSrc = protagonist.explosionSrc;
    }
    this.animateCrash(this.x, this.y);
  }
};

// updates asteroid properties
Asteroid.prototype.update = function() {
  if (!this.tracting) {
    // responds to player movement
    this.panVertical();
    this.panHorizontal();
    // checks if asteroid has crashed into player
    this.checkCrash();
    // checks if tractor has latched on
    if (tractor.tractorOn) {
      this.checkTractorEntry();
    }
    this.checkDropOff();
    this.checkRelease();
  }
  else {
    if (tractor.load === 1) {
      this.lug();
    }
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
    if (protagonist.exposed) {
      protagonist.crashed = true;
    }
  }
};

Asteroid.prototype.animateCrash = function(x, y) {
  var sx = crashFrames[crashFrameIndex].sx;
  var sy = crashFrames[crashFrameIndex].sy;
  ctx.drawImage(Resources.get(this.explosionSrc),
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
    if (shield.hitCount >= 0) {
      shield.hitCount++;
    }
    this.reset();
  }
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


// checks if asteroid is inside tractor
Asteroid.prototype.checkTractorEntry = function() {
  if (tractor.load < 1) {
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
        protagonist.maxSpeed /= this.weight;
        tractor.load++;
        this.tracting = true;
        this.insideTractor = true;
        tractor.tracting = true;
        this.tracted = true;
      }
    }
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
Asteroid.prototype.checkDropOff = function() {
  if (this.x > station.x && this.x < station.x + station.size
      && this.y > station.y && this.y < station.y + station.size
      && !this.tracting && this.tracted) {
    station.updateScore(this.size);
    this.reset();
    this.tracted = false;
    this.insideTractor = false;
    tractor.load--;
  }
};

//
Asteroid.prototype.checkRelease = function() {
  if (!this.tracting && this.tracted) {
    this.tracted = false;
    this.insideTractor = false;
    tractor.load--;
  }
};


Asteroid.prototype.reset = function() {
  var newAngle = Math.random() * tau;
  this.x = home.x + home.size/2 + (5 * canvasWidth * Math.random() * Math.sin(newAngle)) * station.score;
  this.y = home.y + home.size/2 + 5 * (canvasHeight * Math.random() * Math.cos(newAngle)) * station.score;
  this.driftVel = Math.random() * 0.1;
  this.explosionSrc = shield.explosionSrc;
};


/**********************************************

************** || Text class || ***************

**********************************************/

var GameText = function(text, size, x, y) {
  this.font = size + ' Future';
  this.x = x;
  this.y = y;
  this.text = text;
  this.alpha = 1;
  this.fadeRate = -0.0025;
  this.displaying = false;
};

// renders text
GameText.prototype.render = function() {
  if (this.displaying) {
    ctx.save();
    ctx.font = this.font;
    ctx.fillStyle = 'white';
    ctx.globalAlpha = this.alpha;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
};

// updates game text changes
GameText.prototype.update = function() {
  if (this.displaying) {
    this.fade();
  }
}

// fades out of view
GameText.prototype.fade = function() {
  this.alpha += this.fadeRate;
  if (this.alpha <= -this.fadeRate * 5) {
    this.displaying = false;
  }
};


/*****
  Instantiate all classes
*****/

// player object
var protagonist = new Protagonist();

// tractor beam object
var tractor = new Tractor();

// shield object
var shield = new Shield();

// planet object
var home = new Home();

// station object
var station = new Station();

// GPS guidance object
var guidance = new Guidance();

var yPosition = canvasHeight/3;

// message objects
var welcomeMessage = 'Tow the asteroids back to the mining station.';
var welcomeText = new GameText(welcomeMessage, '20px', canvasWidth/6.5, yPosition);
var resetMessage = 'Do not fail us like the last one.';
var resetText = new GameText(resetMessage, '20px', 2 * canvasWidth/5, yPosition);


// background star tile objects
var starQuadrants = [];
var starQuadIndex = 0;

for (var w = -512; w < canvasWidth + 512; w += 512) {
  for (var h = -256; h < canvasHeight + 256; h += 256) {
    starQuadrants[starQuadIndex] = new BackgroundStars(w, h);
    starQuadIndex++;
  }
}

// asteroid objects
maxAsteroids = 100;
var allAsteroids = [];

for (var asteroidIndex = 0; asteroidIndex < maxAsteroids; asteroidIndex++) {
  // spawns at an angle relative to home planet
  var newAngle = Math.random() * tau;
  var newX = home.x + home.size/2 + 5 * canvasWidth * Math.random() * Math.sin(newAngle);
  var newY = home.y + home.size/2 + 5 * canvasHeight * Math.random() * Math.cos(newAngle);
  var newVel = 0;
  var newSize = Math.ceil(Math.random() * 45 * 2);
  // creates asteroid object and places in allAsteroids array
  allAsteroids[asteroidIndex] = new Asteroid(newX, newY, newVel, newSize);
}


/*****
***** This code handles player movement and input.
*****/

// forward/backward/rotation
// tracks keycode for fluid motion
document.addEventListener('keydown', function(e) {
  if (e.keyCode === 83 || e.keyCode === 87) {
    protagonist.accelerating = true;
  }
  keys[e.keyCode] = true;
});

// sets released keycode to false
document.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
  if (e.keyCode === 83 ||
      e.keyCode === 87) {
    protagonist.accelerating = false;
  }
});

// this code handles the tractor beam toggle
document.addEventListener('keypress', function(e) {
  if (e.keyCode === 32) {
    if (protagonist.carrying) {
      protagonist.carrying = !protagonist.carrying;
    }
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
  if (e.keyCode === 103) {
    guidance.active = !guidance.active;
  }
});