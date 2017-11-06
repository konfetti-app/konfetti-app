import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController, ToastController } from 'ionic-angular';
import { AppStateProvider } from '../../providers/app-state/app-state';
import { TranslateService } from "@ngx-translate/core";

// https://ionicframework.com/docs/native/barcode-scanner/
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-code-redeem',
  templateUrl: 'code-redeem.html',
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

  constructor(
    private viewCtrl: ViewController,
    private params: NavParams,
    private appState: AppStateProvider,
    private barcodeScanner: BarcodeScanner,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private translateService: TranslateService
  ) {
  }

  ionViewWillEnter() {
    if ((this.params!=null) && (this.params.data!=null)) {
      if ((typeof this.params.data.modus != 'undefined') && (this.params.data.modus != null)) {
        this.modus = this.params.data.modus;
      }
    }
  }

  buttonScanCode() :void {

    // TODO
    // check if user entered a code and then maybe just
    // by confusion hit scan instead of send button
    if (this.code.trim().length>3) {
      if (!confirm('TODO: test entered code "'+this.code+'" first before try to scan')) return;
    }

    // simulate on browser for now
    if (!this.appState.isRunningOnRealDevice()) {
      this.processScannedCode("12345");
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

    this.toastCtrl.create({
      message: this.translateService.instant('OK'),
      duration: 3000
    }).present().then();

    setTimeout(()=>{
      this.buttonRedeemCode();
    },1500);
  }

  buttonRedeemCode() : void {
    // TODO real redeem code against API
    this.viewCtrl.dismiss({ success: true } ).then();
  }

  buttonNoCode() : void {
    // TODO give user more info how to get a code
    alert('TODO');
  }

  dismiss() {
    this.viewCtrl.dismiss({ success: false, reason: 'cancel' } ).then();
  }

}


