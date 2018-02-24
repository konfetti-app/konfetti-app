import { 
  Component 
} from '@angular/core';
import { 
  IonicPage,
   NavController, 
   NavParams 
} from 'ionic-angular';

import { Idea } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-popover-idea',
  templateUrl: 'popover-idea.html',
})
export class PopoverIdeaPage {

  idea:Idea;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams
  ) {

    this.idea = this.navParams.get("idea") as Idea;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverIdeaPage');
  }

}
