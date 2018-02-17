import { 
  Component, 
  Input 
} from '@angular/core';
import { 
  Events,
  ModalController,
  Modal,
  NavController
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ApiProvider, Post, PushNotification, Idea } from '../../providers/api/api';

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

  votecount:number = 10;
  voted:boolean = false;

  // sorted categories
  allIdeasOpen:Array<Idea> = [];
  allIdeasDone:Array<Idea> = [];
  myIdeasAdmin:Array<Idea> = [];
  myIdeasHelp:Array<Idea> = [];
  hiddenIdeasAll:Array<Idea> = [];

  constructor(
    private api: ApiProvider,
    private state: AppStateProvider,
    private events: Events,
    private persistence: AppPersistenceProvider,
    private translateService : TranslateService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
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

    this.api.getKonfettiIdeas(this.activeGroupId).subscribe((ideas:Array<Ideas>) => {

      // sort into category
      this.hiddenIdeasAll = ideas;
      this.allIdeasOpen = [];
      this.allIdeasDone = [];
      this.myIdeasAdmin = [];
      this.myIdeasHelp = [];
      ideas.forEach((idea:Idea)=>{
        this.allIdeasDone.push(idea);
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
  
      // get matching chat from list
      this.hiddenIdeasAll.forEach((idea:Idea)=>{
        if (idea._id==notification.itemID) {
          console.log("processNotification: open Idea");
          // TODO: What if the caht is to open?
          this.openIdea(idea);
        }
      });
    
    }

  vote() {
    this.votecount++;
    this.voted = true;
    this.events.publish("main:konfettirain", null);
  }

  public openIdea(idea: Idea) {
    this.navCtrl.push(IdeaPage, idea);
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
            notice: 'Wir brauchen noch Name und Foto von dir, bevor du eine Idee anlegen kannst.'
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
            notice: 'Wir brauchen noch ein Foto von dir, bevor du einen neue Idee anlegen kannst.'
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
