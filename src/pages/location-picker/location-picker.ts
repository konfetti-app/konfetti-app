import { 
  Component,
  ViewChild, 
  ElementRef 
} from '@angular/core';
import { 
  IonicPage, 
  NavController, 
  NavParams 
} from 'ionic-angular';

import leaflet from 'leaflet';

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
  lon : number = 9.799805;
  lat : number = 50.719939;
  zoom : number = 15;

  marker : any;
  eventMarkers : any;
  zoomControl : any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.initMap();
  }

  private initMap() : void {

    if (this.mapInitDone) return;

    this.map = leaflet.map("mappicker",{zoomControl: false}).fitWorld();
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'konfettiapp.de',
      maxZoom: 18,
      minZoom: 12
    }).addTo(this.map);

    this.zoomControl = leaflet.control.zoom({
      position:'topleft'
    });
    this.zoomControl.addTo(this.map);

    setTimeout(()=>{
      this.map.panTo({lon: this.lon, lat: this.lat}, this.zoom);
    },300);

    this.eventMarkers = leaflet.featureGroup();
    this.map.addLayer(this.eventMarkers);

    this.map.on('click', (e) => {
      console.log('click',e.latlng);
    
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;

      if (this.zoom<16) {
        this.zoom = 16;
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
    console.log("added on click");

    this.mapInitDone = true;

  }

  private buttonContinue() : void {
    alert("TODO");
  }

}
