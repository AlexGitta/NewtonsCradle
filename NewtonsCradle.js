let balls = [];
let ballDiameter = 30;
let stringlength = 100;
let interacted = false;
let ballinteracted = null;
let weightslider;
let otherslider;
let amtslider;
let wevalue = 0.995;
let atvalue = -0.001;
let stringbox;
let amount = 5;

function setup() {
  createCanvas(800, 600);
  
  //adding balls to array
  
  for (let i = 0; i < amount; i++) {
    
    // using x to evenly space balls
    let x = width / 2 - amount * ballDiameter * 0.75 + i * ballDiameter * 1.15;
    balls.push(new Ball(createVector(x, 50), stringlength, ballDiameter, i, random(255), random(255), random(255)));
  }
  
  //set first ball at a height to begin simulation  
  balls[0].angle = -PI/4;
  
  // create UI 
  stringbox = createCheckbox('strings off');
  stringbox.position(320,350);
  
  // slider for weight 
  weightslider = createSlider(0, 255, 255);
  weightslider.position(200, 300);
  weightslider.size(80);
  
  weightslider.input(() => {
    
    // map slider value to variable    
    wevalue = map(weightslider.value(),0,255,0.93,0.995)
    console.log(wevalue);
  });
  
  // slider for atmosphere  
  otherslider = createSlider(0, 255, 255);
  otherslider.position(500, 300);
  otherslider.size(80);
  
  otherslider.input(() => {
    
    // map slider value to variable    
    atvalue = (map(otherslider.value(),0,255,-0.03,-0.001))
    console.log(atvalue);
  });
  
  // slider for amount of balls 
  amtslider = createSlider(1, 12, amount, 1);
  amtslider.position(350, 300);
  amtslider.size(80);
  
  amtslider.input(() => {
          console.log(amtslider.value());
    
          // empty the array         
         for (let i = 0; i < amount; i++) {balls.pop();}
    
         // change amount variable, reset canvas and sliders then re-setup
         amount = amtslider.value();
         clear();
         weightslider.remove();
         otherslider.remove();
         amtslider.remove();
         wevalue = 0.995;
         atvalue = -0.001;
         setup();
       
  });

}

function draw() {
  
  // check for collisions every frame, call object methods
  background(220);
  handleCollisions();
  for (let ball of balls) {
    ball.update();
    ball.display();
  }
  fill(0)
  
  // slider labels  
  noStroke();
  text('weight', 240, 330);
  text('atmosphere', 540, 330);
  text('amount', 385, 330);
 
}




function mousePressed() {
  
  // interaction checking, check if user is dragging ball
  for (let ball of balls) {
    if (ball.contains(mouseX, mouseY)) {
      interacted = true;
      ballinteracted = ball;   
      break;
    }
  }
}

function mouseReleased() {
  
  //change variables back when released
  interacted = false;
  ballinteracted = null;
}

class Ball {
  constructor(origin, stringLength, diameter, index, randoR, randoG, randoB){
    this.origin = origin;
    this.stringLength = stringLength;
    this.diameter = diameter;
    this.index = index;
    this.angle = 0;
    this.aVelocity = 0;
    this.aAcceleration = 0;
    this.Re = randoR;
    this.Gr = randoG;
    this.Bl = randoB;
    
  }

  update() {
    
    // check if ball is being dragged   
    if (interacted && this === ballinteracted) {
      
      // use mouse coordinates to move ball on string axis
      let diff = createVector(this.origin.x - mouseX, mouseY - this.origin.y);
      let newAngle = atan2(diff.y, diff.x) - HALF_PI;
      
      //if first ball, cant drag all the way over
      if (this.index === 0) {
        this.angle = min(newAngle, 0); 
      // if end ball, can only drag 90 degrees
      } else if (this.index === balls.length - 1) {
        this.angle = max(newAngle, 0); 
      // if middle ball, can go full 360
      } else {
        this.angle = newAngle;
      }
    } else {
      
      // if not being interacted with, calculate movement
      // using slider values in calculation    
      this.aAcceleration = atvalue * sin(this.angle);
      this.aVelocity += this.aAcceleration;
      this.aVelocity *= wevalue;
      this.angle += this.aVelocity;
    }
  }

  display() {
    // find current position, use this and origin to draw ball/string
    let x = this.origin.x + this.stringLength * sin(this.angle);
    let y = this.origin.y + this.stringLength * cos(this.angle);
    stroke(7);
    if (stringbox.checked() == false)
      {
        line(this.origin.x, this.origin.y, x, y);
        line(this.origin.x, this.origin.y, x, y);
      }
    // fill with random colours
    fill(this.Re,this.Gr,this.Bl)
    ellipse(x, y, this.diameter, this.diameter);


  }

  getPosition() {
    
    //returns vector of current position
    return createVector(
      this.origin.x + this.stringLength * sin(this.angle),
      this.origin.y + this.stringLength * cos(this.angle)
    );
  }

  contains(px, py) {
    
    // returns true if px and py are inside this object
    let pos = this.getPosition();
    return dist(px, py, pos.x, pos.y) < this.diameter / 2;
  }
}

function handleCollisions() {
  
  // go through every ball and check collisions with one next to it
  for (let i = 0; i < balls.length - 1; i++) {
    let a = balls[i];
    let b = balls[i + 1];
    let posA = a.getPosition();
    let posB = b.getPosition();
    if (posA.dist(posB) < a.diameter) {
      // simple collision response
      let temp = a.aVelocity;
      a.aVelocity = b.aVelocity;
      b.aVelocity = temp;
    }
  }
}
