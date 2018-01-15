import { 
  Component,
  ViewChild
  } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { 
  IonicPage, 
  NavController, 
  LoadingController,
  PopoverController,
  PopoverOptions,
  NavParams,
  ToastController
} from 'ionic-angular';

import { ChatEditPage } from '../chat-edit/chat-edit';

import { AppStateProvider } from "../../providers/app-state/app-state";
import { ApiProvider, Chat, Message } from '../../providers/api/api';

/**
 * The Page where all the Chat Stuff happens.
 *
 * See https://angular-meteor.com/tutorials/whatsapp2/ionic/messages-page 
 * for some inspiration for the UI if needed.
 * 
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  showInfoHeader:boolean = false;
  showEnterMessageFooter:boolean = false;
  showFootRoom:boolean = false;

  // scroll panel with massages on
  @ViewChild('messagescroll') messagescroll:any;

  // chat data
  chatId:string = null;
  chat:Chat = {
    title: "",
    emoji: ""
  };

  messages: Array<Message> = [];
  isSubscribed:boolean = false;

  messageInput:string = "";

  // TODO: i18n
  pageTitel:string = "";

  constructor(
    private navCtrl: NavController, 
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private state: AppStateProvider,
    private navParams: NavParams
  ) {

    // browser needs some extra space on the panel
    this.showFootRoom = !state.isRunningOnRealDevice();

    this.chatId = navParams.get("id");
  }

  /*
    EVENTS
  */

  ionViewWillEnter() {
    this.showInfoHeader = (this.chatId!=null);
  }

  ionViewDidEnter() {
    this.initChatData();
  }

  ionViewWillLeave() {
    this.showEnterMessageFooter = false;
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

        // MAKE THAT CHAT DATA OBJECT IS ALREADY GIVENM BY PAGE CALLER
        // --> just load meessages and show Spinner instead of messages
        // --> dont make modal - tooo much flicker on page transition

        // show loading module
        let loadingModal = this.loadingCtrl.create({});
        loadingModal.present().then();
    
        this.api.getChat(this.chatId).subscribe((chat) => {
    
          /* WIN */
          alert('TODO: Display Chat from Server');
    
          // hide loading spinner
          loadingModal.dismiss().then();

          this.showEnterMessageFooter = true;
    
        }, (error)=>{
    
          /* ERROR */
          console.error('TODO: FAILED getting Chat from Server: '+error);
          
          this.chat = {
            title: "FAILED LOADING",
            emoji: "🔧"
          };
    
          this.showEnterMessageFooter = true;

          // hide loading spinner
          loadingModal.dismiss().then();
    
        });

    }

  } 

  showDialogEditChat(myEvent) : void {

    let popover = this.popoverCtrl.create(ChatEditPage, {chat: this.chat, callback: (data) => {

      this.chat = data;
      this.showInfoHeader = true;
      this.showEnterMessageFooter = true;
      popover.dismiss();

    }}, {
      cssClass: 'popover-chat-edit',
      showBackdrop: true,
      enableBackdropDismiss: true
    });

    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss(()=>{

      if ((this.chat==null) || (this.chat.title.trim().length==0)) {

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

  sendMessage(): void {

    if (!this.isSubscribed) {
      // TODO: subscribe to chat if posting a message
      this.isSubscribed = true;
      console.error("TODO: Update with server that user is now subscribed on chat.");
    }

    let message:Message = {
      _id: "2",
      chatId: "0",
      senderId: "1",
      content: this.messageInput,
      createdAt: new Date(),
      ownership: "other"
    };

    this.messages.push(message);
    this.messageInput = "";

    this.messagescroll.scrollToBottom(300);
  }

  buttonSubscribe() : void {
    this.isSubscribed = !this.isSubscribed;

    if (this.isSubscribed) {
      this.toastCtrl.create({
        message: "Du erhälst jetzt Benachrichtingungen",
        cssClass: 'toast',
        duration: 3000
      }).present().then();
    } else {
      this.toastCtrl.create({
        message: "Benachrichtingungen deaktiviert",
        cssClass: 'toast',
        duration: 3000
      }).present().then();
    }
    console.error("TODO: Update subscribe with server ("+this.isSubscribed+")");
  }

  focusMessageImput(gotFocus:boolean) : void {
    setTimeout(() => {
      this.messagescroll.scrollToBottom(100);
    },200);
  }

}
