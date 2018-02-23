import { 
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  ToastController, 
  NavParams,
  LoadingController,
  ActionSheetController,
  Platform
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { ApiProvider, Idea, Chat, JoinResult } from '../../providers/api/api';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ChatPage } from '../../pages/chat/chat';
import { IdeaEditPage } from '../../pages/idea-edit/idea-edit';
import { DistributionPage } from '../../pages/distribution/distribution';
import { ParticlesProvider } from '../../providers/particles/particles';

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

  // for the particle
  @ViewChild('canvasObj') canvasElement : ElementRef;
  isPlaying:boolean = false;

  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    private persistence: AppPersistenceProvider,
    private state: AppStateProvider,
    private actionSheetCtrl: ActionSheetController,
    private konfettiRain: ParticlesProvider,
    private platform: Platform,
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
    setTimeout(() => {
      try {
        this.konfettiRain.initialiseCanvas(this.canvasElement.nativeElement, this.platform.width(), this.platform.height());
      } catch (e) {
        alert("FAILED to init this.canvasElement.nativeElement");
      }
    }, 300);
  }

  ionViewWillEnter() {
  }  

  vote() : void {

    if (this.isPlaying) return;
    if (this.calculatesState!='vote') return;
    if (this.idea.konfettiUser>0) return;

    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();

    this.api.voteKonfettiIdea(this.idea._id, 1).subscribe(
      (win)=>{

        loadingSpinner.dismiss().then();

        this.idea.konfettiUser = this.idea.konfettiUser + 1;
        this.idea.konfettiTotal=win.konfettiIdea;
        this.calculatesState = "voted";

        this.isPlaying = true;
        this.konfettiRain.startAnimation(500, 6500, ()=>{
          this.isPlaying = false;
        });

        this.toastCtrl.create({
          message: this.translateService.instant('IDEA_EVENTVOTE1'),
          cssClass: 'toast-valid',
          duration: 5000
        }).present().then();

      },
      (error)=>{
        console.log("FAILED VOTE: ",error);
        loadingSpinner.dismiss().then();
      }
    );
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
        this.toastCtrl.create({
          message: this.translateService.instant('OK'),
          cssClass: 'toast-valid',
          duration: 2000
        }).present().then();
        setTimeout(()=>{loadingSpinner.dismiss().then();},2000);
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
        this.toastCtrl.create({
          message: this.translateService.instant('OK'),
          cssClass: 'toast-valid',
          duration: 2000
        }).present().then();
        setTimeout(()=>{loadingSpinner.dismiss().then();},2000);
        return;
      }, 
      (error)=>{
        loadingSpinner.dismiss().then();
        console.log("FAIL joinKonfettiIdea", error);
      });
  }

  // gets the chat object from id
  loadOrgaChat(callback:Function) {

        // get all idea chats
        let loadingSpinner = this.loadingCtrl.create({
          content: ''
        });
        loadingSpinner.present().then();
    
        this.api.getChats(
          this.activeGroupId,
          "moduleIdeas",
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
            callback(orgaChat);
          } else {
            alert("FAIL ORGACHAT("+this.idea.orgaChatID+") NOT FOUND");
          }
    
        }, (error) => {
          loadingSpinner.dismiss().then();
          alert("TODO: Error on getting chatlist");
        });
  }

  buttonOrgaChat() : void {
    this.loadOrgaChat((orgaChat:Chat) => {
      this.navCtrl.push(ChatPage, { chat: orgaChat } );
    });
  }

  buttonEditIdea() : void {
    this.navCtrl.push(IdeaEditPage, { idea: this.idea } );
  }

  buttonAdminCancel() : void {
    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();
    this.api.deleteKonfettiIdea(this.idea._id).subscribe(
      (win)=>{
        loadingSpinner.dismiss().then();
        this.toastCtrl.create({
          message: this.translateService.instant('OK'),
          cssClass: 'toast-invalid',
          duration: 2000
        }).present().then();
      },
      (error)=>{
        loadingSpinner.dismiss().then();
        this.toastCtrl.create({
          message: this.translateService.instant('FAIL'),
          cssClass: 'toast-invalid',
          duration: 2000
        }).present().then();
      }
    );
  }

  buttonKonfettiDistribution() : void {
    this.loadOrgaChat((orgaChat:Chat)=>{
      this.navCtrl.push(DistributionPage, 
        { 
          idea: this.idea,  
          chat: orgaChat
        } );
    });
  }

}
