import { Component, Input } from '@angular/core';
import { 
  NavController, 
  ModalController, 
  Modal,
  Events
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';

import { ApiProvider, Post } from '../../providers/api/api';

import { ChatPage } from '../../pages/chat/chat';

@Component({
  selector: 'module-newsfeed',
  templateUrl: 'module-newsfeed.html'
})
export class ModuleNewsfeedComponent {

  @Input() config = null;

    // true if network request is going on
    loading:boolean = false;
  
    // chats to display
    posts:Array<Post> = [];
  
    // flag is running on iOS
    isIOS: boolean;

    constructor(
      private navCtrl: NavController,
      private api: ApiProvider,
      private persistence: AppPersistenceProvider,
      private modalCtrl: ModalController,
      private state: AppStateProvider,
      private events: Events,
      private translateService: TranslateService
    ) {

      this.isIOS = this.state.isIOS();

      this.posts.push({
        _id:  "xxx0",
        type: "notification",
        ts: Date.now() - (60*60*2*1000),
        parentThread: "xxx1",
        data: {
          text: "Katja hat den Beitrag 'Katze gesucht' im Chat kommentiert."
        },
        meta: {
          pushIDs: ['xxxx1','xxxx2'],
          module: 'groupchats',
          itemID: 'xxxxxx6546456',
          subID: null
        }
      } as Post);


  }

  public selectCard(post:Post) : void {
    alert("TODO: Click Post");
    //this.navCtrl.push(ChatPage, { chat: chat } );
  }

  public closePost(post:Post) : void {
    alert("TODO: Close Post");
  }

}
