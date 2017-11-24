import { Component, ViewChild, ElementRef } from '@angular/core';
import {IonicPage, NavParams, ModalController, Modal, ToastController, LoadingController} from 'ionic-angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TranslateService } from "@ngx-translate/core";
import leaflet from 'leaflet';

import { CodeRedeemPage } from '../code-redeem/code-redeem';
import { ApiProvider, User} from '../../providers/api/api';
import { AppPersistenceProvider } from './../../providers/app-persistence/app-persistence';
import { AppStateProvider } from "../../providers/app-state/app-state";

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
      transition( 'hidden => show', animate('1500ms ease-out')),
      transition( 'show => hidden', animate('1000ms ease-out'))
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

  eventMarkers : any;
  zoomControl : any;

  moduleConfig : Array<string>;

  // this one just for dummy testing
  notificationModuleA : boolean = true;

  constructor(
    private params: NavParams = null,
    private modalCtrl: ModalController,
    private translateService: TranslateService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private api: ApiProvider,
    private persistence: AppPersistenceProvider,
    private state: AppStateProvider
  ) {
    this.showModuleFocus = "";

    this.eventMarkers = leaflet.featureGroup();
    let marker: any = leaflet.marker([this.lat, this.lon]).on('click', () => {
      this.toastCtrl.create({
        message: 'TODO: What should happen?',
        duration: 5000
      }).present().then();
    });
    this.eventMarkers.addLayer(marker);

    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });

    // ordering is important
    this.moduleConfig = new Array<string>();
    this.moduleConfig.push('forum');
    this.moduleConfig.push('ideas');
    this.moduleConfig.push('news');
  }

  setStateKonfettiNotice(show: boolean) : void{
    if (!this.showKonfettiNotice) this.showKonfettiNotice=true;
    this.stateKonfettiNotice = show ? 'show' : 'hide';
    setTimeout(() => {
      this.showKonfettiNotice = this.getStateKonfettiNotice();
    },1500);
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

  buttonModule(moduleName: string) {

    if (moduleName===this.showModuleFocus) {

      // if user hits active button - deactivate and show map
      this.transformShowMap();

    } else {

      // deactivate notification bubble on module
      if (moduleName==='forum') this.notificationModuleA = false;

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
        // TODO
        this.toastCtrl.create({
          message: 'TODO: Neuen Code verarbeiteten',
          duration: 5000
        }).present().then();
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
        this.konfettiTourText = this.translateService.instant('TOUR_TEXT_MAP');
        this.langKeyTourNext = 'TOUR_CONTINUE';
      }, 1250);
    },1500);

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
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          setTimeout(()=>{
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_NEWS');
          },1300);
        },800);
      }

      if (this.konfettiTourStep===2) {
        this.classKonfettiTourFocus = 'konfetti-tour-focus-module2';
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          this.buttonModule('ideas');
          setTimeout(()=>{
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_IDEAS');
          },1300);
        },100);
      }

      if (this.konfettiTourStep===3) {
        this.classKonfettiTourFocus = 'konfetti-tour-focus-module1';
        setTimeout(()=>{
          this.stateKonfettiTourFocus = 'show';
          this.buttonModule('forum');
          setTimeout(()=>{
            this.langKeyTourNext = 'TOUR_READY';
            this.konfettiTourText = this.translateService.instant('TOUR_TEXT_FORUM');
          },1300);
        },100);
      }

      if (this.konfettiTourStep===4) {
        this.showKonfettiTour = false;
        this.buttonModule('news');
      }

      },1500);

  }

  transformShowMap() {

    if (this.showKonfettiTour) {
      console.log("dont go to map during intro tour");
      return;
    }

    this.setStateModulePanel(false);

    this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
    this.map.addLayer(this.eventMarkers);

    this.zoomControl.addTo(this.map);

    setTimeout(() => {
      if (this.stateModulePanel==='showMap') {
        this.showModuleFocus="";
      }
    }, 500);

  }

  transformShowModules() {

    this.setStateModulePanel(true);
    if (this.showModuleFocus.length<1) this.showModuleFocus='news';

    this.map.flyTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);
    this.map.removeLayer(this.eventMarkers);

    this.zoomControl.remove();

  }

  initMap() {

    this.map = leaflet.map("map",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 18,
      minZoom: 5
    }).addTo(this.map);

    this.map.panTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);

    this.transformShowMap();

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

      console.log("OK User");
      console.dir(user);

      // remember user in app state
      this.state.setUserInfo(user);

      // decide which group to focus
      let focusGroupId = this.persistence.getAppDataCache().lastFocusGroupId;
      if (focusGroupId==null) {
        // take the first (and most likely only group) in list of user
        focusGroupId = user.neighbourhoods[0]._id;
        this.persistence.setLastFocusGroupId(focusGroupId);
      }

      console.log("Group to Focus:" + focusGroupId);

      // set GUI with data of given group
      let group = this.state.getNeighbourhoodById(focusGroupId);
      // TODO: what to do if id not found - return is null? --> exception
      this.title = group.name;

      console.log("GROUP");
      console.dir(group);

      // TODO: later Newsfeed?
      // TODO: later Mapevents?
      // TODO: setup Modules?

      // decide if to show the onboarding intro
      // TODO: maybe decide this not by parameter - use flags in app persistence
      this.showModuleOverlay = true;
      let showIntro : boolean = true;
      if ((this.params!=null) && (this.params.data!=null)) {
        if ((typeof this.params.data.showIntro != 'undefined') && (this.params.data.showIntro != null)) {
          showIntro = this.params.data.showIntro;
        }
      }
      this.setStateKonfettiNotice(showIntro);
      if (!showIntro) {
        setTimeout(() => {
          this.transformShowModules();
        },100);
      }

      loadingModal.dismiss().then();

    }, error => {
      loadingModal.dismiss().then();
      // TODO forward later to a exception handling
      console.error(error);
    });

  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {

    this.initMap();

    this.updateData();

  }

  // returns the icon css classes depending of module id
  getModuleIcon(id: string) : string {
    if (id==='news') return 'fa fa-home';
    if (id==='ideas') return 'fa fa-lightbulb-o';
    if (id==='forum') return 'fa fa-comments';
    return 'mdi mdi-help'; // fallback
  }

  // returns the color depending of module id
  getModuleButtonColor(id : string) {
    if (id==='news') return '#d1736f';
    if (id==='ideas') return '#92bc81';
    if (id==='forum') return '#78bce9';
    return 'red'; // fallback
  }

  getModuleConfig(id : string) : any {
    return {
      test: 'test'
    };
  }

  getModuleHasNotification(id: string) {
    if (id==='forum') return this.notificationModuleA;
    return false; // fallback
  }

}
