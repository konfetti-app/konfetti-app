import { 
  Component, 
  Input 
} from '@angular/core';
import { 
  Events,
  ModalController,
  Modal,
  LoadingController,
  NavController,
  ToastController,
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ApiProvider, PushNotification, Idea } from '../../providers/api/api';

import { IdeaPage } from '../../pages/idea/idea';
import { IdeaEditPage } from '../../pages/idea-edit/idea-edit';
import { ProfilePage } from '../../pages/profile/profile';

@Component({
  selector: 'module-ideas',
  templateUrl: 'module-ideas.html'
})
export class ModuleIdeasComponent {

  @Input() config = null;

  // true if network request is going on
  loading:boolean = false;

  // flag is running on iOS
  isIOS: boolean;

  // the neighborhoodId the newsfeed is working on
  activeGroupId: string;

  // selected tab
  tab:string = 'all';

  // sorted categories
  allIdeasOpen:Array<Idea> = [];
  allIdeasDone:Array<Idea> = [];
  myIdeasAdmin:Array<Idea> = [];
  myIdeasHelp:Array<Idea> = [];
  myIdeasVisit:Array<Idea> = [];
  hiddenIdeasAll:Array<Idea> = [];

  constructor(
    private api: ApiProvider,
    private state: AppStateProvider,
    private events: Events,
    private persistence: AppPersistenceProvider,
    public translate : TranslateService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {

    this.isIOS = this.state.isIOS();

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

    // get fresh data
    this.refreshData();

    /*
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    this.events.subscribe("new:ideas", () => {
      console.log("Eventbus: New Idea");
      this.buttonNew();
    });

    this.events.subscribe("refresh:ideas", () => {
      console.log("Eventbus: Refresh Ideas");
      if (!this.loading) {
        console.log("Refreshing idea list ...");
        this.refreshData();
      } else {
        console.log("Ignore refresh ... because still in loading process.");
      }
    });

    this.events.subscribe("push:ideas", (notification:PushNotification) => {
      console.log("Eventbus: Notification on Idea");
      this.processNotification(notification);
    });

  }

  // unsubscribe from event bus when component gets destroyed
  ngOnDestroy() {
    this.events.unsubscribe("new:ideas");
    this.events.unsubscribe("refresh:ideas");
    this.events.unsubscribe("push:ideas");
  }

  private refreshData(): void {
   
    this.loading = true;

    console.log("Refreshing Idea Module");
    this.api.getKonfettiIdeas(
      this.activeGroupId,
      this.persistence.getAppDataCache().userid,
      this.state.getUserInfo().nickname,
      this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null
    ).subscribe((ideas:Array<Idea>) => {

      // clear categories
      this.hiddenIdeasAll = ideas;
      this.allIdeasOpen = [];
      this.allIdeasDone = [];
      this.myIdeasAdmin = [];
      this.myIdeasHelp = [];
      this.myIdeasVisit= [];

      // sort into category
      ideas.forEach((idea:Idea)=> {
        // ALL TABS
        let ideaTS:number = new Date(idea.date).getTime();
        let nowTS:number = Date.now();
        if ( ideaTS > nowTS ) {
          // A) upcomming
          this.allIdeasOpen.push(idea);
        } else {
          // B) happend
          this.allIdeasDone.push(idea);
        }
        // MY TABS
        if (idea.userIsAdmin) {
          // A) Admin
          if (( ideaTS > nowTS ) || ( idea.konfettiTotal>0 )) {
            this.myIdeasAdmin.push(idea);
          }  
        } else
        if (idea.userIsHelping) {
          //B) Helper
          if ( ideaTS > nowTS ) {
            this.myIdeasHelp.push(idea);
          }  
        } else 
        if (idea.userIsAttending) {
          // C) Attending
          if ( ideaTS > nowTS ) {
            this.myIdeasVisit.push(idea);
          }  
        }
      });

      // TODO: sort single cards by creation or last active TS
      
      // sort all open by most konfetti on top
      this.allIdeasOpen.sort((a:Idea, b:Idea)=> {
        return b.konfettiTotal-a.konfettiTotal;
      });

      // sort the rest by created ts
      this.allIdeasDone.sort((a:Idea, b:Idea) => {
        return b.created.ts-a.created.ts;
      });
      this.myIdeasAdmin.sort((a:Idea, b:Idea) => {
        return b.created.ts-a.created.ts;
      });
      this.myIdeasHelp.sort((a:Idea, b:Idea) => {
        return b.created.ts-a.created.ts;
      });
      this.myIdeasVisit.sort((a:Idea, b:Idea) => {
        return b.created.ts-a.created.ts;
      });

      this.loading = false;

    }, (error) => {
      this.loading = false;
      alert("TODO: Error on getting idealist");
    });

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
  
      // get matching idea from list
      let found:boolean = false;
      this.hiddenIdeasAll.forEach((idea:Idea)=>{
        if (idea._id==notification.itemID) {
          console.log("processNotification: open Idea");
          found=true;
          this.openIdea(idea, false);
        }
        if (idea.orgaChat==notification.itemID) {
          found=true;
          this.openIdea(idea, true);
        }
      });
      console.log("Notification itemID('"+notification.itemID+"') found --> "+found);

    }

  vote(idea:Idea) {

    if (idea.konfettiUser>0) {
      // TODO: allow more votes from one user later if user has konfetti
      console.log("User already voted free vote - TODO: allow more than one vote if user has konfetti");
      return;
    }

    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();

    this.api.voteKonfettiIdea(idea._id, 1).subscribe(
      (win)=>{

        loadingSpinner.dismiss().then();

        idea.konfettiUser++;
        idea.konfettiTotal=win.konfettiIdea;
        this.events.publish("main:konfettirain", null);

        this.toastCtrl.create({
          message: this.translate.instant('IDEA_EVENTVOTE1'),
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

  public openIdea(idea: Idea, openChat:boolean) {
    console.log("idea",idea);
    this.navCtrl.push(IdeaPage, { idea: idea, openChat: openChat});
  }

  // user wants to create a new group chat
  public buttonNew() : void {

      // check if user has already set profile for chat
      if (!this.state.isMinimalUserInfoSet(true)) {

        if (!this.state.isMinimalUserInfoSet()) {

          // user needs to set profile namen and photo first
          let modal: Modal = this.modalCtrl.create(ProfilePage, {
            showAccountLink: false,
            photoNeeded: true, 
            notice: this.translate.instant('IDEA_NEEDNAMEFOTO') 
          });
          modal.onDidDismiss(data => {
            if (this.state.isMinimalUserInfoSet(true)) this.buttonNew();
          });
          modal.present().then();

        } else {

          // user has name set but is missing still photo
          let modal: Modal = this.modalCtrl.create(ProfilePage, {
            showAccountLink: false,
            photoNeeded: true,
            notice: this.translate.instant('IDEA_NEEDFOTO')
          });
          modal.onDidDismiss(data => {
            if (this.state.isMinimalUserInfoSet(true)) this.buttonNew();
          });
          modal.present().then();

        }

      } else {
        this.navCtrl.push(IdeaEditPage, {});
      }
  }

}
