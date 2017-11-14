import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, ToastController} from 'ionic-angular';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppVersion } from "@ionic-native/app-version";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  modus : string = null;
  allowRegister: boolean = false;
  versionString: string = "";

  constructor(
    private params: NavParams = null,
    private viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private appState: AppStateProvider,
    private appVersion: AppVersion
  ) {

    // get version strings
    this.versionString = this.appState.getAppBuildTime();
    if (this.appState.isRunningOnRealDevice()) {
      try {
        this.appVersion.getVersionNumber().then((number) => {
          this.versionString = number;
        });
      } catch (e) {
        console.log("App-Version not Available");
      }
    }

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
    // TODO login against API
    this.viewCtrl.dismiss({ success: true } ).then();
  }

  buttonRegister() : void {
    // TODO register against API (with email and password)
    this.toastCtrl.create({
      message: 'TODO',
      duration: 5000
    }).present().then();
  }

  buttonRecover() : void {
    // TODO recover password for given email
    this.toastCtrl.create({
      message: 'TODO',
      duration: 5000
    }).present().then();
  }

  dismiss() {
    this.viewCtrl.dismiss({ success: false, reason: 'cancel' } ).then();
  }

}
