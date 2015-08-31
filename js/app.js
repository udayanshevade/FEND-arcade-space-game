var pi = Math.PI;
var tau = pi * 2;
var canvasWidth = 800;
var canvasHeight = 600;
var halfCanvasWidth = canvasWidth/2;
var halfCanvasHeight = canvasHeight/2;

// List of background object images to inherit unique properties
var allBackgroundImages = [
            {
              'name' : 'hurricane-nebula',
              'src': 'img/hurricane-nebula.png',
              'x' : null,
              'width' : 1024,
              'height' : 768,
              'proximity' : 40,
              'alpha' : 0.6,
              'messages' : ['']
            },
            {
              'name' : 'filings-nebula',
              'src': 'img/filings-nebula.png',
              'x' : null,
              'width' : 894,
              'height' : 894,
              'proximity' : 45,
              'alpha' : 0.7,
              'messages' : ['']
            },
            {
              'name' : 'brown-nebula',
              'src': 'img/brown-nebula.png',
              'x' : -800,
              'width' : 2560,
              'height' : 1600,
              'proximity' : 38,
              'alpha' : 0.5,
              'messages' : ['']
            },
            {
              'name' : 'red-black-nebula',
              'src': 'img/red-black-nebula.png',
              'x' : -800,
              'width' : 2560,
              'height' : 1600,
              'proximity' : 32,
              'alpha' : 0.6,
              'messages' : ['']
            },
            {
              'name' : 'planet-one',
              'src' : 'img/planet1.png',
              'x' : null,
              'width' : 300,
              'height' : 300,
              'proximity' : 50,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'planet-two',
              'src' : 'img/planet2.png',
              'x' : null,
              'width' : 500,
              'height' : 500,
              'proximity' : 45,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'mottled-sun',
              'src' : 'img/mottled-sun.png',
              'x' : null,
              'width' : 600,
              'height' : 600,
              'proximity' : 50,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'galactic-cluster',
              'src' : 'img/galactic.png',
              'x' : null,
              'width' : 800,
              'height' : 750,
              'proximity' : 50,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'space-cluster',
              'src' : 'img/space-cluster.png',
              'x' : null,
              'width' : 1050,
              'height' : 735,
              'proximity' : 55,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'star-crescent-planet',
              'src' : 'img/star-crescent-planet.png',
              'x' : null,
              'width' : 800,
              'height' : 480,
              'proximity' : 45,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'gibbous-planet',
              'src' : 'img/gibbous-planet.png',
              'x' : null,
              'width' : 700,
              'height' : 650,
              'proximity' : 50,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'asteroid-field',
              'src' : 'img/asteroid-field-1.png',
              'x' : null,
              'width' : 1200,
              'height' : 1000,
              'proximity' : 60,
              'alpha' : 1,
              'messages' : ['']
            }
          ];

// sets up the frames for the crash spritesheet
var crashFrames = [];
for (var m = 0; m < 512; m += 128) {
  for (var n = 0; n < 768; n += 256) {
    crashFrames.push({'sx': n, 'sy': m});
  }
}
// first crashframe at 0 index of the crashFrames array
var crashFrameIndex = 0;



/*********************************************

*************** || Drawable || ***************

*********************************************/

/*
 * The most general category of classes
 * These are the objects that can be drawn
 */

var Drawable = function() {
  this.src;
  this.x;
  this.y;
  this.width;
  this.height;
  this.velX;
  this.velY;
};

Drawable.prototype.render = function() {
  // initialize render function for all drawables
};

Drawable.prototype.update = function() {
  // initialize update function for all drawables
};


/*********************************************

********** || Background Drawable || *********

*********************************************/

/*
 * These are objects drawn in the background
 */
var BackgroundDrawable = function() {
  Drawable.call(this);
};

// define constructor and prototype chain for Background Drawable
BackgroundDrawable.prototype = Object.create(Drawable.prototype);
BackgroundDrawable.prototype.constructor = BackgroundDrawable;

// vertical motion responds to player input
BackgroundDrawable.prototype.panVertical = function(dt) {
  // TODO: slight lag: velY must be at least 1 given acceleration
  // ensures protagonist is not warping
  if (protagonist.velY > 1 && (!protagonist.warping)) {
    // proximity-based parallax
    return (-protagonist.velY * dt * this.proximity);
  }
};

