import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { MenuController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {

  availableLanguages: Array<LanguageInfo>;
  actualLanguage: string;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private events: Events,
    private menuController : MenuController
  ) {

    this.availableLanguages = appState.getAllAvailableLanguages();
    this.actualLanguage = appState.getActualAppLanguageInfo().locale;

  }

  buttonProfile() {
    this.events.publish('init:goProfile');
  }

  buttonQRCodeScan() {
    alert('TODO');
  }

  ionViewDidLoad() {
  }

}
