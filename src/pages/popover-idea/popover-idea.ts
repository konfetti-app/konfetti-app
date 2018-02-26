import { 
  Component 
} from '@angular/core';
import { 
  IonicPage,
   NavController, 
   NavParams,
   ViewController,
   Events
} from 'ionic-angular';

import { Idea, PushNotification } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-popover-idea',
  templateUrl: 'popover-idea.html',
})
export class PopoverIdeaPage {

  idea:Idea;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private events: Events,
    private viewCtrl: ViewController
  ) {

    this.idea = this.navParams.get("idea") as Idea;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverIdeaPage');
  }

  buttonMoreDetails() : void {
    let simulatedNotification: PushNotification = {} as PushNotification;
    simulatedNotification.module = "ideas";
    simulatedNotification.groupId = this.idea.parentNeighbourhood;
    simulatedNotification.itemID = this.idea._id;
    this.events.publish("notification:process", simulatedNotification);
    this.viewCtrl.dismiss({ success: true } ).then();
  }

}
