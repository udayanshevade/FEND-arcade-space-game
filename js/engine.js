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
        fps = 60,
        interval = 1000/fps,
        gameState = 'Playing',
        lastTime;


    doc.body.appendChild(canvas);

    canvas.width = 800;
    canvas.height = 600;


    function checkBounds(thing) {
        if (thing.x > -thing.size && thing.x < canvasWidth + thing.size
            && thing.y > -thing.size && thing.y < canvasHeight + thing.size) {
            return true;
        }
    }


    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);

        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime);

        global.now = now;
        global.dt = dt;

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        if (dt > interval) {
            lastTime = now - (dt % interval);
        }

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update();
        render();
        playSounds();


    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
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
    function update() {
        updateLayers();
        updateEntities();
    }

    function updateLayers() {
        starQuadrants.forEach(function(quadrant){
            quadrant.update();
        });
        home.update();
        station.update();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities() {
        protagonist.update();
        tractor.update();
        allAsteroids.forEach(function(eachAsteroid) {
            eachAsteroid.update();
        });
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        renderLayers();
        renderEntities();
    }

    function renderLayers() {
        starQuadrants.forEach(function(quadrant){
            quadrant.render();
        });
        if (checkBounds(home)) {
            home.render();
        }
        if (checkBounds(station)) {
            station.render();
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        protagonist.render();
        tractor.render();
        allAsteroids.forEach(function(eachAsteroid) {
            eachAsteroid.render();
        });
    }

    function playSounds() {
        var stars = starQuadrants[0];
        Resources.get(stars.soundOne).play();
        Resources.get(stars.soundTwo).play();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load('img/stars-background.png');
    Resources.load('img/planet2.png');
    Resources.load('img/station.png');

    Resources.load('img/asteroid-1.png');
    Resources.load('img/protagonist/blue-explosion.png');

    Resources.load(['img/warp-cursor.png',
                    'img/protagonist/tractor-free.png',
                    'img/protagonist/tractor-locked.png']);

    Resources.load(['img/protagonist/ship.png']);


    /*
    Now load all the sounds that will be used for the game.
    */

    Resources.loadAudio(['audio/space-ambience.wav',
                        'audio/space-bass.wav']);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);

