import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ChatPage } from '../../pages/chat/chat';

/*

  Dev Notes:

  Would be great to add emojis to group chat. Here is a DB JSON with
  all basic emojis we could put to display and select.
  https://github.com/AnteWall/angular2-emoji/tree/master/src/lib/db

*/

@Component({
  selector: 'module-groupchats',
  templateUrl: 'module-groupchats.html'
})
export class ModuleGroupchatsComponent {

  @Input() config:any = null;

  text:string = "No Config";

  constructor(public navCtrl: NavController) {

    if (this.config!=null) this.text = this.config.test;

  }

  // user wants to view a existing group chat
  public selectCard(id:string) : void {
    this.navCtrl.push(ChatPage, {
      type: "multi",
      id: id
    });
  }

  // user wants to create a new group chat
  public buttonNew() : void {
    this.navCtrl.push(ChatPage,{
      type: "multi",
      id: null
    });
  }



}
