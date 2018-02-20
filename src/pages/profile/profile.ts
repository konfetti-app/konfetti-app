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

import { Keyboard } from '@ionic-native/keyboard';

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

  // show a custiom notice
  notice : string = "";

  photoNeeded : boolean = false;

  /*
   * following vars are just part of the class
   */

  spokenLangs : Array<LanguageInfo>;
  nickname : string = "";
  aboutme : string = "";
  avatarUrl : string = "";
  username: string = "";
  password: string = "";

  /*
   * flag if data git changed
   */
  dataChanged : boolean = false;

  // flag is running on iOS
  isIOS: boolean;

  /*
   *
   */
  @ViewChild('fileInput') fileInputElement: ElementRef;

  constructor(
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
    private actionSheetCtrl: ActionSheetController,
    private keyboard: Keyboard
  ) {

    this.isIOS = appState.isIOS();

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

    this.username = this.appPersistence.getAppDataCache().username;
    if (this.username.startsWith('konfettiUser-')) this.username = '';
    this.password = "";

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

  ionViiwWillLeave() {
    this.keyboard.disableScroll(false);
  }

  ionViewWillEnter() {

    this.keyboard.disableScroll(true);

    // parse parameters when profile is opened
    if ((this.params!=null) && (this.params.data!=null)) {

      if ((typeof this.params.data.showAccountLink != 'undefined') && (this.params.data.showAccountLink != null)) {
        this.showAccountLink = this.params.data.showAccountLink;
      }

      if ((typeof this.params.data.notice != 'undefined') && (this.params.data.notice != null)) {
        this.notice= this.params.data.notice;
      }

      if ((typeof this.params.data.photoNeeded != 'undefined') && (this.params.data.photoNeeded != null)) {
        this.photoNeeded = this.params.data.photoNeeded;
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

  onChangeUsername() : void {
    if ( this.username === this.appPersistence.getAppDataCache().username ) return;
    this.dataChanged = true;
  }

  onChangePassword() : void {
    if (this.password.trim().length>0) this.dataChanged = true;
  }

  onChangeFile(event) : void {
    let files = event.srcElement.files;
    console.dir(files);
    this.uploadImageToServer(files[0]);
  }

  closeKeyboard() : void {
    this.keyboard.close();
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

      this.actionSheetCtrl.create({
        buttons: [
          {
            text: this.translateService.instant('PROFILE_CAMERA'),
            icon: 'camera',
            handler: () => {
              this.getPictureFromCamera(false);
            }
          },{
            text: this.translateService.instant('PROFILE_GALLERY'),
            icon: 'images',
            handler: () => {
              this.getPictureFromCamera(true);
            }
          },{
            text: this.translateService.instant('PROFILE_CANCEL'),
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

  buttonContinue(): void {

    // check if nickname is set
    if ((this.nickname==null) || (this.nickname.trim().length<1)) {
      this.toastCtrl.create({
        message: this.translateService.instant('PROFILE_TOAST_NICKNAME'),
        cssClass: 'toast-invalid',
        duration: 2000
      }).present().then();
      return;
    }

    if (this.photoNeeded) {
        // check if nickname is set
        if ((this.avatarUrl==null) || (this.avatarUrl.trim().length<1)) {
          this.toastCtrl.create({
            message: this.translateService.instant('PROFILE_TOAST_PHOTO'),
            cssClass: 'toast-invalid',
            duration: 2000
          }).present().then();
          return;
        }
    }

    this.storeUserDataAndClose();

  }

  buttonClose(): void {

    if ((!this.dataChanged) || (this.notice.length>0)) {
      this.viewCtrl.dismiss({ success: true } ).then();
      return;
    }

    this.storeUserDataAndClose();

  }

  storeUserDataAndClose():void {
    let userUpdate = new UserUpdate();
    userUpdate.nickname = this.nickname;
    userUpdate.description = this.aboutme;
    userUpdate.spokenLanguages = this.appState.getUserInfo().spokenLanguages;
    userUpdate.email = this.username.trim();
    if (this.password.trim().length>0) userUpdate.password = this.password.trim();
    let loadingModal = this.loadingCtrl.create({});
    loadingModal.present().then();
    this.api.updateUserInfo(this.appPersistence.getAppDataCache().userid,userUpdate).subscribe(
      user => {

        /*
         * WIN
         */

        // update user in app state (keep hoods because on this endpoint they are not populated)
        user.neighbourhoods = this.appState.getUserInfo().neighbourhoods;
        this.appState.setUserInfo(user);

        // hide loading spinner
        loadingModal.dismiss().then();

        this.toastCtrl.create({
          message: this.translateService.instant('PROFILE_SAVED'),
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

        // hide loading spinner
        loadingModal.dismiss().then();

        this.toastCtrl.create({
          message: this.translateService.instant('PROFILE_SAVEFAIL'),
          cssClass: 'toast-invalid',
          duration: 2000
        }).present().then();

        this.viewCtrl.dismiss({ success: false } ).then();

      }
    );
  }

}
