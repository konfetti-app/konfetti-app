import { Component } from '@angular/core';
import { IonicPage, ViewController, LoadingController } from 'ionic-angular';
import { AppStateProvider } from '../../providers/app-state/app-state';

// https://ionicframework.com/docs/native/barcode-scanner/
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@IonicPage()
@Component({
  selector: 'page-code-redeem',
  templateUrl: 'code-redeem.html',
})
export class CodeRedeemPage {

  code : string = "";

  constructor(
    private viewCtrl: ViewController,
    private appState: AppStateProvider,
    private barcodeScanner: BarcodeScanner,
    private loadingCtrl: LoadingController
  ) {
    // if (this.params!=null) console.log("Got Params: ",this.params);
    //this.params.get('charNum')
  }

  buttonScanCode() :void {

    const loading = this.loadingCtrl.create({
      showBackdrop: true
    });
    loading.present().then();

    if (!this.appState.isRunningOnRealDevice()) {
      console.log('SIMULATE Code');
      this.code = "1234455";
      loading.dismiss().then();
      return;
    }

    /*
    * BARCODE SCANNER
    * https://ionicframework.com/docs/native/barcode-scanner/
    */
    setTimeout(() => {
      this.barcodeScanner.scan().then((barcodeData) => {

        loading.dismiss().then();

        // Success! Barcode data is here
        if (!barcodeData.cancelled) {

          // TODO: Check scan result - if not a number, something is wrong
          this.code = barcodeData.text;
          this.buttonRedeemCode();
        }

      }, (err) => {
        // An error occurred
        loading.dismiss().then();
      });
    }, 500);

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


