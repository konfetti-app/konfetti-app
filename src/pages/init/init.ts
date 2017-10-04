import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ApiProvider} from "../../providers/api/api";
import {AppStateProvider} from "../../providers/app-state/app-state";

/**
 * Generated class for the InitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-init',
  templateUrl: 'init.html',
})
export class InitPage {

  constructor(public navCtrl: NavController,
              public events: Events,
              public navParams: NavParams,
              public api: ApiProvider,
              private appState: AppStateProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InitPage');
  }

  buttonStart() {

    if (this.appState.getAppDataCache().i18nLocale === 'en') {
      this.appState.setLocale('de');
    } else {
      this.appState.setLocale('en');
    }

    this.events.publish('init:goMain');
  }

}
