import { 
  Component, 
  ViewChild, 
  OnInit 
} from '@angular/core';

import { 
  Nav, 
  Platform, 
  ModalController, 
  Modal, 
  ToastController, 
  AlertController 
} from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
//import { SplashScreen } from '@ionic-native/splash-screen';
import { MenuController, Events } from 'ionic-angular';
import { HttpClient} from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { InitPage } from '../pages/init/init';
import { MainPage } from '../pages/main/main';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { IntroPage } from '../pages/intro/intro';
import { CodeRedeemPage } from '../pages/code-redeem/code-redeem';

import { AppPersistenceProvider, AppData } from "../providers/app-persistence/app-persistence";
import { AppStateProvider, LanguageInfo } from "../providers/app-state/app-state";
import { AppConfigProvider } from "../providers/app-config/app-config";

import { 
  ApiProvider, 
  JsonWebToken, 
  NetworkProblem, 
  User,
  Code
} from "../providers/api/api";

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit{

  /*
   * Navigation
   */

  @ViewChild(Nav) nav: Nav;
  rootPage: any = InitPage;
  pages: Array<{title: string, component: any}>;

  /*
   * Init State
   */

  readyPlatform : Boolean = false;
  readyI18N : Boolean = false;
  readyAll : Boolean = false;
  readyAppState : Boolean = false;
  versionString : string = "";

  /*
   * Data for Sidemenu
   */
  userInfo : User = new User();
  avatarUrl: string = ""

  constructor(
    private platform: Platform,
    private http: HttpClient,
    private statusBar: StatusBar,
    //private splashScreen: SplashScreen,
    private events: Events,
    private translate: TranslateService,
    private appPersistence: AppPersistenceProvider,
    private appState: AppStateProvider,
    private menuController: MenuController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private api: ApiProvider,
    private alertCtrl: AlertController,
    private config: AppConfigProvider
  ) {

    // set API to real server, when running in real device or not on localhost in browser
    let connectToRealServer: boolean = false;
    if (this.appState.isRunningOnRealDevice()) {
      // Real Device
      connectToRealServer = true;
    } else {
      // Browser
      if (!(location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
        connectToRealServer = true;
      }
    }

    // set API base url - if defined above or when forced by config
    if (connectToRealServer || this.config.isForceRealServer()) this.api.setApiBaseUrl(this.config.getRealServer());

    // on beginning disable side menu
    this.menuController.enable(false);

    // used for an example of ngFor and navigation in side menu
    this.pages = [
      { title: 'Profile', component: ProfilePage },
      { title: 'Main', component: MainPage }
    ];

    /**
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    // init signals to go to main page
    this.events.subscribe('init:goProfile', () => {
      this.menuController.enable(true);
      this.nav.setRoot(ProfilePage).then();
    });

    // async app init processes
    this.initializeAppAsync();

    /**
     * App System Events
     */

    // app is put into background
    this.platform.pause.subscribe(event => {
      // PLACEHOLDER
    });

    // app is resuming from background
    this.platform.resume.subscribe( event => {
      // PLACEHOLDER
    });

    /**
     * App State Events
     */

    // register on User Info change
    this.appState.listenOnNewUserInfo().subscribe( user => {

      // update user info
      this.userInfo = user;

      // updae avatar imaghe
      if ((this.appState.getUserInfo().avatar) && (this.appState.getUserInfo().avatar.filename)) {
        // set image
        this.avatarUrl = this.api.buildImageURL(this.appState.getUserInfo().avatar.filename);
      } else {
        this.avatarUrl = "";
      }

    });

    /**
     * Api Events
     */

    // register Network Problem listener
    this.api.setListenerOnNetworkProblems().subscribe((errorReport : NetworkProblem) => {

      if (errorReport.id==="OFFLINE") {

        this.alertCtrl.create({
          title: this.translate.instant('ALERT_OFFLINE'),
          message: this.translate.instant('ALERT_OFFLINEMSG'),
          buttons: [
            {
              text: this.translate.instant('ALERT_CLOSEAPP'),
              role: 'cancel',
              handler: () => {
                this.exitApp();
              }
            },
            {
              text: this.translate.instant('ALERT_RETRY'),
              handler: () => {
                errorReport.retryCallback();
              }
            }
          ]
        }).present().then();

      } else
      if (errorReport.id==="AUTHFAIL") {

        this.alertCtrl.create({
          title: this.translate.instant('ALERT_ERROR'),
          subTitle: this.translate.instant('ALERT_ERRORRETRY'),
          buttons: [{
            text: this.translate.instant('ALERT_CLOSEAPP'),
            handler: () => {
              this.exitApp();
            }
          }]
        }).present().then(() => {});

      } else {

        this.alertCtrl.create({
          title: this.translate.instant('ALERT_ERROR'),
          subTitle: this.translate.instant('ALERT_ERRORUNKNOWN')+' ' + errorReport.id,
          buttons: [{ 
            text: this.translate.instant('ALERT_CLOSEAPP'),
            handler: () => {
              this.exitApp();
            }
          }]
        }).present().then(() => {});

      }

    });
  }

  private exitApp() {
    try {
      navigator['app'].exitApp();
    } catch (e) {}
  };

  initializeAppAsync() {

    // async --> platform is ready
    this.platform.ready().then(() => {
      this.processPlatformIsReady();

      // async --> load app state (only do when IONIC is ready)
      this.appPersistence.getAppDataAsync().subscribe( (data : AppData) => {
        this.processAppData(data);
      });

      this.api.setListenerOnNewAccessToken().subscribe((webToken: JsonWebToken) => {
        console.log("AccessTokenListener - Got informed about a new token -> persiting", webToken);
        this.appPersistence.setJsonWebToken(webToken);
      });
      
    });

    // async --> load i18n data
    this.http.get('./assets/i18n/i18n-data.json').subscribe(data => {
      this.processI18N(data);
    });

  }

  /*
   * PLATFORM & PLUGINGS
   * Do all the stuff needed once cordova/ionic platform is ready.
   */
  processPlatformIsReady() {
    this.statusBar.overlaysWebView(false);
    this.readyPlatform = true;
    this.checkIfAllReady();
  }

  /*
   * TRANSLATIONS
   *
   * Loading the dynamic translations data for the app.
   * https://github.com/ngx-translate/core
   *
   * Translations Dara is managed with:
   * https://github.com/rootzoll/angular-translate-sheet-export
   *
   * for more info see Translation Section in README.md
   */
  processI18N(data) {
    console.dir(data);

    for (let i = 0; i < data.i18n.length; i++) {
      let langData =  data.i18n[i];
      console.log('LANG FOUND --> '+ langData.displayname);

      // set translation data in i18n module
      this.translate.setTranslation(langData.locale, langData.translations, false);

      // keep in app state the language metadata
      let langMetadata: LanguageInfo = new LanguageInfo();
      langMetadata.locale = langData.locale;
      langMetadata.direction = langData.direction;
      langMetadata.displayname = langData.displayname;
      this.appState.addLanguage(langMetadata);

    }

    // TODO: Also use 'data.credits' info later on to respect people helping on translation

    this.readyI18N = true;
    this.checkIfAllReady();
  }

  /*
   * PERSISTENT CLIENT DATA
   * Loading the dynamic translations data for the app.
   */
  processAppData(data : AppData) {

    // TODO: based on app state set/refresh API tokens
    console.log(data.i18nLocale);

    this.readyAppState = true;
    this.checkIfAllReady();
  }

  checkIfAllReady() {

    // check if IONIC is ready
    if (!this.readyPlatform) {
      console.log('... still waiting for IONIC to get ready');
      return;
    };

    // check if I18N ready
    if (!this.readyI18N) {
      console.log('... still waiting for I18N to get ready');
      return;
    }

    // check if LOCALSTORAGE is ready
    if (!this.readyAppState) {
      console.log('... still waiting for LOCALSTORAGE to get ready');
      return;
    }

    // set language to app user setting or detect default
    // TODO: set like in local storage or match closet to browser lang
    this.appState.updateActualAppLanguage(this.appPersistence.getAppDataCache().i18nLocale);

    // remove native splash screen
    this.readyAll = true;
    //this.splashScreen.hide();

    // TODO init API data
    if (this.appPersistence.getAppDataCache().password) {

      /*
       * USER IS REGISTERED
       */

      // init API
      this.api.setAccessCredentials(
        this.appPersistence.getAppDataCache().username,
        this.appPersistence.getAppDataCache().password,
        this.appPersistence.getAppDataCache().jsonWebtoken
      );

      // jump to main page
      this.nav.setRoot(MainPage, {}).then();

    } else {

      /*
       * USER IS NEW
       */

      // jump to intro page
      this.nav.setRoot(IntroPage, {}).then();

    }

  };

  ngOnInit(): void {
  }

  buttonKonfetti() : void {
    console.log("Placeholder for later .. should give more info abot konfetti points");
  }

  buttonProfile() : void {
    let modal : Modal = this.modalCtrl.create(ProfilePage, { showAccountLink: true});
    modal.onDidDismiss(data => {
      if ((typeof data.command != null) && (data.command=='goAccount')) {

        this.toastCtrl.create({
          message: 'TODO: Open Password/Account Dialog',
          duration: 5000
        }).present().then();

      }
    });
    modal.present().then();
  }

  buttonGroup(id : string) : void {

    // set selected group/hood as focus
    this.appPersistence.setLastFocusGroupId(id);

    // signal to app that focus has changed
    this.events.publish("main:update");

  }

  buttonSettings() : void {
    let modal : Modal = this.modalCtrl.create(SettingsPage, { });
    modal.onDidDismiss(data => {});
    modal.present().then();
    //this.nav.setRoot(SettingsPage).then();
  }

  /*
    TODO Optionen:
    a) Weiteren Code eingeben/scannen.
    b) Wie finde ich eine Nachbarschaft? 
    c) Eigene Nachbarschaft/Haus gründen.`,
  */
  buttonNewGroup() : void {

    // TODO:
    alert("TODO: Let Modal check on other endpoint - because user already has account.");

    let modal : Modal = this.modalCtrl.create(CodeRedeemPage, { modus: 'main'});
    modal.onDidDismiss(data => {
      if ((data != null) && (typeof data.success != 'undefined') && (data.success)) {

        if ((data.code as Code).actionType == "newNeighbour") {

          alert("TODO: Check if data updated.");
          //this.updateData();

        } else {
          console.log("buttonQRCodeScan: UNKNOWN CODE TYPE", data);

          this.toastCtrl.create({
            message: 'TODO: Neuen Code verarbeiteten',
            duration: 5000
          }).present().then();

        }

      }
    });
    modal.present().then();

    /*
    // TODO
    this.toastCtrl.create({
      message: `TODO Optionen:
    a) Weiteren Code eingeben/scannen.
    b) Wie finde ich eine Nachbarschaft? 
    c) Eigene Nachbarschaft/Haus gründen.`,
      duration: 5000
    }).present().then();
    */

  }

  // gets called from side menu
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component).then();
  }

}