// horizontal motion responds to player input
BackgroundDrawable.prototype.panHorizontal = function(dt) {
  if (!protagonist.warping) {
    this.velX = -protagonist.velX * dt * this.proximity;
    this.x += this.velX;
  }
};


/*********************************************

********** || Foreground Drawable || *********

*********************************************/

/*
 * These objects are drawn in the foreground
 */
var ForegroundDrawable = function() {
  Drawable.call(this);
};

// define constructor and prototype chain for Foreground Drawable
ForegroundDrawable.prototype = Object.create(Drawable.prototype);
ForegroundDrawable.prototype.constructor = ForegroundDrawable;



/*********************************************

**************** || Warpable || **************

*********************************************/

/*
 * These objects can be warped through the wormhole
 */

var Warpable = function() {
  ForegroundDrawable.call(this);
  // state describing object being inside wormhole
  this.enteredWarp = false;
  // state describing whole process of warping
  this.warping = false;
};

// define constructor and prototype chain for Warpable
Warpable.prototype = Object.create(ForegroundDrawable.prototype);
Warpable.prototype.constructor = Warpable;


// checks if object has entered warp
Warpable.prototype.checkWarpEntry = function() {
  // recalculates object position as it changs
  var thisCenterX = this.x + this.halfSide;
  var thisCenterY = this.y + this.halfSide;
  var warpCenterX = warp.x + warp.halfSide;
  var warpCenterY = warp.y + warp.halfSide;
  // calculates distance between object and warp
  var xDist = Math.abs(thisCenterX - warpCenterX);
  var yDist = Math.abs(thisCenterY - warpCenterY);
  // if distance falls below size of warp, object is warping
  if (xDist < warp.halfSide && yDist < warp.halfSide) {
    this.warping = true;
    warp.warpingObjects.push(this);
    this.enteredWarp = true;
    warp.fading = true;
    warp.warping = true;
    warp.waiting = true;
  }
};

// positions object according to the new input position
Warpable.prototype.warp = function(input) {
  this.x = input.x;
  this.y = input.y;
  warp.fading = true;
};








/*
 * ::::::::::::::::::::::::::::::::::::::::::
 * ::: SPECIFIC ENTITY CLASSES Start Here :::
 * ::::::::::::::::::::::::::::::::::::::::::
 */



/*********************************************

******** || BACKGROUND Stars class || ********

*********************************************/

/*
 * Background constructor
 * Creates a tile object for each (x, y) coordinate
 */

var BackgroundStars = function(x, y) {
  BackgroundDrawable.call(this);
  this.src = 'img/stars-background.png';
  this.x = x;
  this.y = y;
  this.width = 512;
  this.height = 256;
  this.drift = 40;
  this.proximity = 35; // higher number => faster parallax effect
}

// define constructor and prototype chain for Background Stars
BackgroundStars.prototype = Object.create(BackgroundDrawable.prototype);
BackgroundStars.prototype.constructor = BackgroundStars;


// Updates background stars tile object
BackgroundStars.prototype.update = function(dt) {
  // wraps around the screen so only limited tiles are reused
  this.wrap();
  // stars drift up if not directly responding to player motion
  var move = this.panVertical(dt) || -this.drift * dt;
  this.y += move; // shifts stars up
  // horizontal panning only based on player motion
  this.panHorizontal(dt);
  // keeps count of how far protagonist has traveled since last reset
  protagonist.traveled -= move;
};


// Renders the background star tile objects
BackgroundStars.prototype.render = function() {
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.width,
                this.height);
};


// wraps stars back in view
BackgroundStars.prototype.wrap = function() {
  if (this.y < -256) {
    this.y = canvasHeight + 256;
  }
  else if (this.y > canvasHeight + 256) {
    this.y = -256;
  }
  if (this.x < -512) {
    this.x = canvasWidth + 512;
  }
  else if (this.x > canvasWidth + 512) {
    this.x = -512;
  }
};



/**********************************************

******** || BACKGROUND Images class || ********

**********************************************/

/*
* Unique paramaters for each background object
*/

