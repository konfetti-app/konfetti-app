import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import {AppStateProvider, LanguageInfo} from "../../providers/app-state/app-state";
import {AppPersistenceProvider} from "../../providers/app-persistence/app-persistence";

/**
 * Generated class for the MainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
    private events: Events
  ) {

    this.availableLanguages = appState.getAllAvailableLanguages();
    this.actualLanguage = appState.getActualAppLanguageInfo().locale;

  }

  changeLanguage(locale: string) : void {

    this.appState.updateActualAppLanguage(locale)
    this.appPersistence.setLocale(locale);
  }

  buttonProfile() {
    this.events.publish('init:goProfile');
  }

  ionViewDidLoad() {
  }

}
