import { Component } from '@angular/core';
import {IonicPage, ToastController, ViewController} from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import {AppVersion} from "@ionic-native/app-version";

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  availableLanguages: Array<LanguageInfo>;
  actualLanguage: LanguageInfo;
  versionString: string = "Browser";

  constructor(
    private viewCtrl: ViewController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private appVersion: AppVersion,
    private toastCtrl: ToastController
    ) {

      // get version strings
      if (this.appState.isRunningOnRealDevice()) {
        try {
          this.appVersion.getVersionNumber().then((number) => {
            this.versionString = number;
          });
        } catch (e) {
          console.log("App-Version not Available");
        }
     } else {
        this.versionString = this.appState.getAppBuildTime();
     }

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

  buttonResetApp() : void {
    this.appPersistence.resetAll().subscribe( (none) => {
      try {
        navigator['app'].exitApp();
      } catch (e) {}
      this.toastCtrl.create({
        message: 'CLOSE and RESTART APP',
        duration: 5000
      }).present().then();
    });
  }

  buttonClose(): void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

  compareLangs(lang1:LanguageInfo, lang2:LanguageInfo) : boolean {
    return lang1.locale === lang2.locale;
  }

}