var BackgroundObject = function(src, x, width, height, proximity, alpha) {
  BackgroundDrawable.call(this);
  this.src = src;
  // saves defaultX for images that need to be absolute-positioned
  this.defaultX = x;
  // either uses passed in a x value or creates a random spawn
  this.x = this.defaultX ||
           -512 + (Math.random() * (canvasWidth - this.width));
  // starts the object at the bottom of the screen
  this.y = canvasHeight + 512;
  this.width = width;
  this.height = height;
  // sets specified transparency of object
  this.alpha = alpha;
  this.drift = 30;
  this.proximity = proximity;
  // prevents crowding by keeping track of passing objects
  this.passing = false;
}

// define constructor and prototype chain for Background Objects
BackgroundObject.prototype = Object.create(BackgroundDrawable.prototype);
BackgroundObject.prototype.constructor = BackgroundObject;


// Updates background object properties
BackgroundObject.prototype.update = function(dt) {
  // Pans in response to player input (vertical)
  var move = this.panVertical(dt) || -this.drift * dt;
  this.y += move; // combined with stars ==> creates parallax effect
  // if object goes out of sight, reset
  if (this.y < -this.height) {
    // places object back at the bottom of the canvas
    this.y = canvasHeight + 256;
    // not passing anymore
    this.passing = false;
  }
  // horizontal panning only based on player motion
  this.panHorizontal(dt);
};


// Renders background object and sets its transparency
BackgroundObject.prototype.render = function() {
  // saves context
  ctx.save();
  // sets transparency
  ctx.globalAlpha = this.alpha;
  // draws
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.width,
                this.height);
  // restores previous context for rest of canvas
  ctx.restore();
};


// Respawns background object randomly along x axis
// Sets this.passing as true
BackgroundObject.prototype.spawn = function() {
  this.passing = true;
  this.y = canvasHeight;
  this.x = this.defaultX ||
           -512 + (Math.random() * (canvasWidth - this.width));
};


BackgroundObject.prototype.reset = function() {
  this.passing = false;
};



/*********************************************

********** || Protagonist class || ***********

*********************************************/

/*
 * Protagonist constructor
 */
var Protagonist = function() {
  Warpable.call(this);
  // default ship orientation = downwards
  this.src = 'img/protagonist/ship-down.png';
  // explosion spritesheet
  this.explosionSrc = 'img/protagonist/blue-explosion.png';
  // sound to be played when player explodes
  this.explosionSound = 'audio/explosion.wav';
  this.side = 45;
  // only calculates these once and stores for collision detection
  this.halfSide = this.side/2;
  // centers player overhead at the beginning
  this.x = halfCanvasWidth - this.halfSide;
  this.y = 30;
  // player health
  this.health = 100;
  // ship regeneration factor
  this.regenFactor = 0.05;
  // slight residual velocity for in media res effect
  this.velX = 0;
  this.velY = 2;
  // gradual brakes
  this.deceleration = 0.99;
  // maximum allowed speed
  this.maxSpeed = 2;
  // keeps track of how long protagonist has traveled since reset
  this.traveled = 0;
  this.objectReset = 0;
  // if not moving, player drifts up, slower than background
  this.drift = 0.25;
  // state describing whether crashing
  this.crashing = false;
  // state describing crashed
  this.crashed = false;
};

// define constructor and prototype chain for Protagonist
Protagonist.prototype = Object.create(Warpable.prototype);
Protagonist.prototype.constructor = Protagonist;


// Updates the protagonist instance with every animation request
Protagonist.prototype.update = function() {
  // Checks to ensure player is not warping
  if (!this.warping) {
    // health regenerates slowly
    if (this.health < 100) {
      this.health += this.regenFactor;
    }
    // moves according to current velocity
    this.move();
    // default drift upwards
    this.y -= this.drift;
    // keeps player fixed if moving fast ==> better feel
    // and if not warping ==> allows quick access to warp gates
    if (this.velY > this.maxSpeed/2
        && !warp.active
        && this.y > canvasHeight/3 - this.side) {
      this.y -= (this.velY - this.drift);
    }
    // Makes sure player remains visible within bounds
    this.checkBounds();
    // reassigns sprite based on velocity
    this.orientSprite();
    // makes sure only to check warp entry if gate is warpable
    // prevents rewarping on exit
    if (warp.warpable) {
      this.checkWarpEntry();
    }
  }
  if (this.enteredWarp) {
    // warp gate fades out of view immediately
    warp.fade();
    // if warp gate fades away ==> we are past entry
    if (warp.alpha < warp.fadeRate) {
      this.enteredWarp = false;
    }
  }
}


