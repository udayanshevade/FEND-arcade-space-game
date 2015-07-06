var pi = Math.PI;
var tau = pi * 2;
var canvasWidth = 800;
var canvasHeight = 600;

// List of background object images to inherit unique properties
var allBackgroundImages = [
            {
              'name' : 'hurricane-nebula',
              'src': 'img/hurricane-nebula.png',
              'x' : null,
              'width' : 1024,
              'height' : 768,
              'proximity' : 60,
              'alpha' : 0.6,
              'messages' : ['']
            },
            {
              'name' : 'filings-nebula',
              'src': 'img/filings-nebula.png',
              'x' : null,
              'width' : 894,
              'height' : 894,
              'proximity' : 70,
              'alpha' : 0.7,
              'messages' : ['']
            },
            {
              'name' : 'brown-nebula',
              'src': 'img/brown-nebula.png',
              'x' : -800,
              'width' : 2560,
              'height' : 1600,
              'proximity' : 70,
              'alpha' : 0.7,
              'messages' : ['']
            },
            {
              'name' : 'red-black-nebula',
              'src': 'img/red-black-nebula.png',
              'x' : -800,
              'width' : 2560,
              'height' : 1600,
              'proximity' : 70,
              'alpha' : 0.8,
              'messages' : ['']
            },
            {
              'name' : 'planet-one',
              'src' : 'img/planet1.png',
              'x' : null,
              'width' : 300,
              'height' : 300,
              'proximity' : 80,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'planet-two',
              'src' : 'img/planet2.png',
              'x' : null,
              'width' : 500,
              'height' : 500,
              'proximity' : 95,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'mottled-sun',
              'src' : 'img/mottled-sun.png',
              'x' : null,
              'width' : 600,
              'height' : 600,
              'proximity' : 70,
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
              'proximity' : 60,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'star-crescent-planet',
              'src' : 'img/star-crescent-planet.png',
              'x' : null,
              'width' : 800,
              'height' : 480,
              'proximity' : 70,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'gibbous-planet',
              'src' : 'img/gibbous-planet.png',
              'x' : null,
              'width' : 700,
              'height' : 650,
              'proximity' : 90,
              'alpha' : 1,
              'messages' : ['']
            },
            {
              'name' : 'asteroid-field',
              'src' : 'img/asteroid-field-1.png',
              'x' : null,
              'width' : 1200,
              'height' : 1000,
              'proximity' : 90,
              'alpha' : 1,
              'messages' : ['Don\'t have to worry about those thankfully.',
                          'Asteroids in the rearview mirror' +
                          'may appear closer than they are.',
                          'I hate asteroids. Drunk drivers of the universe.',
                          'Wouldn\'t want to get too close' +
                          'to one of those...']
            }
          ];

// Used to detect keydown
var keys = [];



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
  this.drift = 40;
  this.proximity = 50; // higher number => faster parallax effect
}

