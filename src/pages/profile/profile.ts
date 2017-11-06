import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
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

  constructor(
    private navCtrl: NavController,
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

    // update profile data
    // Todo

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
        checked: false //( lang.locale === this.actualLanguage.locale )
      });
    });

    selectionDialog.addButton({
      text: this.translateService.instant('OK'),
      handler: (data: string) => {

        // data is an array of locales

        console.log('Dialog Result', data);
        alert("Persist");
      }
    });

    selectionDialog.onDidDismiss(() => {
    });

    selectionDialog.present().then(  );

  }

  buttonSaveProfile() : void {
    // TODO
    alert("TODO: Persist Profile");
    this.viewCtrl.dismiss({ success: true } ).then();
  }

  buttonPasswordAndAccount(): void {
    this.viewCtrl.dismiss({ success: false , command: 'goAccount'} ).then();
  }

  buttonClose(): void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

}
