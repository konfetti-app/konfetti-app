import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, AlertController } from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import {AppData, AppPersistenceProvider} from "../../providers/app-persistence/app-persistence";
import { TranslateService } from "@ngx-translate/core";

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  /**
   * following parameters can be set in navParams
   */

  // show a info for user to change to the account & password dialog
  showAccountLink : boolean = true;

  /**
   * following vars are just part of the class
   */

  spokenLangs : Array<LanguageInfo>;
  firstname : string = "";
  aboutme : string = "";

  persistedData : AppData;


  constructor(
    //private navCtrl: NavController,
    private params: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private translateService: TranslateService
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }


  ionViewWillEnter() {

    // parse parameters when profile is opened
    if ((this.params!=null) && (this.params.data!=null)) {

      if ((typeof this.params.data.showAccountLink != 'undefined') && (this.params.data.showAccountLink != null)) {
        this.showAccountLink = this.params.data.showAccountLink;
      }

    }

    // get profile data form persistence
    this.persistedData = this.appPersistence.getAppDataCache();
    if (this.persistedData.spokenLanguages.length==0) this.persistedData.spokenLanguages.push(this.appState.getActualAppLanguageInfo().locale);

    // init form data from profile
    this.firstname = this.persistedData.name;
    this.aboutme = this.persistedData.description;
    this.spokenLangs = this.appState.fromLocaleArrayToLanguageInfos(this.persistedData.spokenLanguages);

  }

  storeFirstname() : void {
    if ( this.firstname === this.persistedData.name ) return;
    this.storeToBackendApi();
  }

  storeAboutMe() : void {
    if ( this.aboutme === this.persistedData.description ) return;
    this.storeToBackendApi();
  }

  buttonChangeProfilePicture() : void {
    alert("TODO: take picture from cam or file");
  }

  buttonEditSpokenLangs() : void {

    let selectionDialog = this.alertCtrl.create();
    selectionDialog.setTitle(this.translateService.instant('SELECT_LANG'));

    this.appState.getAllAvailableLanguages().forEach( lang => {

      selectionDialog.addInput({
        type: 'checkbox',
        label: lang.displayname,
        value: lang.locale,
        checked: (this.persistedData.spokenLanguages.indexOf(lang.locale)>=0)
      });
    });

    selectionDialog.addButton({
      text: this.translateService.instant('OK'),
      handler: (data: string) => {

        // if user selected no language, then  ignore
        if (data.length==0) return;

        // convert string[] to Array<string> of locales
        let localeArray : Array<string> = new Array<string>();
        for (let i=0; i < data.length; i++) localeArray.push(data[i]);

        // update form data
        this.spokenLangs = this.appState.fromLocaleArrayToLanguageInfos(localeArray);
        this.persistedData.spokenLanguages = localeArray;

        // persist
        this.storeToBackendApi();

      }
    });

    selectionDialog.onDidDismiss(() => {
    });

    selectionDialog.present().then(  );

  }

  storeToBackendApi() : void {

    // TODO: store to backend API

    // persist locally
    
    //TODO temporarily disabled
    // this.appPersistence.setUserProfile(this.firstname, this.aboutme, this.persistedData.spokenLanguages);
    
    this.persistedData = this.appPersistence.getAppDataCache();
    /*
    this.toastCtrl.create({
      message: this.translateService.instant('Changes Saved'),
      duration: 1000
    }).present().then();
    */

  }

  buttonPasswordAndAccount(): void {
    this.viewCtrl.dismiss({ success: false , command: 'goAccount'} ).then();
  }

  buttonClose(): void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

}
