var CANVAS_WIDTH=1440;
var CANVAS_HEIGHT=2560;
var FPS = 60;
var UPDATES_PER_FRAME=50;
var GRAVITY = -1.4;
var BALL_RADIUS = 25;
var WALL_THICKNESS = 3;

var ballArr = [];
var wallArr = [];

// Ball object
function Ball(x,y,vx,vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = BALL_RADIUS;
}

// Line object
// a, b and c correspond to coefficients ax+by+c=0.
function Wall(a,b,c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.thickness = WALL_THICKNESS;
    // Perpendicular distance from co-ord x,y.
    this.distance = function(x,y) {
        return Math.abs(this.a*x + this.b*y + this.c)/Math.sqrt(this.a*this.a + this.b*this.b);
    }
}

function distanceFormula (x1,y1,x2,y2) {
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

//Set up walls and balls
function setup() {
    wallArr.push(new Wall(-3,10,-21000));
    wallArr.push(new Wall(1,10,-1500));
    wallArr.push(new Wall(1,0,-1400));
    wallArr.push(new Wall(1,0,-40));
}

var canvas = document.getElementById("energydemocanvas");
var ctx = canvas.getContext("2d");
canvas.style.backgroundColor="#37474f";

setup();

setInterval(function () {
    for (i=0; i<=UPDATES_PER_FRAME; i++) {
        doPhysics();
    }
    if (timerActive) timer++;
    draw();
}, 1000/FPS);

function doPhysics() {

    // TODO Idea: use numerator of perp dist formula without abs for either side of wall.
    for (var j=0; j<ballArr.length; j++) {
        var ball = ballArr[j];

        ball.x += ball.vx/UPDATES_PER_FRAME;
        ball.y += ball.vy/UPDATES_PER_FRAME;
        ball.vy -= GRAVITY/UPDATES_PER_FRAME;

        for (var i=0; i<wallArr.length; i++) {
            var wall=wallArr[i];
            var willBounce = (wall.distance(ball.x, ball.y) <= wall.thickness + ball.radius) ||
                ((wall.a*ball.x + wall.b*ball.y + wall.c)*(wall.a*(ball.x+(ball.vx/UPDATES_PER_FRAME)) + wall.b*(ball.y + (ball.vy/UPDATES_PER_FRAME)) + wall.c) < 0);
            
            if (willBounce) {
                var angleWall = Math.atan(-wall.a/wall.b);
                
                //Rotate coord systems
                var ux = ball.vx*Math.cos(angleWall) + ball.vy*Math.sin(angleWall);
                var uy = -ball.vx*Math.sin(angleWall) + ball.vy*Math.cos(angleWall);

                //Collision
                var wx = ux;
                var wy = -uy;

                //Rotate back                
                ball.vx = wx*Math.cos(angleWall) - wy*Math.sin(angleWall);
                ball.vy = wx*Math.sin(angleWall) + wy*Math.cos(angleWall);
            }
        }


        for (var i=j+1; i<ballArr.length; i++) {
            var ballC = ballArr[i];
            if (distanceFormula(ball.x, ball.y, ballC.x, ballC.y) <= ball.radius + ballC.radius) {
                var rotationAngle = Math.atan((ballC.y-ball.y)/(ballC.x-ball.x));

                var ux = ball.vx*Math.cos(rotationAngle) + ball.vy*Math.sin(rotationAngle);
                var uy = -ball.vx*Math.sin(rotationAngle) + ball.vy*Math.cos(rotationAngle);

                var cx = ballC.vx*Math.cos(rotationAngle) + ballC.vy*Math.sin(rotationAngle);
                var cy = -ballC.vx*Math.sin(rotationAngle) + ballC.vy*Math.cos(rotationAngle);

                var wx=cx;
                var wy=uy;
                var dx=ux;
                var dy=cy;

                ball.vx = wx*Math.cos(rotationAngle) - wy*Math.sin(rotationAngle);
                ball.vy = wx*Math.sin(rotationAngle) + wy*Math.cos(rotationAngle);

                ballC.vx = dx*Math.cos(rotationAngle) - dy*Math.sin(rotationAngle);
                ballC.vy = dx*Math.sin(rotationAngle) + dy*Math.cos(rotationAngle);
				
				//Ensure balls don't get stuck together.
                if (distanceFormula(ball.x + ball.vx/UPDATES_PER_FRAME, ball.y + ball.vy/UPDATES_PER_FRAME,
                    ballC.x + ballC.vx/UPDATES_PER_FRAME, ballC.y + ballC.vy/UPDATES_PER_FRAME) <= ball.radius + ballC.radius) {

                    ball.x += (1-((ball.radius + ballC.radius)*(ball.radius + ballC.radius)/((ballC.x - ball.x)*(ballC.x - ball.x) + (ballC.y - ball.y)*(ballC.y - ball.y))))*(ballC.x - ball.x)/2;
                    ball.y += (1-((ball.radius + ballC.radius)*(ball.radius + ballC.radius)/((ballC.x - ball.x)*(ballC.x - ball.x) + (ballC.y - ball.y)*(ballC.y - ball.y))))*(ballC.y - ball.y)/2;
                    ballC.x -= (1-((ball.radius + ballC.radius)*(ball.radius + ballC.radius)/((ballC.x - ball.x)*(ballC.x - ball.x) + (ballC.y - ball.y)*(ballC.y - ball.y))))*(ballC.x - ball.x)/2;
                    ballC.y -= (1-((ball.radius + ballC.radius)*(ball.radius + ballC.radius)/((ballC.x - ball.x)*(ballC.x - ball.x) + (ballC.y - ball.y)*(ballC.y - ball.y))))*(ballC.y - ball.y)/2;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    for (var i=0; i<wallArr.length; i++) {
        var wall=wallArr[i];

        if (wall.b == 0) {
            ctx.beginPath();
            ctx.moveTo(-wall.c/wall.a, 0);
            ctx.lineTo(-wall.c/wall.a, CANVAS_HEIGHT);
            ctx.lineWidth = 2*wall.lineWidth;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            continue;
        }

        ctx.beginPath();
        ctx.moveTo(0, -wall.c/wall.b);
        ctx.lineWidth = 2*wall.thickness;
        ctx.strokeStyle = '#ffffff';
        ctx.lineTo(CANVAS_WIDTH, -(wall.a*CANVAS_WIDTH + wall.c)/wall.b);
        ctx.stroke();
    }

    for (var i=0; i<ballArr.length; i++) {
        var ball = ballArr[i];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ef5350';
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI, false);
        ctx.fillStyle = '#ef5350';
        ctx.fill();
        ctx.stroke();
    }
}

var timer = 0;
var timerActive = false;

var touchX;
var touchY;

canvas.addEventListener('mousedown', function() {
    timer = 0;
    timerActive = true;
});

canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    timer = 0;
    timerActive = true;
    touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    touchY = event.touches[0].clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    touchY = event.touches[0].clientY - canvas.getBoundingClientRect().top;
});

canvas.addEventListener('mouseup', function(event) {
    var vy = (timer > 20) ? (timer-20)*1.5 : 0;
    ballArr.push(new Ball(CANVAS_WIDTH*event.clientX/canvas.clientWidth,CANVAS_HEIGHT*event.clientY/canvas.clientHeight,0,vy));
    timerActive = false;
});

canvas.addEventListener('touchend', function(event) {
    event.preventDefault();
    var vy = (timer > 60) ? (timer-20)*1.5 : 0;
    ballArr.push(new Ball(CANVAS_WIDTH*touchX/canvas.clientWidth,CANVAS_HEIGHT*touchY/canvas.clientHeight,0,vy));
    timerActive = false;
});