// Updates background stars tile object
BackgroundStars.prototype.update = function(dt) {

  // wraps around the screen so only limited tiles are reused
  this.wrap();

  // tiles drift up if not directly responding to player input (vertical)
  var move = this.panVertical(dt) || -this.drift * dt;
  this.y += move; // shifts stars up

  // responds to player input (horizontal)
  this.panHorizontal(dt);

  // keeps count of how far protagonist has traveled since last reset
  protagonist.traveled -= Math.ceil(move);

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
BackgroundStars.prototype.panVertical = function(dt) {

  // slight lag: velY must be at least 1
  // ensures protagonist is not warping
  if (protagonist.velY > 1 && (!protagonist.warping)) {

    // proximity based parallax
    return (-protagonist.velY * dt * this.proximity);
  }
};


// Responds to player input (horizontal)
BackgroundStars.prototype.panHorizontal = function(dt) {
  if (!protagonist.warping) {
    this.velX = -protagonist.velX * dt * this.proximity;
    this.x += this.velX;
  }
};

BackgroundStars.prototype.wrap = function() {
  if (this.y < -256) {
    this.y = canvasHeight + 256;
  }
  if (this.y > canvasHeight + 256) {
    this.y = -256;
  }
};



/**********************************************

******** || Background Object class || ********

**********************************************/

/*
* Unique paramaters for each background object
*/
var BackgroundObject = function(src, x, width, height, proximity, alpha) {
  this.src = src;
  // saves defaultX for objects that need to be absolute positioned
  this.defaultX = x;
  // either uses passed in a x value or creates a random spawn
  this.x = this.defaultX ||
           -512 + (Math.random() * (canvasWidth - this.width));
  // starts the object at the bottom of the screen
  this.y = canvasHeight + 512;
  this.velY;
  this.velX;
  this.width = width;
  this.height = height;
  // sets specified transparency of object
  this.alpha = alpha;
  this.drift = 30;
  this.proximity = proximity;
  // prevents crowding by keeping track of passing objects
  this.passing = false;
}


// Updates background object properties
BackgroundObject.prototype.update = function(dt) {
  // Pans in response to player input (vertical)
  var move = this.panVertical(dt) || -this.drift * dt;
  this.y += move; // combined with stars ==> creates parallax effect
  // if object goes out of sight, reset
  if (this.y < -this.height) {
    // places object back at the bottom of the canvas
    this.y = canvasHeight + 256;
    // resets protagonist traveled count
    protagonist.traveled = 0;
    // keeps track of overall game progress
    protagonist.objectReset++;
    // not passing anymore
    this.passing = false;
  }
  this.panHorizontal(dt);
};


// Responds to player input (vertical) ~ redundant ==> to be optimized
BackgroundObject.prototype.panVertical = function(dt) {
  if (protagonist.velY > 1 && (!protagonist.warping)) {
    return (-protagonist.velY * dt * this.proximity);
  }
};


// Responds to player input (horizontal) ~ also redundant
BackgroundObject.prototype.panHorizontal = function(dt) {
  if (!protagonist.warping) {
    this.velX = -protagonist.velX * dt * this.proximity;
    this.x += this.velX;
  }
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



/*********************************************

********** || Protagonist class || ***********

*********************************************/

// Protagonist constructor
var Protagonist = function() {
  // default ship orientation = downwards
  this.sprite = 'img/protagonist/ship-down.png';
  // sound to be played when player ejects from wormhole
  this.warpSound = 'audio/wormhole.wav';
  this.width = 72;
  this.height = 63;
  // centers player overhead at the beginning
  this.x = canvasWidth/2 - this.width/2;
  this.y = 30;
  // slight residual velocity for in media res effect
  this.velX = 0;
  this.velY = 2;
  // gradual brakes
  this.deceleration = 0.99;
  // maximum allowed speed
  this.maxSpeed = 3;
  // keeps track of how long protagonist has traveled since reset
  this.traveled = 0;
  this.objectReset = 0;
  // if not moving, player drifts up, slower than background
  this.drift = 0.25;
  // state describing player being inside wormhole
  this.enteredWarp = false;
  // state describing whole process of warping
  this.warping = false;
};

// Updates the protagonist instance with every animation request
Protagonist.prototype.update = function() {
  // Store sound of entering wormhole
  var warpingSound = Resources.get('audio/wormhole.wav');
  // Checks to ensure player is not warping
  if (!this.warping) {
    warpingSound.pause();
    // handles key input (optional ~ possible relic)
    this.handleInput();
    // moves according to keys pressed
    this.move();
    // default drift upwards
    this.y -= this.drift;
    // keeps player fixed if moving fast ==> better feel
    // and if not warping ==> allows quick access to warp gates
    if (this.velY > 0.5
        && !warp.active
        && this.y > canvasHeight/3 - this.height) {
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
  else {
    // play sound when inside wormhole
    warpingSound.volume = 0.5;
    warpingSound.play();
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
    this.sprite = 'img/protagonist/ship-down-right.png';
  }
  else if (this.velX < -0.75 && this.velY > 0) {
    this.sprite = 'img/protagonist/ship-down-left.png';
  }
  else {
    this.sprite = 'img/protagonist/ship-down.png';
  }
  if (this.velX > 0.5 && this.velY < 0) {
    this.sprite = 'img/protagonist/ship-up-right.png';
  }
  else if (this.velX < -0.5 && this.velY < 0) {
    this.sprite = 'img/protagonist/ship-up-left.png';
  }
  else if (Math.abs(this.velY) > Math.abs(this.velX) && this.velY < -2) {
    this.sprite = 'img/protagonist/ship-up.png';
  }
};


// Renders the image of the protagonist
Protagonist.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite),
                this.x,
                this.y,
                this.width,
                this.height);
};

// If player chooses to use keyboard to move .... potential relic
Protagonist.prototype.handleInput = function() {
    if (keys[65]) {
      if (this.velX > -this.maxSpeed) {
        this.velX--;
      }
    }
    if (keys[68]) {
      if (this.velX < +this.maxSpeed) {
        this.velX++;
      }
    }
    if (keys[87]) {
      if (this.velY > -this.maxSpeed) {
        this.velY--;
      }
    }
    if (keys[83]) {
      if (this.velY < +this.maxSpeed) {
        this.velY++;
      }
    }
};


// Mouse movement
// moves towards current mousedown location
// accepts mouse coordinates as input
Protagonist.prototype.moveTowards = function(input) {
  // Player center for distance checking
  var thisCenterX = this.x + this.width/2;
  var thisCenterY = this.y + this.height/2;

  // calculates x and y distance between player and mousedown
  var xDist = input.x - thisCenterX;
  var yDist = input.y - thisCenterY;

  // calculates angle
  var pathAngle = Math.atan2(yDist, xDist);
  if (pathAngle < 0) {
    pathAngle = tau + pathAngle;
  }

  // declares x and y vectors relative to maxSpeed
  if (Math.abs(xDist) > 50) {
    this.velX = Math.cos(pathAngle) * this.maxSpeed;
  }
  if (Math.abs(yDist) > 50) {
    this.velY = Math.sin(pathAngle) * this.maxSpeed;
  }
};


// Controls player motion through keys ...... potential relic
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
  else if (this.x + this.velX + this.width > canvasWidth) {
    this.x = canvasWidth - this.width;
    this.velX = 0;
  }
  if (this.y + this.velY < 0) {
    this.y = 0;
    this.velY = 0;
  }
  else if (this.y > canvasHeight - this.height - this.velY) {
    this.y = canvasHeight - this.height;
    this.velY = 0;
  }
};


