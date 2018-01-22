import { Component, Input } from '@angular/core';
import { NavController, ModalController, Modal, } from 'ionic-angular';

import { ApiProvider, Chat } from '../../providers/api/api';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';

import { ChatPage } from '../../pages/chat/chat';
import { ProfilePage } from '../../pages/profile/profile';

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
    private modalCtrl: ModalController,
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
      this.chats = [];
      chats.forEach((chat:Chat) => {
        chat = this.api.addDisplayInfoToChat(
          chat, 
          this.persistence.getAppDataCache().userid,
          this.state.getUserInfo().nickname,
          this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null
        );
        this.chats.push(chat);
      });
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

    // check if user has already set profile for chat
    if (!this.state.isMinimalUserInfoSet(true)) {

      if (!this.state.isMinimalUserInfoSet()) {

        // user needs to set profile namen and photo first
        let modal : Modal = this.modalCtrl.create(ProfilePage, { 
          showAccountLink: false, 
          photoNeeded: true,
          notice: 'Wir brauchen noch Name und Foto von dir, bevor du einen neuen Chat anlegen kannst.'
        });
        modal.onDidDismiss(data => {
          if (this.state.isMinimalUserInfoSet(true)) this.buttonNew();
        });
        modal.present().then();

      } else {

        // user has name set but is missing still photo
        let modal : Modal = this.modalCtrl.create(ProfilePage, { 
          showAccountLink: false, 
          photoNeeded: true,
          notice: 'Wir brauchen noch ein Foto von dir, bevor du einen neuen Chat anlegen kannst.'
        });
        modal.onDidDismiss(data => {
          if (this.state.isMinimalUserInfoSet(true)) this.buttonNew();
        });
        modal.present().then();

      }

    } else {
      this.navCtrl.push(ChatPage,{});
    } 

  }



}
