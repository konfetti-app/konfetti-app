import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ChatPage } from '../../pages/chat/chat';
import { ApiProvider, Chat } from '../../providers/api/api';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';

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

  // the active neighborhood
  activeGroupId:string;

  // true if network request is going on
  loading:boolean = true;

  // chats to display
  chats:Array<Chat> = [];

  constructor(
    private navCtrl: NavController,
    private api: ApiProvider,
    private persistence: AppPersistenceProvider,
    private state: AppStateProvider
  ) {

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

    // TODO: refresh data everytime user comes back to module later (event?)
    this.refreshData();
  }

  private refreshData(): void {
    this.loading = true;
    this.api.getChats(this.activeGroupId,"moduleGroupChat").subscribe((chats:Array<Chat>) => {
      this.chats = chats;
      console.log("chats",this.chats);
      this.loading = false;
    }, (error) => {
      this.loading = false;
      alert("TODO: Error on getting chatlist");
    });
  }

  // user wants to view a existing group chat
  public selectCard(chat:Chat) : void {
    this.navCtrl.push(ChatPage, { chat: chat } );
  }

  // user wants to create a new group chat
  public buttonNew() : void {
    this.navCtrl.push(ChatPage,{
      type: "multi",
      id: null
    });
  }



}
