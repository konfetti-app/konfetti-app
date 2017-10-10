import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

/**
 * Shown on startup - while app/app.component.ts is doing the startup
 * Place for Displaying Errors on StartUp.
 */

@IonicPage()
@Component({
  selector: 'page-init',
  templateUrl: 'init.html',
})
export class InitPage {

  public showHeader : boolean = false;

  constructor() {
  }

  ionViewDidLoad() {
  }

}
