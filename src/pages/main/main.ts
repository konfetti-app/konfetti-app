import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage } from 'ionic-angular';
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
})
export class MainPage {

  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  showMap: boolean = false;
  showModuleFocus : string = "";
  showComment : boolean = true;

  lon : number = 13.408277;
  lat : number = 52.520476;
  zoom : number = 16;

  eventMarkers : any;
  zoomControl : any;


  constructor() {
    this.showModuleFocus = "module-a";

    this.eventMarkers = leaflet.featureGroup();
    let marker: any = leaflet.marker([this.lat, this.lon]).on('click', () => {
      alert('Marker clicked');
    });
    this.eventMarkers.addLayer(marker);

    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });
  }


  buttonModule(moduleName: string) {

    if (this.showMap) this.transformShowModules();

    // TODO: Switch Modules Animation
    console.log("TODO: Animation Switch Modules");

    this.showModuleFocus = moduleName;
  }

  buttonMap() {
    if (!this.showMap) this.transformShowMap();
  }

  buttonQRCodeScan() {
    alert('TODO');
  }

  buttonComment() {
    this.showComment = false;
    setTimeout(() => {
      this.transformShowModules();
    },300);
  }

  transformShowMap() {

    this.showMap = true;
    this.map.flyTo({lon: this.lon, lat: this.lat}, this.zoom);
    this.map.addLayer(this.eventMarkers);

    this.zoomControl.addTo(this.map);

  }

  transformShowModules() {

    this.showMap = false;
    this.map.flyTo({lon: this.lon, lat: this.lat-0.0025}, this.zoom);
    this.map.removeLayer(this.eventMarkers);

    this.zoomControl.remove();

  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.loadmap();
  }

  loadmap() {

    this.map = leaflet.map("map",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 18,
      minZoom: 10
    }).addTo(this.map);

    this.transformShowMap();

  }

}
