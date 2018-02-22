import { 
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import { 
  IonicPage,
   NavController, 
   NavParams,
   LoadingController,
   ToastController,
   Platform
} from 'ionic-angular';

import { ApiProvider, Idea, Chat, Message } from '../../providers/api/api';
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';

import { ParticlesProvider } from '../../providers/particles/particles';
import { TranslateService } from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-distribution',
  templateUrl: 'distribution.html',
})
export class DistributionPage {

  idea:Idea;
  chat:Chat;
  helpers:Array<any>;

  authorSelected:boolean = true;

  // for the particle test
  @ViewChild('canvasObj') canvasElement : ElementRef;
  public isPlaying : boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    private persistence: AppPersistenceProvider,
    private konfettiRain: ParticlesProvider,
    private platform: Platform,
    private toastCtrl: ToastController,
    private translateService: TranslateService
  ) {

    // get data from parameter
    this.idea = this.navParams.get("idea") as Idea;
    this.chat = this.navParams.get("chat") as Chat;

    console.dir(this.chat);

    this.loadHelpingMembers();
  }

  loadHelpingMembers() {
    let loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    loadingSpinner.present().then();
    this.api.getChatMessages(this.chat, 0).subscribe(
      (win:Array<Message>)=>{

        let directory:Array<boolean> = [];
        this.helpers = [];

        // go thru all messages and collect all unique persons
        win.forEach((msg:Message)=>{
          if ((!directory[msg.parentUser._id]) 
          && (this.persistence.getAppDataCache().userid!=msg.parentUser._id)) {
            directory[msg.parentUser._id] = true;
            this.helpers.push(msg.parentUser);
          }
        });

        // prepare user data
        this.helpers.forEach(helper => {
          helper.selected = true;
          helper.displayImage = "./assets/imgs/default-user.jpg";
          if ((helper.avatar) && (helper.avatar.filename)) {
            helper.displayImage = this.api.buildImageURL(helper.avatar.filename);
          }
        });

        loadingSpinner.dismiss().then();
      },
      (error)=>{
        loadingSpinner.dismiss().then();
        alert("FAIL: Get Helpers");
        this.navCtrl.pop();
      });
  }

  buttonKonfettiDistribution() : void {
    if (this.isPlaying) return;
    alert("TODO make server request");
    this.startAnimation();
  }

  clickAuthor() {
    this.authorSelected = !this.authorSelected;
  }

  clickHelper(helper:any) {
    helper.selected = !helper.selected;
  }

  public startAnimation() : void
  {
     this.isPlaying = true;
     this.konfettiRain.startAnimation(500, 6500, ()=>{
       this.isPlaying = false;
       this.navCtrl.popToRoot();
     });

     this.toastCtrl.create({
      message: this.translateService.instant('IDEADISTRO_THANKS'),
      cssClass: 'toast-valid',
      duration: 6000
    }).present().then();
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


}
