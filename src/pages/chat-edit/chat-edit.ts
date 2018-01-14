import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Chat } from '../../providers/api/api';

/**
 * Generated class for the ChatEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-edit',
  templateUrl: 'chat-edit.html',
})
export class ChatEditPage {

  chat:Chat;
  callback:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    // the  parameters
    this.chat = this.navParams.get('chat');
    this.callback = this.navParams.get('callback');
    
    // when new chat
    if (this.chat==null) {

      // set default values
      this.chat = {
        title: 'Test',
        emoji: '💬'
      };

    }

    //this.callback(this.chat);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatEditPage');
  }

}
