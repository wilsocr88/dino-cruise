var running = true;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 200;
var loaded = false;

var music = new Audio("fx/music.wav");
music.addEventListener( "ended", function() {
	music.currentTime = 0;
	music.play();
}, false );

/** SOUNDS **/
var owLoaded = false;
var pewLoaded = false;
var popLoaded = false;
var ow = new Audio("fx/ow.wav");
var pew = new Audio("fx/pew.wav");
var pop = new Audio("fx/pop.wav");
ow.onload = function() {
	owLoaded = true;
}
pew.onload = function() {
	pewLoaded = true;
}
pop.onload = function() {
	popLoaded = true;
}

/** IMAGES **/
// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "img/bg.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "img/dino.png";

// Pop image
var popImage = new Image();
popImage.src = "img/pop.png";

/** GAME OBJECTS **/
// Hero object
var hero = {
	speed: 256, // movement in pixels per second
	x: 0,
	y: 0,
	dir: 0, // 0 is left, 1 is right
	w: 153,
	h: 100
};

// Cat object
var cat = {
	speed: 128,
	x: 0,
	y: 110,
	dir: 0, // 0 is coming from left, 1 is coming from right
	w: 35,
	h: 60
};

/** GET KEYS **/
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var score = 0;
try {
	if ( localStorage['highScore'] === undefined ) {
		localStorage['highScore'] = score;
	}
} catch( error ) {
	document.getElementById("content").innerHTML = "<h1>Your browser won't work here.</h1><p>Your browser won't let JavaScript use localStorage for some reason, so the game won't work.</p>";
	throw new Error("Can't access localStorage.");
}
document.getElementById("highScore").innerHTML = localStorage['highScore'];
// Reset the game when the player catches a monster
function reset() {
	hero.x = canvas.width / 3;
	hero.y = ( canvas.height / 3 ) + 8;
	cats = [];
	score = 0;
}

function die() {
	running = false;
	music.pause();
	music.currentTime = 0;
}

// Update game objects
var spaceLifted;
var shot;
var laserCounter;
var enemyCounter = 0;
var maxEnemyCounter = 150;
var cats = [];
var splodey = {};
var splode = false;
function update( modifier ) {
	music.play();
	if ( 
	  owLoaded && 
	  pewLoaded && 
	  popLoaded && 
	  heroReady &&
	  bgReady
	) {
		loaded = true;
	}

	if ( score > localStorage['highScore'] ) {
		localStorage['highScore'] = score;
		document.getElementById("highScore").innerHTML = localStorage['highScore'];
	}
	/** CONTROLS **/
	if (37 in keysDown) { // Player holding left
		hero.dir = 0;
		heroImage.src = "img/dino.png";
		hero.x -= hero.speed * modifier;
		if ( hero.x <= -9 ) {
			hero.x = -9;
		}
	}
	if (39 in keysDown) { // Player holding right
		hero.dir = 1;
		heroImage.src = "img/dino1.png";
		hero.x += hero.speed * modifier;
		if ( hero.x >= 456 ) {
			hero.x = 456;
		}
	}
	
	// Spawn an enemy on a random side of the screen every 150 frames
	enemyCounter++;
	if ( enemyCounter > maxEnemyCounter ) {
		// New enemy in the array of cats 
		var index = cats.length;
		cats[index] = cat;
		
		// Which side is the enemy starting on? Coin flip 
		cats[index].dir = Math.round( Math.random() );
		
		// Grab image 
		cats[index].img = catImage( cats[index].dir );
		
		// Starting x position
		if ( cats[index].dir === 0 ) {
			cats[index].x = 0 - cats[index].w;
		} else if (cats[index].dir === 1) {
			cats[index].x = canvas.width;
		}
		
		enemyCounter = 0;
		maxEnemyCounter++;
	}
	
	// Move cats 
	for ( var i = 0; i < cats.length; i++ ) {
		if ( cats[i].dir === 1 ) {
			// Moving left
			cats[i].x -= cats[i].speed * modifier; 
			if ( cats[i].x < ( hero.x + ( hero.w - 10 ) ) ) {
				die();
			}
		} else if ( cats[i].dir === 0 ) {
			// Moving right 
			cats[i].x += cats[i].speed * modifier;
			if ( ( cats[i].x + cats[i].w ) > hero.x + 12 ) {
				die();
			}
		} 
		cats[i].speed++;
	}
	
	
	if (32 in keysDown) { // Player holding spacebar
		if ( spaceLifted && !shot ) {
			// SHOOT
			spaceLifted = false;
			shot = true;
			pew.pause();
			pew.currentTime = 0;
			pew.play();
		}
		laserCounter++;
		if ( laserCounter >= 7 ) {
			shot = false;
		}
	} else {
		spaceLifted = true;
		shot = false;
		laserCounter = 0;
	}
	
	if ( shot ) {
		for ( var i = 0; i < cats.length; i++ ) {
			if ( cats[i].dir === hero.dir ) {
				pop.play();
				splode = true;
				splodey.x = cats[i].x;
				splodey.y = cats[i].y;
				splodey.counter = 0;
				cats.splice(i);
				score++;
			}
		}
	}
}

