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

import { ApiProvider, Post } from '../../providers/api/api';

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

    /*
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    this.events.subscribe("new:ideas", () => {
      console.log("Eventbus: New Idea");
      this.buttonNew();
    });

  }

  // unsubscribe from event bus when component gets destroyed
  ngOnDestroy() {
      this.events.unsubscribe("new:ideas");
  }

  vote() {
    this.votecount++;
    this.voted = true;
    this.events.publish("main:konfettirain", null);
  }

  public openIdea(idea: Post) {
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
