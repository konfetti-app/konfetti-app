import { Component } from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  LoadingController,
  PopoverController,
  PopoverOptions,
  NavParams 
} from 'ionic-angular';

import { ChatEditPage } from '../chat-edit/chat-edit';

import { ApiProvider, Chat } from '../../providers/api/api';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  // chat data
  chatId:string = null;
  chat:Chat = null;

  // TODO: i18n
  pageTitel:string = "New Chat";

  constructor(
    private navCtrl: NavController, 
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController,
    private navParams: NavParams
  ) {

    this.chatId = navParams.get("id");
  }

  /*
    EVENTS
  */

  ionViewDidEnter() {
    this.initChatData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  /*
    INTERACTION
  */

  initChatData() : void {

    if (this.chatId==null) {

      /*
        NEW CHAT
      */

      // let user set chat details first
      this.showDialogEditChat(null);

    } else {

        /*
          GET CHAT DATA
        */

        // show loading module
        let loadingModal = this.loadingCtrl.create({});
        loadingModal.present().then();
    
        this.api.getChat(this.chatId).subscribe((chat) => {
    
          /* WIN */
          alert('TODO: Display Chat from Server');
    
          // hide loading spinner
          loadingModal.dismiss().then();
    
        }, (error)=>{
    
          /* ERROR */
          alert('TODO: FAILED getting Chat from Server: '+error);
    
          // hide loading spinner
          loadingModal.dismiss().then();
    
        });

    }

  } 

  showDialogEditChat(myEvent) : void {

    let popover = this.popoverCtrl.create(ChatEditPage, {chat: this.chat, callback: this.callbackDialogEditChat}, {
      cssClass: 'popover-chat-edit',
      showBackdrop: true,
      enableBackdropDismiss: true
    });

    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(()=>{

      if ((this.chat==null) || (this.chat.title.trim.length==0)) {

        // user did not created chat - so go back to main menu
        this.navCtrl.pop();

      } else {

        if (this.chatId==null) {

          // user wants chat to be created
          alert("TODO: Create new Chat with name: "+this.chat.title);

        } else {

          // check if user edited existing chat details --> store
          alert("TODO: Check if user edited details and store ");

        }        

      }

    });
  }

  callbackDialogEditChat(chat:Chat, dismiss:true) {
    this.chat = chat;
  }

}
