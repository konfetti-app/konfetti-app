///<reference path="../../providers/app-persistence/app-persistence.ts"/>
import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController, Loading, ToastController} from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";

import { ApiProvider, UserCredentials } from "../../providers/api/api";
import { AppStateProvider } from '../../providers/app-state/app-state';
import { AppPersistenceProvider } from '../../providers/app-persistence/app-persistence';

// https://ionicframework.com/docs/native/barcode-scanner/
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-code-redeem',
  templateUrl: 'code-redeem.html'
})
export class CodeRedeemPage {

  /**
   * nav params
   */
  modus : string = 'intro';

  /*
   * internal fields
   */
  code : string = '';

  loadingSpinner : Loading = null;

  constructor(
    private viewCtrl: ViewController,
    private params: NavParams,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private barcodeScanner: BarcodeScanner,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private api: ApiProvider
  ) {
  }

  ionViewWillEnter() {
    if ((this.params!=null) && (this.params.data!=null)) {
      if ((typeof this.params.data.modus != 'undefined') && (this.params.data.modus != null)) {
        this.modus = this.params.data.modus;
      }
    }
  }

  ionViewDidLeave() {
    if (this.loadingSpinner!=null) this.loadingSpinner.dismissAll();
  }

  buttonScanCode() :void {

    // simulate on browser for now
    if (!this.appState.isRunningOnRealDevice()) {
      this.processScannedCode("234758");
      return;
    }

    /*
    * BARCODE SCANNER
    * https://ionicframework.com/docs/native/barcode-scanner/
    */
    const loading = this.loadingCtrl.create({
      showBackdrop: true
    });
    loading.present().then();
    setTimeout(() => {
      this.barcodeScanner.scan().then((barcodeData) => {

        loading.dismiss().then();

        // Success! Barcode data is here
        if (!barcodeData.cancelled) {

          this.processScannedCode(barcodeData.text);

        } else {
          this.toastCtrl.create({
            message: this.translateService.instant('CANCELED'),
            duration: 1500
          }).present().then();
        }

      }, (err) => {
        // An error occurred
        loading.dismiss().then();
      });
    }, 500);

  }

  processScannedCode(text: string) : void {

    // TODO: Check scan result - if not a number, something is wrong
    this.code = text;
    this.buttonRedeemCode();
  }

  private processReedemFail(error:any) :void {

    // hide spinner
    this.loadingSpinner.dismiss().then();
    this.loadingSpinner=null;

    // TODO: toast message should let user know that code was already redeemed
    if (error==="REDEEMED") {
      this.toastCtrl.create({
        message: this.translateService.instant('CODEREDEEM_CODE_UNVALID'),
        cssClass: 'toast-invalid',
        duration: 2000
      }).present().then();
      return;
    }

    if (error==="INVALID") {
      this.toastCtrl.create({
        message: this.translateService.instant('CODEREDEEM_CODE_UNVALID'),
        cssClass: 'toast-invalid',
        duration: 2000
      }).present().then();
      return;
    }

    // TODO: on every other error - show a ups message
    console.log("FAIL", error);

  }

  buttonRedeemCode() : void {

    // show loading spinner
    this.loadingSpinner = this.loadingCtrl.create({
      content: ''
    });
    this.loadingSpinner.present().then();

    if (this.modus=='intro') {

      this.api.redeemCodeAnonymous(this.code, this.appState.getActualAppLanguageInfo().locale).subscribe( (user : UserCredentials) => {

        /*
         * WIN (on intro the important part is the user account creation)
         */

        // persist user data
        this.appPersistence.setUserCredentials(user.id, user.user, user.pass);

        // hide spinner
        this.loadingSpinner.dismiss().then();
        this.loadingSpinner = null;

        // show user positive response
        this.toastCtrl.create({
          message: this.translateService.instant('CODEREDEEM_CODE_VALID'),
          cssClass: 'toast-valid',
          duration: 1500
        }).present().then(()=>{
          setTimeout(()=>{
            this.viewCtrl.dismiss({ success: true } ).then();
          },1300);
        });

      }, (error) => {

        /*
         * FAIL
         */

        this.processReedemFail(error);

      });

    } else
    if (this.modus=='main') {

      this.api.redeemAdditionalCode(this.code).subscribe( (data) => {

        /*
         * WIN (on redeeming additional codes the update of user data/roles is important)
         */

        // hide spinner
        this.loadingSpinner.dismiss().then();
        this.loadingSpinner = null;

        // show user positive response
        this.toastCtrl.create({
          message: this.translateService.instant('CODEREDEEM_CODE_VALID'),
          cssClass: 'toast-valid',
          duration: 1500
        }).present().then(()=>{
          setTimeout(()=>{
            this.viewCtrl.dismiss({ success: true } ).then();
          },1300);
        });


      }, (error) =>{

        /*
         * FAIL
         */

        this.processReedemFail(error);

      } );

    } else {

      this.toastCtrl.create({
        message: 'UNKOWN MODE: ' + this.modus,
        cssClass: 'toast-invalid',
        duration: 2000
      }).present().then();

    }



  }

  buttonNoCode() : void {
    // TODO give user more info how to get a code
    this.toastCtrl.create({
      message: 'Testcode: 234758',
      duration: 5000
    }).present().then();
  }

  dismiss() {
    // close dialog and send back the cancel flag
    this.viewCtrl.dismiss({ success: false, reason: 'cancel' } ).then();
  }

}


