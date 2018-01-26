import { 
  Component,
  ViewChild
  } from '@angular/core';
import { DatePipe } from '@angular/common';
import { 
  IonicPage, 
  NavController, 
  LoadingController,
  Loading,
  NavParams,
  ModalController,
  Modal,
  ToastController
} from 'ionic-angular';

import { ChatEditPage } from '../chat-edit/chat-edit';
import { ProfilePage } from '../profile/profile';

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
    private toastCtrl: ToastController,
    private state: AppStateProvider,
    private modalCtrl: ModalController,
    private persistence: AppPersistenceProvider,
    private navParams: NavParams
  ) {

    // browser needs some extra space on the panel
    this.showFootRoom = !state.isRunningOnRealDevice();
    this.chat = this.navParams.get("chat") as Chat;
  }

  /*
    EVENTS
  */

  ionViewWillEnter() {
    this.showInfoHeader = (this.chat!=null);
  }

  ionViewDidEnter() {

    if (this.chat==null) {

      /*
        CREATE NEW CHAT
      */

      this.chat = new Chat();
      this.chat.name = "";
      this.chat.description = "";
      this.showDialogEditChat();

    } else {

      /*
        EXISTING CHAT
      */

      this.showEnterMessageFooter = true;
      this.initChatMessages();

    }
  }

  // inits a chat
  initChatMessages(): void {

      /*
        GET OLD CHAT MESSAGES FROM API
      */

      this.api.getChatMessages(this.chat, 0).subscribe((messages:Array<Message>)=>{
        this.loading = false;
        messages.forEach( (message:Message) => {
          this.addMessageToChat(message);
        });
        if (messages.length>0) setTimeout(()=>{
          this.messagescroll.scrollToBottom(500);
        },300);
      }, (error) => {
        this.loading = false;
        alert("TODO: handle error on chat init");
      });

      /*
        RECEIVE NEW CHAT MESSAGE FROM SOCKET
      */

      this.api.initChatSocket(this.chat).subscribe((message:Message)=>{
        this.addMessageToChat(message);
        setTimeout(()=>{
          this.messagescroll.scrollToBottom(200);
        },100);
      }, (error) => {
        alert("TODO: handle error on chat init");
      });

  }

  // takes a message from backend and prepares it for use in app
  addMessageToChat(msg:Message) {
  
    // check if message is from user
    if (msg.parentUser==null) {
      msg.belongsToUser = true;
    } else {
      if (this.persistence.getAppDataCache().userid==msg.parentUser._id) {
        msg.belongsToUser = true;
      } else {
        msg.belongsToUser = false;
      }
    }

    // set avatar image and name
    if (msg.belongsToUser) {
      msg.displayName = this.state.getUserInfo().nickname;
      if ((this.state.getUserInfo().avatar) && (this.state.getUserInfo().avatar.filename)) {
        // user image
        msg.displayImage = this.api.buildImageURL(this.state.getUserInfo().avatar.filename);
      } else {
        // default image
        msg.displayImage = "./assets/imgs/default-user.jpg";
      }
    } else {
      // set for user
      msg.displayName = 'Anonymous';
      msg.displayImage = "./assets/imgs/default-user.jpg";
      if (msg.parentUser!=null) {
        // TODO get real name
        msg.displayName = msg.parentUser.nickname;
        if ((msg.parentUser.avatar) && (msg.parentUser.avatar.filename)) {
          msg.displayImage = this.api.buildImageURL(msg.parentUser.avatar.filename);
        }
      }
    }

    // set date
    let datePipe = new DatePipe(this.state.getActualAppLanguageInfo().locale);
    let messageAge = Date.now() - msg.date;
    if ( messageAge > (24 * 60 * 60) ) {
      // is older than one day (time + date)
      msg.displayTime = datePipe.transform(new Date(msg.date * 1000), 'fullDate');
    } else {
      // was this day (just time)
      msg.displayTime = datePipe.transform(new Date(msg.date * 1000), 'shortTime');
    }

    console.log("PROCESSED CHAT MESSAGE",msg);

    // push message to list
    this.messages.push(msg);
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
  
        if ((typeof data.chat._id == "undefined") || (data.chat._id==null)) {
  
          // user wants chat to be created

          // show loading spinner
          this.loadingSpinner = this.loadingCtrl.create({
            content: ''
          });
          this.loadingSpinner.present().then();

          // make API request
          this.chat.parentNeighbourhood = this.persistence.getAppDataCache().lastFocusGroupId;
          this.chat.context = "moduleGroupChat";
          this.api.createChat(data.chat).subscribe((chat:Chat)=>{

            // WIN

            this.chat = chat;
            this.showInfoHeader = true;
            this.showEnterMessageFooter = true;
            this.chat = this.api.addDisplayInfoToChat(
              this.chat, 
              this.persistence.getAppDataCache().userid,
              this.state.getUserInfo().nickname,
              this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null
           )

            // hide spinner
            this.loadingSpinner.dismiss().then();
            this.loadingSpinner = null;

            this.initChatMessages();

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

    if (!this.state.isMinimalUserInfoSet()) {

      // user needs to set profile namen and photo first
      let modal : Modal = this.modalCtrl.create(ProfilePage, { 
        showAccountLink: false, 
        photoNeeded: false,
        notice: 'Wir brauchen noch deinen Name, bevor du beim Chat mitmachen kannst.'
      });
      modal.onDidDismiss(data => {
        if (this.state.isMinimalUserInfoSet(false)) {
          this.sendMessage();
        }
      });
      modal.present().then();
      return;
      
    } 

    if (!this.isSubscribed) {
      // TODO: subscribe to chat if posting a message
      this.isSubscribed = true;
      console.error("TODO: Update with server that user is now subscribed on chat.");
    }

    /*
      SEND NEW CHAT MESSAGE OVER SOCKET
    */

    this.api.sendChatSocket(this.messageInput);

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