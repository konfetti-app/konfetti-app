import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  modus : string = null;
  allowRegister: boolean = false;

  constructor(
    private params: NavParams = null,
    private viewCtrl: ViewController
  ) {

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
    alert('TODO');
  }

  buttonRecover() : void {
    // TODO recover password for given email
    alert('TODO');
  }

  dismiss() {
    this.viewCtrl.dismiss({ success: false, reason: 'cancel' } ).then();
  }

}
