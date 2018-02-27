import {
  Component
} from '@angular/core';
import { 
  IonicPage, 
  NavParams,
  NavController, 
  ToastController, 
  LoadingController,
  ModalController,
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";
import { ApiProvider, Idea } from '../../providers/api/api';
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";
import { AppStateProvider } from "../../providers/app-state/app-state";
import { LocationPickerPage } from '../../pages/location-picker/location-picker';

@IonicPage()
@Component({
  selector: 'page-idea-edit',
  templateUrl: 'idea-edit.html',
})
export class IdeaEditPage {

  title: string = "";
  titleOpacity: number = 1;

  description: string = "";
  descriptionOpacity: number = 1;

  address: string = "";
  addressOpacity: number = 1;

  date: any = new Date(0);
  dateOpacity: number = 1;

  wantsHelper: boolean = false;
  wantsGuest: boolean = false;
  helpDescription: string = "";
  selectOpacity: number = 1;

  minDate:string = new Date(Date.now() - ( new Date().getTimezoneOffset() * 1000 * 60 )).toISOString();
  maxDate:string = new Date(Date.now() + (184 * 24 * 60 * 60 * 1000)).toISOString();

  idea:Idea;

  activeGroupId:string;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private persistence: AppPersistenceProvider,
    private api: ApiProvider,
    private loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private state: AppStateProvider,
  ) {

    // get idea from parameter if this should be an edit
    this.idea = this.navParams.get("idea") as Idea;
    if (this.idea) {

      // ionic time input is ignoring local time offset - workaround
      let serverTimestamp = new Date(this.idea.date).getTime();
      let localTimestamp = serverTimestamp - ( new Date().getTimezoneOffset() * 1000 * 60);
      let inputDate = new Date(localTimestamp).toISOString();
      console.log("ideaDate("+this.idea.date+")");
      console.log("serverTimestamp("+serverTimestamp+")");
      console.log("localTimestamp("+localTimestamp+")");
      console.log("inputDate("+inputDate+")");

      this.address = this.idea.address;
      this.description = this.idea.description;
      this.date = inputDate;
      this.helpDescription = this.idea.helpDescription;
      this.wantsGuest = this.idea.wantsGuest;
      this.wantsHelper = this.idea.wantsHelper;
      this.title = this.idea.title;
    }

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad IdeaEditPage');
  }

  buttonContinue() {

    // check title
    this.title = this.title.trim();
    if (this.title.length == 0) {
      this.titleOpacity = 0;
      setTimeout(() => {
        this.titleOpacity = 1;
      }, 500);
      return;
    }

    // check description
    this.description = this.description.trim();
    if (this.description.length == 0) {
      this.descriptionOpacity = 0;
      setTimeout(() => {
        this.descriptionOpacity = 1;
      }, 500);
      return;
    }

    // check address
    this.address = this.address.trim();
    if (this.address.length == 0) {
      this.addressOpacity = 0;
      setTimeout(() => {
        this.addressOpacity = 1;
      }, 500);
      return;
    }

    // check date filled out
    if ((this.date == null) || (new Date(this.date).getTime() == 0)) {
      this.dateOpacity = 0;
      setTimeout(() => {
        this.dateOpacity = 1;
      }, 500);
      return;
    }

    // check date is in the future
    if (new Date(this.date).getTime() < Date.now()) {
      this.toastCtrl.create({
        message: this.translateService.instant('IDEAEDIT_DATEINPAST'),
        cssClass: 'toast-invalid',
        duration: 4000
      }).present().then();
      return;
    }

    // check if checkmarks are set
    console.log("this.wantsGuest", this.wantsGuest);
    console.log("this.wantsHelper", this.wantsHelper);
    if ((!this.wantsGuest) && (!this.wantsHelper)) {

      setTimeout(() => {
        this.selectOpacity = 0;
        setTimeout(() => {
          this.selectOpacity = 1;
        }, 500);
      }, 1000);

      this.toastCtrl.create({
        message: this.translateService.instant('IDEAEDIT_CHOOSEAUDIENCE'),
        cssClass: 'toast-invalid',
        duration: 5000
      }).present().then();
      return;

    }

    // when help description is needed
    this.helpDescription = this.helpDescription.trim();
    if ((this.wantsHelper) && (this.helpDescription.length == 0)) {
      this.toastCtrl.create({
        message: this.translateService.instant('IDEAEDIT_HELPDETAIL'),
        cssClass: 'toast-invalid',
        duration: 4000
      }).present().then();
      return;
    }

    let focusGroupId = this.persistence.getAppDataCache().lastFocusGroupId;
    let group = this.state.getNeighbourhoodById(focusGroupId);
    console.log("group",group);

    let pickerData: any = {
      notice: this.translateService.instant('LOCATIONPICKER_IDEA'),
      address: this.address,
      textButton: this.translateService.instant('OK')
    };
    if ((group!=null) && (group.geoData != null)) {
      pickerData.mapPosition = {
        lat: group.geoData.latitude,
        lon: group.geoData.longitude
      };
    }
    if ((this.idea!=null) && (this.idea.geoData != null)
      && (this.idea.geoData.latitude != null)
      && (this.idea.geoData.longitude != null)) {
      pickerData.pinPosition = {
        lat: this.idea.geoData.latitude,
        lon: this.idea.geoData.longitude
      };
    }
    let modal = this.modalCtrl.create(LocationPickerPage, pickerData);
    modal.onDidDismiss((locationData) => {

      // got location data from server
      if (locationData.success) {

        // ionic time input is ignoring local time offset - workaround
        let localTimestamp = new Date(this.date).getTime();
        let serverTimestamp = localTimestamp + ( new Date().getTimezoneOffset() * 1000 * 60);
        let serverDate = new Date(serverTimestamp).toISOString();
        console.log("inputDate("+this.date+")");
        console.log("localTimestamp("+localTimestamp+")");
        console.log("serverTimestamp("+serverTimestamp+")");
        console.log("sendToServer("+serverDate+")");

        // data to send to server
        let data: any = {};
        data.parentNeighbourhood = this.activeGroupId;
        data.title = this.title;
        data.description = this.description;
        data.address = this.address;
        data.date = serverTimestamp;
        data.wantsHelper = this.wantsHelper;
        data.helpDescription = this.helpDescription;
        data.wantsGuest = this.wantsGuest;
        if (locationData.lat != null) {
          data.geoData = {
            longitude: locationData.lon,
            latitude: locationData.lat
          }
        };

        // when its updated
        if (!this.idea) {

          // CREATE    
          let loadingSpinner = this.loadingCtrl.create({
            content: ''
          });
          loadingSpinner.present().then();
          this.api.createKonfettiIdea(data).subscribe(
            (win: string) => {

              console.log("OK new idea created with id: " + win);

              this.toastCtrl.create({
                message: this.translateService.instant('OK'),
                cssClass: 'toast-valid',
                duration: 2000
              }).present().then();

              setTimeout(() => {
                loadingSpinner.dismiss().then();
                this.navCtrl.pop();
              }, 2000);

            },
            (error) => {
              loadingSpinner.dismiss().then();
              alert("FAILED TO CREATE IDEA:" + JSON.stringify(error));
              this.navCtrl.pop();
            }
          );

        } else {

          //UPDATE
          let loadingSpinner = this.loadingCtrl.create({
            content: ''
          });
          loadingSpinner.present().then();
          data._id = this.idea._id;
          this.api.updateKonfettiIdea(data).subscribe(
            (win) => {

              console.log("OK idea updated: " + win);

              this.toastCtrl.create({
                message: this.translateService.instant('OK'),
                cssClass: 'toast-valid',
                duration: 2000
              }).present().then();

              setTimeout(() => {
                loadingSpinner.dismiss().then();
                /*
                this.idea.address = this.address;
                this.idea.description = this.description;
                this.idea.helpDescription = this.helpDescription;
                this.idea.date = this.date;
                this.idea.wantsGuest = this.wantsGuest;
                this.idea.wantsHelper = this.wantsHelper;
                this.idea.geoData.latitude = locationData.lat;
                this.idea.geoData.longitude = locationData.lon;
                */
                this.navCtrl.popToRoot();
              }, 2000);

            },
            (error) => {
              loadingSpinner.dismiss().then();
              alert("FAILED TO UPDATE IDEA:" + JSON.stringify(error));
              this.navCtrl.pop();
            }
          );

        }
      }

    });
    modal.present();

  }
}
