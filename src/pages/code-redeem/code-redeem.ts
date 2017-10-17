import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { AppStateProvider } from '../../providers/app-state/app-state';

// https://ionicframework.com/docs/native/qr-scanner/
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

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
    private qrScanner: QRScanner
  ) {
    // if (this.params!=null) console.log("Got Params: ",this.params);
    //this.params.get('charNum')
  }

  buttonScanCode() :void {

    if (!this.appState.isRunningOnRealDevice()) {
      this.code = "1234455";
      return;
    }

    // Optionally request the permission early
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          // camera permission was granted

          // start scanning
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);

            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
          });

          // show camera preview
          this.qrScanner.show().then(() => {
            console.log("qrScanner.show DONE");
          });

          // wait for user to scan something, then the observable callback will be called
          console.log("Waiting for scan.");

          // TODO: QR Scanner on Android not working

        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          console.log('permission was denied - permanent');
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
          console.log('permission was denied - once');
        }
      })
      .catch((e: any) => console.log('Error is', e));

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


