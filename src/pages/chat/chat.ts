import { 
  Component,
  ViewChild
  } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { 
  IonicPage, 
  NavController, 
  LoadingController,
  Loading,
  PopoverController,
  PopoverOptions,
  NavParams,
  ModalController,
  Modal,
  ToastController
} from 'ionic-angular';

import { ChatEditPage } from '../chat-edit/chat-edit';

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';

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
  chat:Chat = null;

  messages: Array<Message> = [];
  isSubscribed:boolean = false;

  messageInput:string = "";

  loading:boolean = true;
  loadingSpinner : Loading = null;

  // TODO: i18n
  pageTitel:string = "";

  constructor(
    private navCtrl: NavController, 
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private state: AppStateProvider,
    private modalCtrl: ModalController,
    private persistence: AppPersistenceProvider,
    private navParams: NavParams
  ) {

    // browser needs some extra space on the panel
    this.showFootRoom = !state.isRunningOnRealDevice();
    this.chat = navParams.get("chat") as Chat;
  }

  /*
    EVENTS
  */

  ionViewWillEnter() {
    this.showInfoHeader = (this.chat!=null);
  }

  ionViewDidEnter() {
    if (this.chat==null) {
      // offer new chat to start with
      this.chat = new Chat();
      this.chat.name = "";
      this.chat.description = "";
      this.showDialogEditChat();
    } else {
      this.showEnterMessageFooter = true;
    }
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

    // Pull To Refresh Action
  doRefresh(refresher) {
    
      console.log('Begin async operation', refresher);
  
      setTimeout(() => {
        console.log('Async operation has ended');
        refresher.complete();
      }, 2000);
  }

  showDialogEditChat() : void {

    let modal : Modal = this.modalCtrl.create(ChatEditPage, { chat: this.chat });
    modal.onDidDismiss( (data:any) => {

        // user did close dialog by cancel
        if (data==null) {
          if ((typeof this.chat._id == "undefined") || (this.chat._id==null)) {
            // user did not created chat - so go back to main menu
            this.navCtrl.pop();
          }
          return;
        }

        this.chat = data.chat;
  
        if ((typeof this.chat._id == "undefined") || (this.chat._id==null)) {
  
          // user wants chat to be created

          // show loading spinner
          this.loadingSpinner = this.loadingCtrl.create({
            content: ''
          });
          this.loadingSpinner.present().then();

          // make API request
          this.chat.parentNeighbourhood = this.persistence.getAppDataCache().lastFocusGroupId;
          this.chat.context = "moduleGroupChat";
          this.api.createChat(this.chat).subscribe((chat:Chat)=>{

            // WIN

            this.chat = chat;
            this.showInfoHeader = true;
            this.showEnterMessageFooter = true;

            // hide spinner
            this.loadingSpinner.dismiss().then();
            this.loadingSpinner = null;

          }, (error)=>{

            // FAIL

            this.toastCtrl.create({
              message: "Failed to create Chat",
              duration: 3000
            }).present().then(()=>{
              this.navCtrl.pop();
            });

            // hide spinner
            this.loadingSpinner.dismiss().then();
            this.loadingSpinner = null;

          });

  
        } else {
  
            // check if user edited existing chat details --> store
            this.toastCtrl.create({
              message: 'TODO: Check if user edited details and store ',
              duration: 3000
            }).present().then();
  
        }

    });
    modal.present().then();

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
