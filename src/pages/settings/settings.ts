import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MainPage } from "../main/main";
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  availableLanguages: Array<LanguageInfo>;
  actualLanguage: LanguageInfo;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,) {
      this.actualLanguage = this.appState.getActualAppLanguageInfo();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  ionViewWillEnter() {
    this.availableLanguages = this.appState.getAllAvailableLanguages();
    this.actualLanguage = this.appState.getActualAppLanguageInfo();
  }

  changeLanguage() : void {
    this.appState.updateActualAppLanguage(this.actualLanguage.locale);
    this.appPersistence.setLocale(this.actualLanguage.locale);
  }

  buttonHome() : void {
    this.navCtrl.setRoot(MainPage, {showIntro:false}).then();
  }

  compareLangs(lang1:LanguageInfo, lang2:LanguageInfo) : boolean {
    return lang1.locale === lang2.locale;
  }

}
