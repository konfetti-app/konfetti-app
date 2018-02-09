import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, ToastController, ViewController, Platform} from 'ionic-angular';
import { AppStateProvider, LanguageInfo } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ParticlesProvider } from '../../providers/particles/particles';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  availableLanguages: Array<LanguageInfo>;
  actualLanguage: LanguageInfo;
  versionString: string = "Browser";

  // for the particle test
  @ViewChild('canvasObj') canvasElement : ElementRef;
  public isPlaying : boolean = false;

  // flag is running on iOS
  isIOS: boolean;

  constructor(
    private viewCtrl: ViewController,
    private appState: AppStateProvider,
    private appPersistence: AppPersistenceProvider,
    private toastCtrl: ToastController,
    private _PARTICLE: ParticlesProvider,
    private platform: Platform
    ) {

      this.isIOS = this.appState.isIOS();

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

    this.actualLanguage = this.appState.getActualAppLanguageInfo();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
    this.prepareCanvas();
  }

     /**
    *
    * Programmatically link to the HTML5 Canvas object and define
    * the necessary width and height for the Canvas
    *
    * @public
    * @method prepareCanvas
    * @return {None}
    */
    prepareCanvas() : void
    {
       this._PARTICLE.initialiseCanvas(this.canvasElement.nativeElement, this.platform.width(), this.platform.height());
    }


  ionViewWillEnter() {
    this.availableLanguages = this.appState.getAllAvailableLanguages();
    this.actualLanguage = this.appState.getActualAppLanguageInfo();
  }

  changeLanguage() : void {
    this.appState.updateActualAppLanguage(this.actualLanguage.locale);
    this.appPersistence.setLocale(this.actualLanguage.locale);
  }

  buttonResetApp() : void {
    this.appPersistence.resetAll().subscribe( (none) => {
      try {
        navigator['app'].exitApp();
      } catch (e) {}
      this.toastCtrl.create({
        message: 'CLOSE and RESTART APP',
        duration: 5000
      }).present().then();
    });
  }

  buttonClose(): void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

  compareLangs(lang1:LanguageInfo, lang2:LanguageInfo) : boolean {
    return lang1.locale === lang2.locale;
  }

  public startAnimation() : void
  {
     this.isPlaying = true;
     this._PARTICLE.startAnimation(100, 5000, ()=>{
      // callback when done 
      this.isPlaying = false;
     });

  }

}