// Orients sprite based on velocity of the player
Protagonist.prototype.orientSprite = function() {
  if (this.velX > 0.75 && this.velY > 0) {
    this.src = 'img/protagonist/ship-down-right.png';
  }
  else if (this.velX < -0.75 && this.velY > 0) {
    this.src = 'img/protagonist/ship-down-left.png';
  }
  else {
    this.src = 'img/protagonist/ship-down.png';
  }
  if (this.velX > 0.5 && this.velY < 0) {
    this.src = 'img/protagonist/ship-up-right.png';
  }
  else if (this.velX < -0.5 && this.velY < 0) {
    this.src = 'img/protagonist/ship-up-left.png';
  }
  else if (Math.abs(this.velY) > Math.abs(this.velX) && this.velY < -2) {
    this.src = 'img/protagonist/ship-up.png';
  }
};

// Renders the image of the protagonist
Protagonist.prototype.render = function() {
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.side,
                this.side);
  this.displayHealth();
  this.displayTravel();
};

/* Mouse movement:
 * moves towards current mousedown location
 * accepts mouse coordinates as input
 */
Protagonist.prototype.moveTowards = function(input) {
  // Player center for distance checking
  var thisCenterX = this.x + this.halfSide;
  var thisCenterY = this.y + this.halfSide;
  // calculates x and y distance between player and mousedown
  var xDist = input.x - thisCenterX;
  var yDist = input.y - thisCenterY;
  // calculates angle between click and player
  var pathAngle = Math.atan2(yDist, xDist);
  if (pathAngle < 0) {
    pathAngle = tau + pathAngle;
  }
  // declares x and y vectors relative to maxSpeed
  this.velX = Math.cos(pathAngle) * this.maxSpeed;
  this.velY = Math.sin(pathAngle) * this.maxSpeed;
};

// Controls overall player motion
Protagonist.prototype.move = function() {
  this.x += this.velX;
  this.y += this.velY;
  this.velX *= this.deceleration;
  this.velY *= this.deceleration;
}

// Ensure player doesn't travel outside visible bounds
Protagonist.prototype.checkBounds = function() {
  if (this.x + this.velX < 0) {
    this.x = 0;
    this.velX = 0;
  }
  else if (this.x + this.velX + this.side > canvasWidth) {
    this.x = canvasWidth - this.side;
    this.velX = 0;
  }
  if (this.y + this.velY < 0) {
    this.y = 0;
    this.velY = 0;
  }
  else if (this.y > canvasHeight - this.side - this.velY) {
    this.y = canvasHeight - this.side;
    this.velY = 0;
  }
};

// resets player where new warp gate is placed
Protagonist.prototype.warp = function(input) {
  this.x = input.x;
  this.y = input.y;
  warp.fading = true;
};

// shows health bar
Protagonist.prototype.displayHealth = function() {
  if (this.health > 45) {
    ctx.fillStyle = 'green';
  }
  else {
    ctx.fillStyle = 'red';
  }
  ctx.fillRect(canvasWidth - 102, 10, this.health, 20);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvasWidth - 102, 10, 100, 20);
};

Protagonist.prototype.displayTravel = function() {
  ctx.font = '12px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(Math.ceil(this.traveled) + ' parsecs traveled', 10, 20);
};


// respawns player if crashed
Protagonist.prototype.respawn = function() {
  this.crashing = false;
  this.crashed = false;
  this.traveled = 0;
  this.health = 100;
  this.x = halfCanvasWidth - this.halfSide;
  this.y = 30;
  this.velX = 0;
  this.velY = 2;
};


/**********************************************

************ || Warp Gate class || ************

**********************************************/

// declares relevant properties of warp gates
var Warp = function() {
  this.side = 80;
  this.halfSide = this.side/2;
  this.src = 'img/warp-gate-2.png';
  this.sound = 'audio/warp.wav';
  this.active = false;
  this.warpingObjects = [];
  this.waiting = false;
  this.warping = false;
  this.warpable = false;
  this.fading = false;
  this.angle = 0;
  this.time = 100;
  this.shrinkRate = 0.25;
  this.fadeRate = 0.025;
  this.alpha = 1;
  this.counter = 0;
  this.maxCount = 500;
};


