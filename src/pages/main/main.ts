import { 
  Component, 
  ViewChild, 
  ElementRef 
} from '@angular/core';
import { 
  IonicPage,  
  ModalController, 
  Modal, 
  ToastController, 
  LoadingController, 
  Events,
  Platform,
  PopoverController
} from 'ionic-angular';
import { 
  trigger, 
  state, 
  style, 
  transition, 
  animate 
} from '@angular/animations';
import { TranslateService } from "@ngx-translate/core";
import leaflet from 'leaflet';

import { CodeRedeemPage } from '../code-redeem/code-redeem';
import { PopoverIdeaPage } from '../popover-idea/popover-idea';

import { ApiProvider, Code, User, Idea, PushNotification } from '../../providers/api/api';
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';
import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppConfigProvider } from "../../providers/app-config/app-config";

import { ParticlesProvider } from '../../providers/particles/particles';

/**
 *
 * Map Integration see tutorial:
 * http://tphangout.com/ionic-3-leaflet-maps-geolocation-markers/
 *
 * LeafLet Map API:
 * http://leafletjs.com/reference-1.2.0.html
 *
 */
@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
  animations: [

    // --- Module/ Map Switch ---
    trigger('animateModulePanel',[
      state('showMap', style({
        top: 'calc(100% - 56px)'
      })),
      state('showModules', style({
        top: '33%'
      })),
      transition('showMap => showModules', animate('500ms ease-out')),
      transition('showModules => showMap', animate('500ms ease-out'))
    ]),

    // --- Center Notice ---
    trigger( 'animateFade', [
      state( 'show', style({
        opacity: 1
      }) ),
      state( 'hide', style({
        opacity: 0
      })),
      transition( 'show => hide', animate('1500ms ease-out')),
      transition( 'hide => show', animate('100ms ease-out'))
    ]),

    // --- Intro Tour ---
    trigger( 'animateSpotPosition', [
      state( 'hidden', style({
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.0)',
        borderColor: 'rgba(0, 0, 0, 0.0)'
      }) ),
      state( 'show', style({
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
        borderColor: 'rgba(0, 0, 0, 0.4)'
      })),
      transition( 'hidden => show', animate('1000ms ease-out')),
      transition( 'show => hidden', animate('500ms ease-out'))
    ]),

    // --- Switch Modules ---
    trigger( 'animateModuleSwitch', [
      state( 'normal', style({
        left: '0%'
      }) ),
      state( 'left', style({
        left: '-100%'
      })),
      state( 'right', style({
        left: '100%'
      })),
      transition( 'normal => left', animate('100ms ease-in')),
      transition( 'left => normal', animate('100ms ease-out')),
      transition( 'normal => right', animate('100ms ease-in')),
      transition( 'right => normal', animate('100ms ease-out'))
    ])
  ]

})
export class MainPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  mapInitDone:boolean = false;

  showModuleOverlay: boolean = false;
  showModuleFocus : string = null;

  stateModulePanel : string = "showMap";
  stateModuleSwitch : string = "normal";

  stateKonfettiNotice : string = "hideNotice";
  showKonfettiNotice : boolean = false;

  stateKonfettiTourFocus : string = "hidden";
  classKonfettiTourFocus : string = "konfetti-tour-focus-map";
  showKonfettiTour : boolean = false;
  konfettiTourText : string = "";
  konfettiTourStep : number = 0;

  langKeyTourNext : string;

  // start map setting:
  // Center of Germany
  lon : number = 9.799805;
  lat : number = 50.719939;
  zoom : number = 5;

  // headline of group
  title = "";
  subtitle = "";

  eventMarkers : any;
  zoomControl : any;

  moduleConfig : Array<string>;

  // flag is running on iOS
  isIOS: boolean;

  // flag show NEW fab button
  showFabButton: boolean = true;

  backButtonUnregister:Function = null;

  // for the particle test
  @ViewChild('canvasObj') canvasElement : ElementRef;
  public isPlaying : boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private translateService: TranslateService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private api: ApiProvider,
    private events: Events,
    private persistence: AppPersistenceProvider,
    private state: AppStateProvider,
    private config: AppConfigProvider,
    private platform: Platform,
    private konfettiRain: ParticlesProvider,
    private popoverCtrl: PopoverController
  ) {
    this.showModuleFocus = "";

    this.isIOS = this.state.isIOS();

    this.eventMarkers = leaflet.featureGroup();

    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });

    // ordering is important
    this.moduleConfig = new Array<string>();
    this.moduleConfig.push('ideas');
    this.moduleConfig.push('groupchats');
    this.moduleConfig.push('news');

    /*
     * OneSingnal Pushnotifivations 
     * https://documentation.onesignal.com/docs/cordova-sdk
     */

    // Enable to debug issues:
    // window["plugins"].OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});

    let notificationOpenedCallback = function(jsonData) {
      console.log("OneSignal Notification",JSON.stringify(jsonData));
      alert('OneSignal notificationOpenedCallback: ' + JSON.stringify(jsonData));
    };

    if (this.config.getOneSignalAppId().length>0) {

      if (typeof window["plugins"] != "undefined") {
        try {

          window["plugins"].OneSignal
            .startInit(this.config.getOneSignalAppId(), this.config.getGoogleProjectNumber())
            .handleNotificationOpened(notificationOpenedCallback)
            .endInit();

          console.log("OneSignal: Done Init ... check for PlayerId update.");

          window["plugins"].OneSignal.addSubscriptionObserver((state)=>{
              if (!state.from.subscribed && state.to.subscribed) {

                console.log("OneSignal: Got Player ID", state.to.userId);

                // got player ID
                this.api.subscribePushNotificationService(state.to.userId).subscribe(()=>{

                  // WIN
                  console.log("OneSignal: Reported PlayerID to Konfetti-Server");
                  this.toastCtrl.create({
                    message: 'DEBUG: Pushnotification OK',
                    duration: 2000
                  }).present().then();

                },(error)=>
                {
                  // FAIL
                  alert("FAIL on subscribePushNotificationService: "+JSON.stringify(error));

                });
              }
              console.log("Push Subscription state changed: " + JSON.stringify(state));
          });

        } catch (e) {
          alert("FAIL on OneSignal init ... missing Cordova Plugin?");
        }
  
      } else {
        alert("FAIL on OneSignal init ... missing PLUGINS at all?");
      }

     }

     /*
      * Register on Hardware Hardware Button
      * https://ionicframework.com/docs/api/platform/Platform/#registerBackButtonAction
      * Main Menu has priority 1 - TODO: use higher priority on modal dialogs to close them  
      */
    this.backButtonUnregister = this.platform.registerBackButtonAction(()=>{
      if (this.showModuleFocus!='news') this.buttonModule('news');
      return;
    }, 1); 

    /*
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    this.events.subscribe("main:update", () => {
      console.log("Eventbus: Update focused group/hood");
      this.updateData();
    });

    this.events.subscribe("notification:process", (notification:PushNotification) => {
      console.log("Eventbus: Process Notification");
      this.processNotification(notification);
    });

    this.events.subscribe("main:konfettirain", (notification:PushNotification) => {
      console.log("Eventbus: Konfettirain");
      this.startAnimation();
    });

  }

  // unsubscribe from event bus when page gets destroyed
  ngOnDestroy() {
    this.events.unsubscribe("main:update");
    this.events.unsubscribe("notification:process");
    this.events.unsubscribe("main:konfettirai");
    if (this.backButtonUnregister!=null) this.backButtonUnregister();
  }

  // take action on a notification from newsfeed or push notification
  processNotification(notification:PushNotification) {

    if (notification.module=='moduleGroupChat') notification.module = 'groupchats';
    if (notification.module=='IdeaChat') notification.module = 'ideas';
    

    // open module referenced on screen 
    this.buttonModule(notification.module);

    // wait 500ms (module needs to run constructor first)
    setTimeout(()=>{

      // forward notification to module thru event bus
      let eventName = 'push:'+notification.module;
      console.log("Forwarding Notification on Eventbus: "+eventName);
      this.events.publish(eventName, notification);

    },500);
  }

  pullToRefreshModule(refresher) {
    console.log('Begin async operation', refresher);
    refresher.complete();
    this.events.publish('refresh:'+this.showModuleFocus, Date.now());
  }

  setStateKonfettiNotice(show: boolean) : void{
    this.stateKonfettiNotice = show ? 'show' : 'hide';
    this.showKonfettiNotice = this.getStateKonfettiNotice();
  }

  getStateKonfettiNotice() : boolean {
    return this.stateKonfettiNotice === 'show';
  }

  setStateModulePanel(show: boolean) : void {
    this.stateModulePanel = show ? 'showModules' : 'showMap';
  }

  getStateModulePanel() :boolean {
    return this.stateModulePanel === 'showModules';
  }

  buttonNew():void {
    this.events.publish('new:'+this.showModuleFocus, Date.now());
  }

  setSubTitleAccordingToModule(moduleName:string) : void {
    this.subtitle = this.translateService.instant("SUBTITLE_"+moduleName.toUpperCase());
  }

  buttonModule(moduleName: string) {

    if (moduleName===this.showModuleFocus) {

      // if user hits active button - deactivate and show map
      this.transformShowMap();

    } else {

      this.setSubTitleAccordingToModule(moduleName);

      // show NEW fab button on action modules
      if (moduleName!='news') {
        if (!this.showKonfettiTour) this.showFabButton = true;
      } else {
        this.showFabButton = false;
      }

      if (this.showModuleFocus==='') {
        // fresh - just fade in
        this.showModuleFocus = moduleName;
      } else {

        // decide if which direction for switch animation
        let moduleIndexActual = this.getIndexOfModule(this.showModuleFocus);
        let moduleIndexNext = this.getIndexOfModule(moduleName);
        if (moduleIndexActual>moduleIndexNext) {
          // Animation L -> R
          this.stateModuleSwitch = 'left';
          setTimeout(()=>{
            this.showModuleFocus = moduleName;
            this.stateModuleSwitch = 'right';
            setTimeout(()=>{
              this.stateModuleSwitch = 'normal';
            },100);
          },100);
        } else {
          // Animation R -> L
          this.stateModuleSwitch = 'right';
          setTimeout(()=>{
            this.showModuleFocus = moduleName;
            this.stateModuleSwitch = 'left';
            setTimeout(()=>{
              this.stateModuleSwitch = 'normal';
            },100);
          },100);
        }

      }

      if (!this.getStateModulePanel()) this.transformShowModules();

    }

  }

  /**
   * Returns the index order number of a given module id.
   * @param {string} id
   * @returns {number}
   */
  getIndexOfModule(id : string) : number {
    let index : number = 0;
    let result : number = -1;
    this.moduleConfig.forEach( (config) => {
      if (config==id) {result = index;};
      index++;
      }
    );
    return result;
  }

  buttonMap() {
    if (this.getStateModulePanel()) this.transformShowMap();
  }

  buttonQRCodeScan() {
    let modal : Modal = this.modalCtrl.create(CodeRedeemPage, { modus: 'main'});
    modal.onDidDismiss(data => {
      if ((data != null) && (typeof data.success != 'undefined') && (data.success)) {

        if ((data.code as Code).actionType == "newNeighbour") {

          this.updateData();

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
  }

  buttonKonfettiNotice() : void {

    this.setStateKonfettiNotice(false);

    this.konfettiTourStep = 0;
    this.showKonfettiTour = true;
    this.stateKonfettiTourFocus = 'hidden';
    setTimeout(() => {
      this.stateKonfettiTourFocus = 'show';
      setTimeout(() => {
        this.setSubTitleAccordingToModule('map');
        this.konfettiTourText = this.translateService.instant('TOUR_TEXT_MAP');
        this.langKeyTourNext = 'TOUR_CONTINUE';
      }, 800);
    },1000);

  }

  buttonKonfettiTourNext() : void {

    this.konfettiTourText = '';
    this.stateKonfettiTourFocus = 'hidden';

    setTimeout(()=>{

      // next tour step
      this.konfettiTourStep++;

      if (this.konfettiTourStep===1) {
        this.classKonfettiTourFocus = 'konfetti-tour-focus-module3';
        this.transformShowModules();
        this.setSubTitleAccordingToModule('news');
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          setTimeout(()=>{
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_NEWS');
          },600);
        },800);
      }

      if (this.konfettiTourStep===2) {
        this.classKonfettiTourFocus = 'konfetti-tour-focus-module1';
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          this.buttonModule('groupchats');
          setTimeout(()=>{
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_FORUM');
          },600);
        },100);
      }

      if (this.konfettiTourStep===3) {
        this.classKonfettiTourFocus = 'konfetti-tour-focus-module2';
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          this.buttonModule('ideas');
          setTimeout(()=>{
            this.langKeyTourNext = 'TOUR_READY';
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_IDEAS');
          },600);
        },100);
      }

      if (this.konfettiTourStep===4) {
        this.showKonfettiTour = false;
        //this.buttonModule('news');
      }

      },1000);

  }

  updateEventPinsOnMap() : void {
    let nickname = null;
    let avatar = null;
    if (this.state.getUserInfo()!=null) {
      nickname = this.state.getUserInfo().nickname;
      avatar = this.state.getUserInfo().avatar ? this.state.getUserInfo().avatar.filename : null;
    }
    

    console.log("Refreshing MapEvents");
    let actualGroupId = this.persistence.getAppDataCache().lastFocusGroupId;
    if (actualGroupId!=null) this.api.getKonfettiIdeas(
      actualGroupId,
      this.persistence.getAppDataCache().userid,
      nickname,
      avatar
    ).subscribe(
      (win:Array<Idea>)=>{

        // clear existing event markers
        this.map.removeLayer(this.eventMarkers);
        this.eventMarkers = leaflet.featureGroup();
        this.map.addLayer(this.eventMarkers);

        // set new event markers
        win.forEach((idea)=>{
          if ((idea.geoData!=null) && (idea.geoData.latitude!=null)) {
            let marker: any = leaflet.marker([idea.geoData.latitude, idea.geoData.longitude]).on('click', (event) => {
              console.log("event",event);
              this.map.panTo({lon: idea.geoData.longitude, lat: idea.geoData.latitude}, this.zoom);
              setTimeout(()=>{
                let popover = this.popoverCtrl.create(PopoverIdeaPage,{ idea: idea });
                popover.present({
                  ev: event.originalEvent

                });
              },300);
            });
            this.eventMarkers.addLayer(marker);
          }
        });

    },(error)=>{
      console.log("FAIL", );
    });
  }

  transformShowMap() {

    if (this.showKonfettiTour) {
      console.log("dont go to map during intro tour");
      return;
    }

    this.showFabButton = false;
    if (this.showModuleFocus!="") this.setSubTitleAccordingToModule('map');

    this.setStateModulePanel(false);

    this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
    this.map.addLayer(this.eventMarkers);

    this.zoomControl.addTo(this.map);

    this.updateEventPinsOnMap();

    setTimeout(() => {
      if (this.stateModulePanel==='showMap') {
        this.showModuleFocus="";
      } else {
        this.setSubTitleAccordingToModule(this.showModuleFocus);
      }
    }, 500);

  }

  transformShowModules() {

    this.setStateModulePanel(true);
    if (this.showModuleFocus.length<1) this.showModuleFocus='news';
    if (this.showModuleFocus!='news') this.showFabButton = true;
    this.setSubTitleAccordingToModule(this.showModuleFocus);

    this.map.flyTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);
    this.map.removeLayer(this.eventMarkers);

    this.zoomControl.remove();

  }

  initMap() {

    if (this.mapInitDone) return;

    this.map = leaflet.map("map",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 18,
      minZoom: 5
    }).addTo(this.map);

    this.map.panTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);

    this.transformShowMap();
    this.mapInitDone = true;

  }

  /*
   * refresh user and load the group that is set in app state
   */
  updateData() {

    // hide title & module overlay
    this.title = "";
    this.showModuleOverlay = false;

    // show loading module
    let loadingModal = this.loadingCtrl.create({});
    loadingModal.present().then();

    // update user data including all groups
    this.api.getUser(this.persistence.getAppDataCache().userid).subscribe( (user: User) => {

      // remember user in app state
      this.state.setUserInfo(user);

      // decide which group to focus
      let focusGroupId = this.persistence.getAppDataCache().lastFocusGroupId;
      if (focusGroupId==null) {
        // take the first (and most likely only group) in list of user
        focusGroupId = user.neighbourhoods[0]._id;
        this.persistence.setLastFocusGroupId(focusGroupId);
      }

      // set GUI with data of given group
      let group = this.state.getNeighbourhoodById(focusGroupId);

      // TODO: what to do if id not found - return is null? --> exception
      this.title = group.name || "";

      // set map focus
      if (group.geoData) {
        this.lon = group.geoData.longitude;
        this.lat = group.geoData.latitude;
        this.zoom = this.state.convertRadiusToZoomLevel(group.geoData.radius);
        this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
      }

      this.showModuleOverlay = true;

      // show intro if flag is not set for this group
      let showIntro:boolean = !this.persistence.isFlagSetOnGroup(group._id, AppPersistenceProvider.FLAG_INTROSHOWN);
      console.log("Show Intro:"+showIntro);
      this.setStateKonfettiNotice(showIntro);
      if (!showIntro) {
        setTimeout(() => {
          this.transformShowModules();
        },100);
      } else {
        // mark intro shown on group/hood
        this.persistence.setFlagOnGroup(group._id,AppPersistenceProvider.FLAG_INTROSHOWN);
        this.updateEventPinsOnMap();
      }

      // hide loading modal
      loadingModal.dismiss().then();

    }, error => {

      loadingModal.dismiss().then();

      // TODO forward later to a exception handling
      console.dir(error);

    });

  }

  public startAnimation() : void
  {
     this.isPlaying = true;
     this.konfettiRain.startAnimation(100, 5000, ()=>{
      this.isPlaying = false;
     });

  }

  ionViewDidLoad() {
    this.initMap();
    setTimeout(() => {
      try {
        this.konfettiRain.initialiseCanvas(this.canvasElement.nativeElement, this.platform.width(), this.platform.height());
      } catch (e) {
        alert("FAILED to init this.canvasElement.nativeElement");
      }
    }, 3000);
  }

  ionViewWillEnter() {
    this.updateData();
  }

  // returns the icon css classes depending of module id
  getModuleIcon(id: string) : any {
    if (id==='news') return 'house.png';
    if (id==='ideas') return 'handshake.png';
    if (id==='groupchats') return 'bubbles.svg';
    return '';
  }

  // returns the color depending of module id
  getModuleButtonColor(id : string) {
    if (id==='news') return '#d1736f';
    if (id==='ideas') return '#d1736f';
    if (id==='groupchats') return '#d1736f';
    return '#d1736f'; // fallback
  }

  getModuleConfig(id : string) : any {
    return {
      test: 'test'
    };
  }

  getModuleHasNotification(id: string) {
    return false; // fallback
  }

}