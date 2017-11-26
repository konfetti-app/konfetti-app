import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import {
  IonicPage,
  NavParams,
  ViewController,
  AlertController,
  LoadingController,
  ToastController,
  ActionSheetController
} from 'ionic-angular';

import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { ApiProvider, User, UserUpdate } from '../../providers/api/api';

import { Camera, CameraOptions } from '@ionic-native/camera';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  /*
   * following parameters can be set in navParams
   */

  // show a info for user to change to the account & password dialog
  showAccountLink : boolean = true;

  /*
   * following vars are just part of the class
   */

  spokenLangs : Array<LanguageInfo>;
  nickname : string = "";
  aboutme : string = "";
  avatarUrl : string = "";

  /*
   * flag if data git changed
   */
  dataChanged : boolean = false;

  /*
   *
   */
  @ViewChild('fileInput') fileInputElement: ElementRef;

  constructor(
    //private navCtrl: NavController,
    private params: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private loadingCtrl: LoadingController,
    private api: ApiProvider,
    private toastCtrl: ToastController,
    private camera: Camera,
    private translateService: TranslateService,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  private updateDynamicDataUI() : void {

    // gez profile data from app state
    let user:User = this.appState.getUserInfo();

    // init form data from profile (old data)
    this.nickname = user.nickname;
    this.aboutme = user.description;
    this.spokenLangs = this.appState.fromLocaleArrayToLanguageInfos(user.spokenLanguages);

    // data in sync with API
    this.dataChanged = false;

    this.updateDynamicImageUI();

  }

  private updateDynamicImageUI() : void {
    if ((this.appState.getUserInfo().avatar) && (this.appState.getUserInfo().avatar.filename)) {
      // set image
      this.avatarUrl = this.api.buildImageURL(this.appState.getUserInfo().avatar.filename);
    } else {
      this.avatarUrl = "";
    }
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

  onChangeNickname() : void {
    if (this.nickname === this.appState.getUserInfo().nickname) return;
    this.dataChanged = true;
  }

  onChangeAbout() : void {
    if ( this.aboutme === this.appState.getUserInfo().description ) return;
    this.dataChanged = true;
  }

  onChangeFile(event) {

    let files = event.srcElement.files;
    console.log("FILES");
    console.dir(files);
    this.uploadImageToServer(files[0]);

  }

  uploadImageToServer(file:any) : void {

    // show loading module
    let loadingModal = this.loadingCtrl.create({});
    loadingModal.present().then();

    // upload image to API
    this.api.setUserAvatarImage(file).subscribe( (fileMeta) => {

      // update avatar on user app state
      let user: User = this.appState.getUserInfo();
      user.avatar = fileMeta.asset;
      this.appState.setUserInfo(user);

      // update ui
      this.updateDynamicImageUI();
      this.dataChanged = true;

      // hide loading spinner
      loadingModal.dismiss().then();

    }, (error) => {

      // hide loading spinner
      loadingModal.dismiss().then();

      console.log("FAIL");
      console.dir(error);

    });
  }

  buttonChangeProfilePicture() : void {

    if (this.appState.isRunningOnRealDevice()) {

      /*
       * On Real Device
       */

      // TODO: i18n
      this.actionSheetCtrl.create({
        buttons: [
          {
            text: 'Camera',
            icon: 'camera',
            handler: () => {
              this.getPictureFromCamera(false);
            }
          },{
            text: 'Gallery',
            icon: 'images',
            handler: () => {
              this.getPictureFromCamera(true);
            }
          },{
            text: 'Cancel',
            role: 'cancel',
            icon: 'close',
            handler: () => {}
          }
        ]
      }).present().then();

    } else {

      /*
       * On Browser (mostly during development)
       */

      this.fileInputElement.nativeElement.click();

    }

  }

  getPictureFromCamera(fromGallery:boolean) : void {

    const options: CameraOptions = {
      sourceType: fromGallery ? this.camera.PictureSourceType.PHOTOLIBRARY : this.camera.PictureSourceType.CAMERA,
      quality: 90,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 200,
      targetHeight: 200,
      allowEdit: true,
      cameraDirection: 1
    };

    this.camera.getPicture(options).then((imageData) => {

      /*
       * WIN
       */

      this.uploadImageToServer( this.api.dataURItoBlob( "data:image/jpeg;base64," + imageData) );

    }, (err) => {

      /*
       * FAIL
       */

      console.log("FAIL CAM");
      console.dir(err);

      // TODO: if not backbutton or cancel by user - show error toast

    });

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

        // mark that changed
        this.dataChanged = true;

      }
    });

    selectionDialog.onDidDismiss(() => {
    });

    selectionDialog.present().then(  );

  }

  buttonPasswordAndAccount(): void {
    this.viewCtrl.dismiss({ success: false , command: 'goAccount'} ).then();
  }

  buttonClose(): void {

    if (!this.dataChanged) {
      this.viewCtrl.dismiss({ success: true } ).then();
      return;
    }

    let userUpdate = new UserUpdate();
    userUpdate.nickname = this.nickname;
    userUpdate.description = this.aboutme;
    userUpdate.spokenLanguages = this.appState.getUserInfo().spokenLanguages;
    this.api.updateUserInfo(this.appPersistence.getAppDataCache().userid,userUpdate).subscribe(
      user => {

        /*
         * WIN
         */

        // update user in app state (keep hoods because on this endpoint they are not populated)
        user.neighbourhoods = this.appState.getUserInfo().neighbourhoods;
        this.appState.setUserInfo(user);

        // TODO: i18n
        this.toastCtrl.create({
          message: this.translateService.instant('Changes Saved'),
          cssClass: 'toast-valid',
          duration: 2000
        }).present().then();

        setTimeout(()=>{
          this.viewCtrl.dismiss({ success: true } ).then();
        },1300);

      },
      error => {

        /*
         * FAIL
         */

        // TODO: i18n
        this.toastCtrl.create({
          message: this.translateService.instant('Changes NOT Saved'),
          cssClass: 'toast-invalid',
          duration: 2000
        }).present().then();

        this.viewCtrl.dismiss({ success: false } ).then();

      }
    );

  }

}
