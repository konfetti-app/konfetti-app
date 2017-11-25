import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { ApiProvider, User} from '../../providers/api/api';

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


  constructor(
    //private navCtrl: NavController,
    private params: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private loadingCtrl: LoadingController,
    private api: ApiProvider,
    private translateService: TranslateService
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  private updateDynamicDataUI() : void {

    // gez profile data from app state
    let user:User = this.appState.getUserInfo();

    // init form data from profile (old data)
    this.firstname = user.name;
    this.aboutme = user.description;
    this.spokenLangs = this.appState.fromLocaleArrayToLanguageInfos(user.spokenLanguages);

  }

  ionViewWillEnter() {

    // parse parameters when profile is opened
    if ((this.params!=null) && (this.params.data!=null)) {

      if ((typeof this.params.data.showAccountLink != 'undefined') && (this.params.data.showAccountLink != null)) {
        this.showAccountLink = this.params.data.showAccountLink;
      }

    }

    // update UI with old data
    this.updateDynamicDataUI();

    // show loading module
    let loadingModal = this.loadingCtrl.create({});
    loadingModal.present().then();

    // load profile data fresh from server
    this.api.getUser(this.appPersistence.getAppDataCache().userid).subscribe( (user) => {

      /*
       * WIN
       */

      // update user profile in app state
      this.appState.setUserInfo(user);

      // update UI with new data
      this.updateDynamicDataUI();

      // hide loading spinner
      loadingModal.dismiss().then();

    }, (error) => {

      /*
       * FAIL
       */

      // hide loading spinner
      loadingModal.dismiss().then();

      // TODO: handle expection

    });


  }

  storeFirstname() : void {
    if ( this.firstname === this.appState.getUserInfo().name ) return;
    this.storeToBackendApi();
  }

  storeAboutMe() : void {
    if ( this.aboutme === this.appState.getUserInfo().description ) return;
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
        checked: (this.appState.getUserInfo().spokenLanguages.indexOf(lang.locale)>=0)
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
        let user:User = this.appState.getUserInfo();
        user.spokenLanguages = localeArray;
        this.appState.setUserInfo(user);

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
    console.error("TODO: Store Data back to API");

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