function catImage( image ) {
	var imgSrc;
	if ( image === 0 ) {
		imgSrc = "cat";
	} else if ( image === 1 ) {
		imgSrc = "cat1";
	}
	var I = new Image();
	I.ready = false;
	I.onload = function() {
		I.ready = true;
	}
	I.src = "img/" + imgSrc + ".png";
	return I;
}

// Draw everything
function render() {
	if ( bgReady ) {
		ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
	}

	if ( heroReady ) {
		ctx.drawImage( heroImage, hero.x, hero.y, hero.w, hero.h );
	}
	
	for( var i = 0; i < cats.length; i++ ) {
		cat
		ctx.drawImage( cats[i].img, cats[i].x, cats[i].y, cats[i].w, cats[i].h );
	}
	
	if ( shot ) {
		ctx.beginPath();
		if ( hero.dir === 0 ) {
			ctx.moveTo( hero.x + 25, ( hero.y + ( hero.h / 2 ) ) + 10 );
			ctx.lineTo( 0, ( hero.y + ( hero.h / 2 ) ) + 10 );
		} else if ( hero.dir === 1 ) {
			ctx.moveTo( ( hero.x + hero.w ) - 25, ( hero.y + ( hero.h / 2 ) ) + 10 );
			ctx.lineTo( canvas.width, ( hero.y + ( hero.h / 2 ) ) + 10 );
		}
		ctx.lineWidth = 4;
		ctx.strokeStyle = "#0f0";
		ctx.stroke();
	}

	ctx.fillStyle = "#000";
	ctx.font = "14pt Courier New";
	ctx.fillText( score, canvas.width - 50, canvas.height - 32 );

	if ( splode ) {
		ctx.fillStyle = "red";
		ctx.drawImage( popImage, splodey.x, splodey.y, 50, 50 );
		splodey.counter++;
		if ( splodey.counter > 10 ) {
			splode = false;
			splodey = {};
		}
	}

}

// The main game loop
//var debugCounter = 0;
function main() {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;

	if ( 
	  owLoaded && 
	  pewLoaded && 
	  popLoaded && 
	  heroReady &&
	  bgReady
	) {
		loaded = true;
	}

	if ( running ) {
		requestAnimationFrame(main);
	} else {
		ow.play();
		ctx.fillStyle = "#000";
		ctx.globalAlpha = 1.0;
		ctx.fillRect( 0, 0, canvas.width, canvas.height );
		ctx.fillStyle = "#fff";
		ctx.fillText( "GAME OVER", canvas.width / 2.5, canvas.height / 2);
		ctx.fillText( "Score: " + score, ( canvas.width / 2.5 ), ( canvas.height / 2 ) + 16 );
		ctx.fillText( "[restart]", canvas.width/ 2.5, ( canvas.height / 4 ) * 3 );
		canvas.onclick = function () { 
			window.location.reload(); 
		}
	}
	//console.log( debugCounter );
	//debugCounter++;
}

var then = Date.now();
reset();
main();