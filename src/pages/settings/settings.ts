import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
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
    private viewCtrl: ViewController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider) {
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

  buttonClose(): void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

  compareLangs(lang1:LanguageInfo, lang2:LanguageInfo) : boolean {
    return lang1.locale === lang2.locale;
  }

}
