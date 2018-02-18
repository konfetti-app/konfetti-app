import { Component, Input } from '@angular/core';
import { 
  NavController, 
  ModalController, 
  Modal,
  Events
} from 'ionic-angular';

import { ApiProvider, Chat, PushNotification } from '../../providers/api/api';
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

  // flag is running on iOS
  isIOS: boolean;

  // for internal debugs
  creationTS:number;

  constructor(
    private navCtrl: NavController,
    private api: ApiProvider,
    private persistence: AppPersistenceProvider,
    private modalCtrl: ModalController,
    private state: AppStateProvider,
    private events: Events
  ) {

    this.creationTS = Date.now();
    this.isIOS = this.state.isIOS();

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

    // get fresh data
    this.refreshData();

    /*
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    this.events.subscribe("new:groupchats", () => {
      console.log("Eventbus: New GroupChat");
      this.buttonNew();
    });

    this.events.subscribe("refresh:groupchats", () => {
      console.log("Eventbus: Refresh GroupChat");
      if (!this.loading) {
        console.log("Refreshing chat list ...");
        this.refreshData();
      } else {
        console.log("Ignore refresh ... because still in loading process.");
      }
    });

    this.events.subscribe("push:groupchats", (notification:PushNotification) => {
      console.log("Eventbus: Notification on GroupChat",this.creationTS);
      this.processNotification(notification);
    });

  }

  // unsubscribe from event bus when component gets destroyed
  ngOnDestroy() {
    this.events.unsubscribe("new:groupchats");
    this.events.unsubscribe("refresh:groupchats");
    this.events.unsubscribe("push:groupchats");
  }

  // react on push notification
  private processNotification(notification:PushNotification): void {

    // TODO: trigger fresh data load when older than x minutes

    //if module is in the process of refreshing data - wait and retry in 200ms
    if (this.loading) {
      setTimeout(()=>{
        this.processNotification(notification);
      },200);
      return;
    }

    // get matching chat from list
    this.chats.forEach((chat:Chat)=>{
      if (chat._id==notification.itemID) {
        console.log("processNotification: open Chat");
        this.selectCard(chat);
      }
    });
  
  }

  private refreshData(): void {

    this.loading = true;
    this.api.getChats(
      this.activeGroupId,
      "moduleGroupChat",
      this.persistence.getAppDataCache().userid,
      this.state.getUserInfo().nickname,
      this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null
    ).subscribe((chats:Array<Chat>) => {
      this.chats = chats;
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