// checks if player is inside warp gate
Protagonist.prototype.checkWarpEntry = function() {
  var halfWarpSide = warp.side/2;
  // recalculates center as player position changes
  var thisCenterX = this.x + this.width/2;
  var thisCenterY = this.y + this.height/2;
  var warpCenterX = warp.x + halfWarpSide;
  var warpCenterY = warp.y + halfWarpSide;
  var xDist = Math.abs(thisCenterX - warpCenterX);
  var yDist = Math.abs(thisCenterY - warpCenterY);
  if (xDist < halfWarpSide && yDist < halfWarpSide) {
    this.warping = true;
    this.enteredWarp = true;
  }
}

Protagonist.prototype.warp = function(input) {
  this.x = input.x;
  this.y = input.y;
  Resources.get(warp.sound).play();
  warp.fading = true;
};


// Warp gate class
var Warp = function() {
  this.x = 0;
  this.y = 0;
  this.side = 80;
  this.src = 'img/warp-gate-2.png';
  this.sound = 'audio/warp.wav';
  this.active = false;
  this.warpable = false;
  this.fading = false;
  this.angle = 0;
  this.time = 100;
  this.shrinkRate = 0.25;
  this.fadeRate = this.shrinkRate/10;
  this.alpha = 1;
};

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

Warp.prototype.update = function(dt) {
  this.rotate();
  this.disintegrate();
  if (this.fading) {
    this.fade();
  }
};

Warp.prototype.disintegrate = function(dt) {
  if (this.time > this.shrinkRate) {
    this.time -= this.shrinkRate;
  }
  else {
    this.fade();
  }
};

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
    this.reset();
  }
}

Warp.prototype.reset = function() {
  this.fading = false;
  this.active = false;
  this.time = 100;
  this.alpha = 1;
};

Warp.prototype.rotate = function() {
  if (this.angle < tau) {
    this.angle += tau * dt;
  }
  else {
    this.angle = 0;
  }
};

Warp.prototype.place = function(input) {
  this.x = input.x - this.side/2;
  this.y = input.y - this.side/2;
}





/*****
  Instantiate all classes
*****/

protagonist = new Protagonist();

warp = new Warp();

starQuadrants = [];

var quadrantsIndex = 0;

for (var w = -512; w < canvasWidth + 512; w += 512) {
  for (var h = -256; h < canvasHeight + 256; h += 256) {
    starQuadrants[quadrantsIndex] = new BackgroundStars(w, h);
    quadrantsIndex++;
  }
}

allBackgroundObjects = [];

var objectsIndex = 0;

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


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function (e) {
  keys[e.keyCode] = true;
});

document.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false;
});