/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        gameState = 'Playing',
        spaceAmbience = new Audio('audio/space-ambience.wav'),
        spaceBass = new Audio('audio/space-bass.wav'),
        wormhole = new Audio('audio/wormhole.wav'),
        obliteration = new Audio('audio/obliteration.wav'),
        warpSound = new Resources.SoundCache(3),
        explosion = new Resources.SoundCache(1),
        lastTime;

    // initialize sounds
    warpSound.init('warpSound');
    explosion.init('explosion');
    spaceAmbience.volume = 0.6;
    spaceAmbience.loop = true;
    spaceAmbience.load();
    spaceBass.volume = 0.7;
    spaceBass.loop = true;
    spaceBass.load();
    wormhole.loop = true;
    wormhole.load();
    obliteration.volume = 0.5;
    obliteration.load();

    // append canvas to document
    doc.body.appendChild(canvas);
    canvas.width = 800;
    canvas.height = 600;


    /*****
    ***** This code handles mouse tracking, player movement and warp placing.
    *****/

    // Declare variable to store object containing mouse coordinates
    var mousePos = null;

    // Returns object with mouse (x, y) values relative to the canvas
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    // Assigns new returned mouse position object to variable mousePos
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    });

    // Declare interval variable for determining how long mousedown happens
    var clickInterval = null;

    // Listens for mousedown and sets interval to duration of click
    canvas.addEventListener('mousedown', function(e) {
        clickInterval = setInterval(function(){
            /* Calls player movement function to each new mousePos
            * for fluid movement. Improves game feel.
            */
            protagonist.moveTowards(mousePos);
        }, 100);
    });

    // Mouseup clears interval and sets it back to null for next use
    doc.addEventListener('mouseup', function(e) {
        if (clickInterval) {
            clearInterval(clickInterval);
            clickInterval = null;
        }
    });

    // Listens for double click to place warp gate
    canvas.addEventListener('dblclick', function(e) {
        if (!warp.warpingObjects.length) {
            warp.warpable = true;
            warp.maxCount -= 5;
        }
        var warpingObject;
        warp.counter = 0;
        warp.active = true;
        warp.waiting = false;
        warp.place(mousePos);
        warp.alpha = 1;
        warpSound.get();
        if (warp.warping) {
            var warpingLength = warp.warpingObjects.length;
            for (var obj = 0; obj < warpingLength; obj++) {
                warpingObject = warp.warpingObjects.pop();
                warpingObject.warping = false;
                warpingObject.warp(mousePos);
            }
            warp.warping = false;
            warp.warpingObject = null;
        }
    });


    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        console.log(protagonist.traveled);
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        global.counter++;
        global.now = now;
        global.dt = dt;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update(dt);
        render();
        spaceAmbience.play();
        spaceBass.play();

        if (protagonist.warping) {
            spaceAmbience.pause();
            wormhole.play();
        }
        else {
            wormhole.pause();
        }

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        if (protagonist.crashed) {
            reset();
        }

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {

        lastTime = Date.now();

        global.counter = 0;

        // checks readiness of audio
        this.checkAudio = window.setInterval(function() {
            checkReadyState()}, 1000);

        function checkReadyState() {
            if (spaceAmbience.readyState === 4 && spaceBass.readyState === 4 && wormhole.readyState === 4) {
                clearInterval(checkAudio);
                main();
            }
        }
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        spawnAsteroid();
        updateBackgroundObjects(dt);
        updateForegroundObjects(dt);
    }

    var backgroundObject = null;

    function updateBackgroundObjects(dt) {
        starQuadrants.forEach(function(quadrant){
            quadrant.update(dt);
        });

        bgObjectPassing = allBackgroundObjects.some(checkBackgroundObject);
        if (protagonist.traveled % 1000 === 0 && !bgObjectPassing) {
            var objectIndex = Math.floor(Math.random() * allBackgroundObjects.length);
            backgroundObject = allBackgroundObjects[objectIndex];
            backgroundObject.spawn();
        }
        if (backgroundObject) {
            backgroundObject.update(dt);
        }
    }

    function checkBackgroundObject(element, index, array) {
        return (element.passing);
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateForegroundObjects(dt) {
        protagonist.update();
        allAsteroids.forEach(function(eachAsteroid) {
            eachAsteroid.update(dt);
        });
        warp.update();
    }

    function spawnAsteroid() {
        if (global.counter % 500 === 0) {
            allAsteroids[allAsteroids.length + 1] = new Asteroid();
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        renderBackgroundObjects();
        renderForegroundObjects();
    }

    function renderBackgroundObjects() {
        starQuadrants.forEach(function(quadrant){
            quadrant.render();
        });
        allBackgroundObjects.forEach(function(bgObj) {
            if (bgObj.passing) {
                bgObj.render();
            }
        });
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderForegroundObjects() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        if (warp.active) {
            warp.render();
        }
        if (!protagonist.warping && protagonist.health > 0) {
            protagonist.render();
        }
        allAsteroids.forEach(function(eachAsteroid) {
            if (!eachAsteroid.warping) {
                eachAsteroid.render();
            }
        });

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        obliteration.currentTime = 0;
        obliteration.play();
        allObjectsReset();
    }

    // collected reset functionality of all entities
    function allObjectsReset() {
        allAsteroids = [];
        allAsteroids[0] = new Asteroid();
        protagonist.respawn();
        warp.reset();
        if (backgroundObject) {
            backgroundObject.reset();
        }
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load('img/stars-background.png');

    Resources.load(['img/asteroid-1.png', 'img/asteroid-2.png']);
    Resources.load('img/protagonist/blue-explosion.png');

    Resources.load('img/warp-gate-2.png')

    Resources.load(['img/protagonist/ship-down.png',
                    'img/protagonist/ship-up.png',
                    'img/protagonist/ship-up-left.png',
                    'img/protagonist/ship-up-right.png',
                    'img/protagonist/ship-down-left.png',
                    'img/protagonist/ship-down-right.png']);

    Resources.load(['img/hurricane-nebula.png',
                  'img/filings-nebula.png',
                  'img/brown-nebula.png',
                  'img/red-black-nebula.png',
                  'img/planet1.png',
                  'img/planet2.png',
                  'img/mottled-sun.png',
                  'img/galactic.png',
                  'img/space-cluster.png',
                  'img/gibbous-planet.png',
                  'img/star-crescent-planet.png',
                  'img/asteroid-field-1.png'])

    /*
    Now load all the sounds that will be used for the game.

    Resources.loadAudio(['audio/warp.wav',
                        'audio/wormhole.wav',
                        'audio/space-ambience.wav',
                        'audio/space-bass.wav']);
    */

    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.warpSound = warpSound;
    global.explosion = explosion;
})(this);

