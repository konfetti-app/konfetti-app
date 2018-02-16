import {
  Component
} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the IdeaEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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

  date: Date;
  dateOpacity: number = 1;

  wantsHelper: boolean = false;
  wantsGuest: boolean = false;
  helpDescription: string = "";

  minDate:string = new Date().toISOString();
  maxDate:string = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString();

  constructor(public navCtrl: NavController, public navParams: NavParams) {
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
    if (this.date == null) {
      this.dateOpacity = 0;
      setTimeout(() => {
        this.dateOpacity = 1;
      }, 500);
      return;
    }

    // check date is in the future
    if (new Date(this.date).getTime() < Date.now()) {
      alert("Date is in Past");
      return;
    }

    // data to send to server
    let data: any = {};
    data.title = this.title;
    data.description = this.description;
    data.address = this.address;
    data.gps = null; // later translate address to lat/lon
    data.date = new Date(this.date).getTime();
    data.wantsHelper = this.wantsHelper;
    data.helpDescription = this.helpDescription;
    data.wantsGuest = this.wantsGuest;

    alert('TODO: store on server:' + JSON.stringify(data));

  }

}
