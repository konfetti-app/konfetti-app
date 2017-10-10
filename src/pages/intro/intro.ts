import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { MenuController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

/**
 * Generated class for the IntroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
    private translateService: TranslateService
  ) {

    this.availableLanguages = appState.getAllAvailableLanguages();
    this.actualLanguage = appState.getActualAppLanguageInfo();

    this.slidesMaxHeight = this.appState.getDisplayHeight() - 275;

  }

  buttonChangeLanguage() : void {

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

    selectionDialog.present().then();
  }

  changeLanguage(locale: string) : void {
    this.appState.updateActualAppLanguage(locale)
    this.appPersistence.setLocale(locale);
    this.actualLanguage = this.appState.getActualAppLanguageInfo();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IntroPage');
  }

}
