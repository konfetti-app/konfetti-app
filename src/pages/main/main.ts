import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import leaflet from 'leaflet';

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
    trigger( 'animateFade', [
      state( 'show', style({
        opacity: 1
      }) ),
      state( 'hide', style({
        opacity: 0
      })),
      transition( 'show => hide', animate('1500ms ease-out')),
      transition( 'hide => show', animate('100ms ease-out')),
    ])
  ]

})
export class MainPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  showModuleFocus : string = null;

  stateModulePanel : string = "showMap";
  stateKonfettiNotice : string = "hideNotice";
  showKonfettiNotice : boolean = false;

  lon : number = 13.408277;
  lat : number = 52.520476;
  zoom : number = 16;

  eventMarkers : any;
  zoomControl : any;

  notificationModuleA : boolean = true;

  constructor(
    private params: NavParams = null
  ) {
    this.showModuleFocus = "";

    this.eventMarkers = leaflet.featureGroup();
    let marker: any = leaflet.marker([this.lat, this.lon]).on('click', () => {
      alert('Marker clicked');
    });
    this.eventMarkers.addLayer(marker);

    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });
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
      if (moduleName==='module-a') this.notificationModuleA = false;

      if (this.showModuleFocus!='') {
        // fresh - just fade in
        this.showModuleFocus = moduleName;
      } else {
        // TODO: Switch Modules Animation
        console.log("TODO: Animation Switch Modules");
        this.showModuleFocus = moduleName;
      }

      if (!this.getStateModulePanel()) this.transformShowModules();

    }

  }

  buttonMap() {
    if (this.getStateModulePanel()) this.transformShowMap();
  }

  buttonQRCodeScan() {
    // TODO
    alert('TODO: direkt zu neuen Code eingeben/scannen');
  }

  buttonKonfettiNotice() {

    this.setStateKonfettiNotice(false);

    setTimeout(() => {
      this.transformShowModules();
    },2000);
  }

  transformShowMap() {

    this.setStateModulePanel(false);

    this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
    this.map.addLayer(this.eventMarkers);

    this.zoomControl.addTo(this.map);

    setTimeout(() => {
      this.showModuleFocus="";
    }, 500);

  }

  transformShowModules() {

    if (this.showModuleFocus==="") this.showModuleFocus = "module-c";
    this.setStateModulePanel(true);

    this.map.flyTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);
    this.map.removeLayer(this.eventMarkers);

    this.zoomControl.remove();

  }

  initMap() {

    this.map = leaflet.map("map",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 18,
      minZoom: 10
    }).addTo(this.map);

    this.map.panTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);

    this.transformShowMap();

  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {

    this.initMap();

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
  }

}
