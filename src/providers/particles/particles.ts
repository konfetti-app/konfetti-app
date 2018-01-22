import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/**
 
  Based on:
  http://masteringionic.com/blog/2017-12-05-creating-a-random-particle-generator-with-html5-canvas-api-and-ionic-framework/?utm_source=masteringionic_newsletter&utm_medium=email&utm_campaign=visit_blog&utm_content=adding_3d_animation_to_ionic_applications_with_threejs

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
   *
   * Replay, from the start, the animation that had
   * been previously stopped
   *
   * @public
   * @method replayAnimation
   * @return {None}
   */
  public startAnimation(milliseconds:number, callbackWhenDone:any=null) : void
  {

    setTimeout(()=>{
      cancelAnimationFrame(this._ANIMATION);
      this.clearCanvas();
      if (callbackWhenDone!=null) callbackWhenDone();
    }, milliseconds);

     this.clearCanvas();
     this.renderToCanvas();
  }

  /**
   *
   * Creates a particle using the Canvas API
   *
   * @public
   * @method renderParticle
   * @param context       {Object}   		The HTML Canvas context object
   * @param canvasWidth   {Number}   		The Canvas object width value
   * @param canvasHeight  {Number}   		The Canvas object height value
   * @return {None}
   */
  private renderParticle(context			: any,
                 canvasWidth 	    : number,
                 canvasHeight 	    : number)
  {

     // Define particle properties
     let startingX     : number 	= Math.round(canvasWidth/2) + Math.random() * 225,
         startingY     : number 	= Math.round(canvasHeight/2) + Math.random() * 115 - 57,
         radius        : number    = this.generateRandomValue(7, 2),
         startAngle    : number    = 0,
         endAngle      : number    = 2 * Math.PI,
         clockwise     : boolean   = false,

         // Define the colour value for each generated particle using the HSLA CSS property
         hue           : number    = this.generateRandomValue(50, 0),
         saturation    : any       = 100 + '%',
         lightness     : any       = 50 + '%',
         alpha         : number    = 1,
         colourFill    : any       = "hsla(" + hue + "," + saturation + "," + lightness + "," + alpha + ")";


     // Update the X * Y axis values for the particle
     startingX 					= startingX + Math.random() * 310 - 245;
     startingY 					= startingY + Math.random() * 410 - 225;


     // Generate the shape
     // - startingX 	(position on X axis)
     // - startingY 	(position on Y axis)
     // - radius    	(width of particle)
     // - startAngle   (starts from)
     // - endAngle   	(ends at)
     // - clockwise    (direction - clockwise or not)
     context.beginPath();
     context.arc(startingX,
                 startingY,
                 radius,
                 startAngle,
                 endAngle,
                 clockwise);
     context.fillStyle = colourFill;
     context.fill();
  }

  /**
   *
   * Generates a random numeric value
   *
   * @public
   * @method generateRandomValue
   * @param min     {Number}   		Minimum numeric value
   * @param max     {Number}   		Maximum numeric value
   * @return {Number}
   */
  private generateRandomValue(min : number,
                      max : number) : number
  {
     let maxVal : number     = max,
         minVal : number     = min,
         genVal : number;

     // Generate max value
     if(maxVal === 0)
     {
        maxVal = maxVal;
     }
     else {
        maxVal = 1;
     }

     // Generate min value
     if(minVal)
     {
        minVal = minVal;
     }
     else {
        minVal = 0;
     }

     genVal  = minVal + (maxVal - minVal) * Math.random();

     return genVal;
  }

  /**
   *
   * Sets up the HTML5 Canvas
   *
   * @public
   * @method setupCanvas
   * @return {None}
   */
  private setupCanvas() : void
  {
     this._CONTEXT = this._CANVAS.getContext('2d');
     this._CONTEXT.fillStyle 	= "transparent";
     this._CONTEXT.fillRect(0, 0, this._CANVAS.width, this._CANVAS.height);
  }

  /**
   *
   * Clear and recreate the HTML5 Canvas object
   *
   * @public
   * @method clearCanvas
   * @return {None}
   */
  private clearCanvas() : void
  {
     this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
     this.setupCanvas();
  }

  /**
   *
   * Render the particle animation to the HTML5 Canvas object
   *
   * @public
   * @method renderToCanvas
   * @return {None}
   */
  private renderToCanvas() : void
  {
     this.createParticleAnimation();
  }

  /**
   *
   * Create the particle animation using the requestAnimationFrame object
   *
   * @public
   * @method createParticleAnimation
   * @return {None}
   */
  private createParticleAnimation() : void
  {
     // Generate a new particle via loop iteration
     for(var i = 0;
             i < 10;
             i++)
     {
        this.renderParticle(this._CONTEXT,
                         this._CANVAS.width,
                         this._CANVAS.height);
     }


     // Use the requestAnimationFrame method to generate new particles a minimum
     // of 60x a second (or whatever the browser refresh rate is) BEFORE the next
     // browser repaint
     this._ANIMATION = requestAnimationFrame(() =>
     {
        this.createParticleAnimation();
     });
  }

}
