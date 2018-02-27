import { 
  Component,
  ViewChild, 
  ElementRef 
} from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  NavParams,
  ViewController,
} from 'ionic-angular';

import leaflet from 'leaflet';
import { TranslateService } from "@ngx-translate/core";

/**
 * Use Leafelet Map to pick a location.
 * TODO: check for geocoding: https://ionicframework.com/docs/native/native-geocoder/
 */
@IonicPage()
@Component({
  selector: 'page-location-picker',
  templateUrl: 'location-picker.html',
})
export class LocationPickerPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  mapInitDone:boolean = false;

  // start map setting:
  // Center of Germany
  lon : number = null;
  lat : number = null;
  initLon: number = 9.799805;
  initLat: number = 50.719939;
  zoom : number = 16;

  marker : any;
  eventMarkers : any;
  zoomControl : any;

  textButton:string;
  notice:string;
  address:string;

  constructor(
    public navCtrl: NavController,
    public params: NavParams,
    private viewCtrl: ViewController,
    private translateService: TranslateService,
  ) {

    // default values
    this.textButton = this.translateService.instant('OK');
    this.notice = null;
    this.address = null;

    // parse parameters when profile is opened
    if ((this.params != null) && (this.params.data != null)) {

      // text for continue button
      if ((typeof this.params.data.textButton != 'undefined') && (this.params.data.textButton != null)) {
        this.textButton = this.params.data.textButton;
      }

      // text over location picker
      if ((typeof this.params.data.notice != 'undefined') && (this.params.data.notice != null)) {
        this.notice = this.params.data.notice;
      }

      // text over location picker
      if ((typeof this.params.data.address != 'undefined') && (this.params.data.address != null)) {
        this.address = this.params.data.address;
      }

      // lat & lon map init position
      if ((typeof this.params.data.mapPosition != 'undefined') && (this.params.data.mapPosition != null)) {
        this.initLat = this.params.data.mapPosition.lat;
        this.initLon = this.params.data.mapPosition.lon;
      }

      // lat & lon of pin location
      if ((typeof this.params.data.pinPosition != 'undefined') && (this.params.data.pinPosition != null)) {
        this.lat = this.params.data.pinPosition.lat;
        this.lon = this.params.data.pinPosition.lon;
      }

    }
  }

  ionViewDidLoad() {
    this.initMap();
  }

  private initMap() : void {

    this.zoom = 15;
    if (this.mapInitDone) return;

    // init map
    this.map = leaflet.map("mappicker",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 20,
      minZoom: 14,
      center: [this.lat, this.lon],
      zoom: this.zoom,
    }).addTo(this.map);

    // add zoom control
    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });
    this.zoomControl.addTo(this.map);

    // prepare pin layer
    this.eventMarkers = leaflet.featureGroup();
    this.map.addLayer(this.eventMarkers);

    // if init position for pin is known
    if ((this.lat!=null) && (this.lon!=null)) {
      this.marker = leaflet.marker([this.lat, this.lon]);
      this.eventMarkers.addLayer(this.marker);
      this.zoom = 17;
    }

    // go to init position
    setTimeout(()=>{
      this.map.panTo({lon: this.initLon, lat: this.initLat}, this.zoom);
    },300);

    // when user clicks on map to set pin
    this.map.on('click', (e) => {
      console.log('click',e.latlng);
    
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;

      if (this.zoom<17) {
        this.zoom = 17;
        this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
      } else {
        this.map.panTo({lon: this.lon, lat: this.lat}, this.zoom);
      }

      if (this.marker!=null) {
        this.eventMarkers.removeLayer(this.marker);
      }
      this.marker = leaflet.marker([this.lat, this.lon]);
      this.eventMarkers.addLayer(this.marker);

      });

    this.mapInitDone = true;
    
    // just to mute lint parser, that buttonClose and buttonContinue are never used :|
    if (this.zoom==999) this.buttonClose();
    if (this.zoom==998) this.buttonContinue();

  }

  private buttonContinue() : void {
    this.viewCtrl.dismiss({ success: true, lat: this.lat, lon: this.lon } ).then();
  }

  private buttonClose() : void {
    this.viewCtrl.dismiss({ success: false } ).then();
  }

}