// renders warp gate image and rotates image
Warp.prototype.render = function() {
  var centerX = this.x + this.side/2;
  var centerY = this.y + this.side/2;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(this.angle);
  ctx.translate(-centerX, -centerY);
  ctx.globalAlpha = this.alpha;
  ctx.drawImage(Resources.get(this.src),
                this.x,
                this.y,
                this.side,
                this.side);
  ctx.restore();
};

// updates warp gate properties
Warp.prototype.update = function(dt) {
  this.rotate();
  this.disintegrate();
  if (this.fading) {
    this.fade();
  }
  if (this.waiting) {
    if (this.counter < this.maxCount) {
      this.counter++;
    }
    else {
      // gets globally defined warp sound
      warpSound.get();
      // creates a random position object
      var randomPos = {'x': Math.random() * canvasWidth, 'y': Math.random() * canvasHeight};
      // resets waiting counter and warp gate properties
      this.counter = 0;
      this.active = true;
      this.alpha = 1;
      this.waiting = false;
      this.warpable = false;
      // if warp gate isn't created in time, the warp gate appears randomly
      this.place(randomPos);
      // also randomly spawns the warping objects
      if (warp.warpingObjects.length) {
        for (var obj = 0; obj < warp.warpingObjects.length; obj++) {
          warpingObject = warp.warpingObjects.pop();
          warpingObject.warping = false;
          warpingObject.warp(randomPos);
        }
      }
    }
  }
};

// disintegrates warp gate after set time
Warp.prototype.disintegrate = function(dt) {
  if (this.time > this.shrinkRate) {
    this.time -= this.shrinkRate;
  }
  else {
    this.fade();
  }
};

// fades warp gate
Warp.prototype.fade = function() {
  if (this.alpha < 0.2) {
    if (this.warpable) {
      this.warpable = false;
    }
  }
  if (this.alpha > this.fadeRate) {
    this.alpha -= this.fadeRate;
  }
  else {
    this.restart();
  }
}

// resets warp gate values
Warp.prototype.restart = function() {
  this.fading = false;
  this.active = false;
  this.time = 100;
  this.alpha = 1;
};

// controls warp gate rotation
Warp.prototype.rotate = function() {
  if (this.angle < tau) {
    this.angle += tau * dt;
  }
  else {
    this.angle = 0;
  }
};

// positions warp gate
Warp.prototype.place = function(input) {
  this.x = input.x - this.side/2;
  this.y = input.y - this.side/2;
}

// resets warp on game reset
Warp.prototype.reset = function() {
  this.active = false;
  this.warping = false;
  this.waiting = false;
  this.warpingObjects = [];
  this.counter = 0;
  this.alpha = 1;
  this.time = 100;
};

/**********************************************

************ || Asteroid class || *************

**********************************************/

// declares basic asteroid properties
var Asteroid = function() {
  Warpable.call(this);
  this.side = 8 + Math.random() * 45;
  this.halfSide = this.side/2;
  this.x = canvasWidth/2 - this.halfSide;
  this.y = canvasHeight;
  this.angle = Math.random() * tau;
  this.srcSet = ['img/asteroid-1.png', 'img/asteroid-2.png'];
  this.srcIndex = Math.round(Math.random());
  this.src = this.srcSet[this.srcIndex];
  this.maxVelX = 5;
  this.maxVelY = -30;
  this.velX = -this.maxVelX + Math.random() * this.maxVelX * 2;
  this.velY = Math.random() * this.maxVelY;
  this.acceleration = 1.008;
  this.rotationDirection = Math.round(Math.random()) * 2 - 1;
  this.rotationRate = Math.random() * 0.25;
}

// define constructor and prototype chain for Asteroids
Asteroid.prototype = Object.create(Warpable.prototype);
Asteroid.prototype.constructor = Asteroid;

