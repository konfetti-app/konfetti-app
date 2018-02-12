import { Component } from '@angular/core';
import { 
  IonicPage, 
  ViewController, 
  NavParams, 
  ToastController,
  LoadingController, 
} from 'ionic-angular';
import { AppStateProvider } from "../../providers/app-state/app-state";

import { TranslateService } from "@ngx-translate/core";
import { ApiProvider } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  username:string = "";
  password:string = "";

  modus : string = null;
  allowRegister: boolean = false;
  versionString: string = "";

  constructor(
    private params: NavParams = null,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private appState: AppStateProvider,
    private api: ApiProvider,
    private translate: TranslateService,
    private loading: LoadingController
  ) {

    // get version strings
    this.versionString = this.appState.getAppBuildTime();
    /*
    if (this.appState.isRunningOnRealDevice()) {
      try {
        this.appVersion.getVersionNumber().then((number) => {
          this.versionString = number;
        });
      } catch (e) {
        console.log("App-Version not Available");
      }
    }
    */

    // get mode to start with as parameter
    this.modus = "login";
    if ((this.params!=null) && (this.params.data!=null)) {
      if ((typeof this.params.data.modus != 'undefined') && (this.params.data.modus!=null)) {
        this.modus = this.params.data.modus;
        if (this.modus==="register") this.allowRegister = true;
      }
    }
  }

  buttonGoLogin() : void {
    this.modus = "login";
  }

  buttonGoRecover() : void {
    this.modus = "recover";
  }

  buttonLogin() : void {

    // show loading spinner
    let loadingSpinner = this.loading.create({
          content: ''
    });
    loadingSpinner.present().then();

    this.api.refreshAccessToken(this.username, this.password).subscribe(
      (win)=>{

        loadingSpinner.dismiss().then();

        this.toastCtrl.create({
          message: this.translate.instant('OK'),
          cssClass: 'toast-valid',
          duration: 1500
        }).present().then();

        setTimeout(()=>{
          // close and signal success to underlying frame 
          this.viewCtrl.dismiss({ success: true } ).then();
        },1500);

    },
      (error)=>{

        loadingSpinner.dismiss().then();

        this.toastCtrl.create({
          message: this.translate.instant('LOGIN_FAIL'),
          cssClass: 'toast-invalid',
          duration: 3000
        }).present().then();

    });

  }

  buttonRegister() : void {
    // TODO register against API (with email and password)
    this.toastCtrl.create({
      message: 'TODO',
      duration: 5000
    }).present().then();
  }

  buttonRecover(): void {

    // show loading spinner
    let loadingSpinner = this.loading.create({
      content: ''
    });
    loadingSpinner.present().then();

    this.api.resetPassword(this.username).subscribe(
      (win) => {

        loadingSpinner.dismiss().then();

        this.modus = "login";

        this.toastCtrl.create({
          message: this.translate.instant('RECOVER_WIN'),
          cssClass: 'toast-valid',
          duration: 4000
        }).present().then();

      },
      (error) => {

        loadingSpinner.dismiss().then();

        this.toastCtrl.create({
          message: this.translate.instant('RECOVER_FAIL'),
          cssClass: 'toast-invalid',
          duration: 3000
        }).present().then();

      });

  }

  dismiss() {
    this.viewCtrl.dismiss({ success: false, reason: 'cancel' } ).then();
  }

}
