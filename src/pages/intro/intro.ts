import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Modal } from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { CodeRedeemPage } from "../code-redeem/code-redeem";
import { LoginPage } from "../login/login";
import { MainPage } from "../main/main";

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  public showHeader: boolean = false;
  public slidesMaxHeight : number = 100;

  availableLanguages: Array<LanguageInfo>;
  actualLanguage: LanguageInfo;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private menuController : MenuController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private modalCtrl: ModalController
  ) {

    this.availableLanguages = appState.getAllAvailableLanguages();
    this.actualLanguage = appState.getActualAppLanguageInfo();

    this.slidesMaxHeight = this.appState.getDisplayHeight() - 275;

  }

  buttonChangeLanguage(callback : any = null) : void {

    let selectionDialog = this.alertCtrl.create();
    selectionDialog.setTitle(this.translateService.instant('SELECT_LANG'));

    this.availableLanguages.forEach( lang => {
      selectionDialog.addInput({
        type: 'radio',
        label: lang.displayname,
        value: lang.locale,
        checked: ( lang.locale === this.actualLanguage.locale )
      });
    });

    selectionDialog.addButton({
      text: this.translateService.instant('OK'),
      handler: (data: string) => {
        this.changeLanguage(data);
      }
    });

    selectionDialog.onDidDismiss(() => {
      if (callback!=null) callback();
    });

    selectionDialog.present().then(  );
  }

  buttonRedeemCode() : void {
    let modal : Modal = this.modalCtrl.create(CodeRedeemPage, {});
    modal.onDidDismiss(data => {
      if ((data != null) && (typeof data.success != 'undefined') && (data.success)) {
        this.navCtrl.setRoot(MainPage, {showIntro:true}).then();
      }
    });
    modal.present().then();
  }

  buttonLogin() : void {
    let modal : Modal = this.modalCtrl.create(LoginPage, { modus: 'login' });
    modal.onDidDismiss(data => {
      console.log('Data',data);
      if ((data != null) && (typeof data.success != 'undefined') && (data.success)) {
        this.navCtrl.setRoot(MainPage, {showIntro:false}).then();
      }
    });
    modal.present().then();
  }

  changeLanguage(locale: string) : void {
    this.appState.updateActualAppLanguage(locale)
    this.appPersistence.setLocale(locale);
    this.actualLanguage = this.appState.getActualAppLanguageInfo();
  }

  sendUserToGetRegistered() : void {
    let modal : Modal = this.modalCtrl.create(LoginPage, { modus: 'register' });
    modal.onDidDismiss(data => {
      if ((data == null) || (typeof data.success == 'undefined') || (!data.success)) {
        this.sendUserToGetRegistered();
      }
    });
    modal.present().then();
  }

  ionViewDidLoad() {
    // TODO turn back on on release
    // on Browser users need to register first
    /*
    if (!this.appState.isRunningOnRealDevice()) {
      this.buttonChangeLanguage( () => {
        this.sendUserToGetRegistered();
      });
    }
    */

  }

}
