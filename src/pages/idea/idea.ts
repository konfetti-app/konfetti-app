import { Component } from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  ToastController, 
  NavParams,
  LoadingController,
  ActionSheetController
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { ApiProvider, Idea, Chat, JoinResult } from '../../providers/api/api';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ChatPage } from '../../pages/chat/chat';
import { IdeaEditPage } from '../../pages/idea-edit/idea-edit';
import { DistributionPage } from '../../pages/distribution/distribution';

@IonicPage()
@Component({
  selector: 'page-idea',
  templateUrl: 'idea.html',
})
export class IdeaPage {

  idea:Idea;
  calculatesState:string;
  activeGroupId:string;
  running:boolean = true;

  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    private persistence: AppPersistenceProvider,
    private state: AppStateProvider,
    private actionSheetCtrl: ActionSheetController
  ) {
  
    // get idea from parameter and init data
    this.idea = this.navParams.get("idea") as Idea;
    if (this.idea==null) this.idea = {} as Idea;
    this.calculatesState = (this.idea.konfettiUser==0) ? 'vote' : 'voted';
    if (this.idea.reviewStatus!='OK') this.running = false;
    if ( new Date(this.idea.date).getTime() < Date.now() ) {
      this.calculatesState = 'done';
      this.running = false;
    }

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeaPage');
  }

  vote() : void {
    if (this.calculatesState!='vote') return;
    alert("TODO: When voting ready on module - copy over");
  }

  buttonJoin() : void {
    let actionSheet = this.actionSheetCtrl.create({
      title: this.translateService.instant('IDEA_JOINQUEST'),
      buttons: [
        {
          text: this.translateService.instant('IDEA_JOINHELP'),
          handler: () => {
            this.buttonHelping(true);
          }
        },{
          text: this.translateService.instant('IDEA_JOINATTEND'),
          handler: () => {
            this.buttonAttent(true);
          }
        }
      ]
    });
    actionSheet.present();
  }

  buttonHelping(userWantsTo:boolean) : void {
    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();
    this.api.joinKonfettiIdea(this.idea._id, this.idea.userIsAttending, userWantsTo).subscribe(
      (result:JoinResult)=>{
        this.idea.userIsHelping = result.isHelping;
        this.idea.userIsAttending = result.isAttending;
        loadingSpinner.dismiss().then();
        this.toastCtrl.create({
          message: this.translateService.instant('OK'),
          cssClass: 'toast-valid',
          duration: 2000
        }).present().then();
        return;
      }, 
      (error)=>{
        loadingSpinner.dismiss().then();
        console.log("FAIL joinKonfettiIdea", error);
      });
  }

  buttonAttent(userWantsTo:boolean) : void {
    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();
    this.api.joinKonfettiIdea(this.idea._id, userWantsTo, this.idea.userIsHelping).subscribe(
      (result:JoinResult)=>{
        this.idea.userIsHelping = result.isHelping;
        this.idea.userIsAttending = result.isAttending;
        loadingSpinner.dismiss().then();
        this.toastCtrl.create({
          message: this.translateService.instant('OK'),
          cssClass: 'toast-valid',
          duration: 2000
        }).present().then();
        return;
      }, 
      (error)=>{
        loadingSpinner.dismiss().then();
        console.log("FAIL joinKonfettiIdea", error);
      });
  }

  buttonOrgaChat() : void {

    // get all idea chats
    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();

    this.api.getChats(
      this.activeGroupId,
      "moduleGroupChat",
      this.persistence.getAppDataCache().userid,
      this.state.getUserInfo().nickname,
      this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null
    ).subscribe((chats:Array<Chat>) => {

      loadingSpinner.dismiss().then();

      // search thru chats
      let orgaChat:Chat = null;
      chats.forEach((chat)=>{
        if (chat._id==this.idea.orgaChatID) orgaChat = chat;
      });

      if (orgaChat!=null) {
        this.navCtrl.push(ChatPage, { chat: orgaChat } );
      } else {
        alert("FAIL ORGACHAT("+this.idea.orgaChatID+") NOT FOUND");
      }

    }, (error) => {
      loadingSpinner.dismiss().then();
      alert("TODO: Error on getting chatlist");
    });
  }

  buttonEditIdea() : void {
    this.navCtrl.push(IdeaEditPage, { idea: this.idea } );
  }

  buttonAdminCancel() : void {
    alert("TODO: Implement when delete endpoint available");
  }

  buttonKonfettiDistribution() : void {
    this.navCtrl.push(DistributionPage, { idea: this.idea } );
  }

}