// updates asteroid properties
Asteroid.prototype.update = function(dt) {
  this.rotate();
  if (!this.warping) {
    // moves according to randomly generated velocity
    this.move(dt);
    // resets if asteroid moves out of bounds
    if (!this.crashing) {
      this.checkBounds();
    }
    // checks if asteroid has crashed into player
    if (!protagonist.warping) {
      this.checkCrash();
    }
    // makes sure only to check warp entry if gate is warpable
    // prevents rewarping on exit
    if (warp.warpable) {
      this.checkWarpEntry();
    }
  }
  else {
    /* play sound when inside wormhole
    warpingSound.volume = 0.5;
    warpingSound.play();
    */
  }
  if (this.enteredWarp) {
    // warp gate fades out of view immediately
    warp.fade();
    // if warp gate fades away ==> we are past entry
    if (warp.alpha < warp.fadeRate) {
      this.enteredWarp = false;
    }
  }
};

Asteroid.prototype.checkCrash = function() {
  // recalculates center as asteroid and player positions change
  var thisCenterX = this.x + this.halfSide;
  var thisCenterY = this.y + this.halfSide;
  var protagonistCenterX = protagonist.x + protagonist.halfSide;
  var protagonistCenterY = protagonist.y + protagonist.halfSide;
  var xDist = Math.abs(thisCenterX - protagonistCenterX);
  var yDist = Math.abs(thisCenterY - protagonistCenterY);
  if (xDist < protagonist.halfSide && yDist < protagonist.halfSide) {
    this.crashing = true;
    protagonist.crashing = true;
    if (protagonist.health > 0) {
      explosion.get();
    }
  }
};


// controls asteroid crash animation
Asteroid.prototype.animateCrash = function(x, y) {
  // draws frames from crash spritesheet
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
  // increments crash frame index to show next frame
  if (crashFrameIndex < crashFrames.length - 1) {
    crashFrameIndex++;
  }
  // if index is maxed out, the animation is complete
  else {
    crashFrameIndex = 0;
    this.crashing = false;
    protagonist.health -= this.side;
    // if protagonist has not been obliterated, respawn
    if (protagonist.health > 0) {
      this.respawn();
    }
    // restart game
    else {
      protagonist.crashed = true;
    }
  }
};

// renders rotating asteroid image or crashing animation
Asteroid.prototype.render = function() {
  if (!this.crashing) {
    var centerX = this.x + this.halfSide;
    var centerY = this.y + this.halfSide;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.angle);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(Resources.get(this.src),
                  this.x,
                  this.y,
                  this.side,
                  this.side);
    ctx.restore();
  }
  else {
    this.animateCrash(this.x, this.y);
  }
};

// controls asteroid motion
Asteroid.prototype.move = function(dt) {
  this.y += this.velY * dt;
  this.velY *= this.acceleration;
};


// rotates asteroid
Asteroid.prototype.rotate = function() {
  if (this.angle < tau) {
    // random spin and rate of rotation
    this.angle += tau * dt * this.rotationRate * this.rotationDirection;
  }
  else {
    this.angle = 0;
  }
};

// checks when asteroid travels out visible bounds
Asteroid.prototype.checkBounds = function() {
  if (this.x + this.side < 0
    || this.x > canvasWidth
    || this.y + this.side < 0
    || this.y > canvasHeight) {
    this.respawn();
  }
};


// for when asteroid reaches out of bounds and must be reset
Asteroid.prototype.respawn = function() {
  this.x = this.halfSide + Math.random() * canvasWidth - this.side;
  this.y = canvasHeight;
  this.velY = Math.random() * this.maxVelY;
};


/*****
  Instantiate all classes
*****/

protagonist = new Protagonist();

warp = new Warp();

// For background star tile objects
var starQuadrants = [];
var quadrantsIndex = 0;

for (var w = -512; w < canvasWidth + 512; w += 512) {
  for (var h = -256; h < canvasHeight + 256; h += 256) {
    starQuadrants[quadrantsIndex] = new BackgroundStars(w, h);
    quadrantsIndex++;
  }
}


// For background image objects
allBackgroundObjects = [];
var objectsIndex = 0;

// creates background images in advance
allBackgroundImages.forEach(function(bgObj) {
  allBackgroundObjects[objectsIndex] =
    new BackgroundObject(bgObj.src,
                        bgObj.x,
                        bgObj.width,
                        bgObj.height,
                        bgObj.proximity,
                        bgObj.alpha);
  objectsIndex++;
});


// For asteroid objects
var allAsteroids = [];
allAsteroids[0] = new Asteroid();