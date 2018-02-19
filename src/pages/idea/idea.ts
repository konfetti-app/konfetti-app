import { Component } from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  ToastController, 
  NavParams 
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { ApiProvider, Idea } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-idea',
  templateUrl: 'idea.html',
})
export class IdeaPage {

  idea:Idea;
  calculatesState:string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private translateService: TranslateService
  ) {

    // get idea from parameter and init data
    this.idea = this.navParams.get("idea") as Idea;
    if (this.idea==null) this.idea = {} as Idea;
    this.calculatesState = (this.idea.konfettiUser==0) ? 'vote' : 'voted';
    if ( new Date(this.idea.date).getTime() < Date.now() ) this.calculatesState = 'done';

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeaPage');
  }

  vote() : void {
    if (this.calculatesState!='vote') return;
    alert("TODO: When voting ready on module - copy over");
  }

  buttonJoin() : void {
    // TODO
    this.idea.userIsAttending = true;
  }

  buttonOrgaChat() : void {
    alert("TODO");
  }

}
