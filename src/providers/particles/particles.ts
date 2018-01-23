import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/**
  Mix of on:
  http://masteringionic.com/blog/2017-12-05-creating-a-random-particle-generator-with-html5-canvas-api-and-ionic-framework/?utm_source=masteringionic_newsletter&utm_medium=email&utm_campaign=visit_blog&utm_content=adding_3d_animation_to_ionic_applications_with_threejs
  &
  http://jsfiddle.net/Javalsu/vxP5q/743/?utm_source=website&utm_medium=embed&utm_campaign=vxP5q

  1) in HTML: <canvas #canvasObj style="position: fixed;
           top: 0px;
           left: 0px;
           width: 100%;
           height: 100%;
           pointer-events: none;
           z-index: 999;"></canvas>

  2) in TS: @ViewChild('canvasObj') canvasElement : ElementRef;
     nativeElement: this.canvasElement.nativeElement
     this._PARTICLE.initialiseCanvas(this.canvasElement.nativeElement, 320, 600);
 */
@Injectable()
export class ParticlesProvider {

  private _CANVAS 			: any;
  private _CONTEXT 		: any;
  private _ANIMATION;

  mp:number = 150; //max particles
  particles:Array<any> = [];
  angle:number = 0;
  tiltAngle:number = 0;
  confettiActive:boolean = true;
  animationComplete:boolean = true;
  deactivationTimerHandler:any;
  reactivationTimerHandler:any;
  animationHandler:any;

  // particle props
  particleColors:any = {
    colorOptions: ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"],
    colorIndex: 0,
    colorIncrementer: 0,
    colorThreshold: 10,
    getColor: function () {
        if (this.colorIncrementer >= 10) {
            this.colorIncrementer = 0;
            this.colorIndex++;
            if (this.colorIndex >= this.colorOptions.length) {
                this.colorIndex = 0;
            }
        }
        this.colorIncrementer++;
        return this.colorOptions[this.colorIndex];
    }
  }

  constructor(
  ) { }

   /**
    * Initialise and set the canvas element.
    */
  public initialiseCanvas(nativeElement:any, width:number, height:number) : void
  {
     console.log(width+"x"+height);
     this._CANVAS = nativeElement;
     this._CANVAS.width  = width;
     this._CANVAS.height = height;
     if(this._CANVAS.getContext)
     {
        this.setupCanvas();
     } else {
       console.error("No Context auf nativeElement of Canvas available.");
     }
  }

  /**
   * Start a confetti rain.
   */
  public startAnimation(count:number, milliseconds:number, callbackWhenDone:any=null) : void
  {
    this.mp = count;
    setTimeout(()=>{
      cancelAnimationFrame(this._ANIMATION);
      this.clearCanvas();
      if (callbackWhenDone!=null) callbackWhenDone();
    }, milliseconds);
     this.clearCanvas();
     this.renderToCanvas();
  }

  /**
   * Sets up the HTML5 Canvas
   */
  private setupCanvas() : void
  {
     this._CONTEXT = this._CANVAS.getContext('2d');
     this._CONTEXT.fillStyle 	= "transparent";
     this._CONTEXT.fillRect(0, 0, this._CANVAS.width, this._CANVAS.height);
  }

  /**
   * Clear and recreate the HTML5 Canvas object
   */
  private clearCanvas() : void
  {
     this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
     this.setupCanvas();
  }

  /**
   * Render the particle animation to the HTML5 Canvas object
   */
  private renderToCanvas() : void
  {
    // create particles to start with
    this.particles = [];
    this.animationComplete = false;
    for (var i = 0; i < this.mp; i++) {
      var particleColor = this.particleColors.getColor();
      this.particles.push(new confettiParticle(this._CONTEXT, particleColor, this._CANVAS.width, this._CANVAS.height, this.mp));
    }

    this.createKonfettiAnimation();
  }

  /**
   * Create the particle animation using the requestAnimationFrame object
   */
  private createKonfettiAnimation() : void {

      // clear screen and draw all particles
      this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
      for (let i = 0; i < this.mp; i++) this.particles[i].draw();

      // Update
      let remainingFlakes = 0;
      let particle;
      this.angle += 0.01;
      this.tiltAngle += 0.1;

      for (let i = 0; i < this.mp; i++) {

        particle = this.particles[i];
        if (this.animationComplete) return;

        if (!this.confettiActive && particle.y < -15) {
                particle.y = this._CANVAS.height + 100;
                continue;
        }

        // stepParticle
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(this.angle + particle.d) + 3 + particle.r / 2) / 2;
        particle.x += Math.sin(this.angle);
        particle.tilt = (Math.sin(particle.tiltAngle - (i / 3))) * 15;

        // check if particle is within height
        if (particle.y <= this._CANVAS.height) {
          remainingFlakes++;
        }

        /* --> activate if you want to recycle done particles
        // CheckForReposition
        if ((particle.x > this._CANVAS.width + 20 || particle.x < -20 || particle.y > this._CANVAS.height) && this.confettiActive) {
          if (i % 5 > 0 || i % 2 == 0) //66.67% of the flakes
          {
              this.repositionParticle(particle, Math.random() * this._CANVAS.width, -10, Math.floor(Math.random() * 10) - 10);
          } else {
              if (Math.sin(this.angle) > 0) {
                  //Enter from the left
                  this.repositionParticle(particle, -5, Math.random() * this._CANVAS.height, Math.floor(Math.random() * 10) - 10);
              } else {
                  //Enter from the right
                  this.repositionParticle(particle, this._CANVAS.width + 5, Math.random() * this._CANVAS.height, Math.floor(Math.random() * 10) - 10);
              }
          }
        } 
        */

      }

      // stop confetti
      if (remainingFlakes === 0) {
        this.animationComplete = true;
        this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
      }

     // Use the requestAnimationFrame method to generate new particles a minimum
     // of 60x a second (or whatever the browser refresh rate is) BEFORE the next
     // browser repaint
     if (!this.animationComplete) this._ANIMATION = requestAnimationFrame(() =>
     {
        this.createKonfettiAnimation();
     });

  }

  private repositionParticle(particle, xCoordinate, yCoordinate, tilt) {
    particle.x = xCoordinate;
    particle.y = yCoordinate;
    particle.tilt = tilt;
  }

}

export class confettiParticle {

  ctx:any;
  x:number;
  y:number;
  d:number;
  r:number;
  tilt:number;
  tiltAngleIncremental:number;
  tiltAngle:number;
  color:string;

  constructor(canvasContext, color, w, h, mp) {
    this.ctx = canvasContext;
    this.color = color;
    this.x = Math.random() * w; // x-coordinate
    this.y = (Math.random() * h) - h; //y-coordinate
    this.r = Math.floor(Math.random() * (30 - 10 + 1) + 10); //radius;
    this.d = (Math.random() * mp) + 10; //density;
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
    this.tiltAngle = 0;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.r / 2;
    this.ctx.strokeStyle = this.color;
    this.ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
    this.ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
    return this.ctx.stroke();  
  }
  
}
