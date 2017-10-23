import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MainPage } from "../main/main";

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  buttonChangeProfilePicture() : void {
    alert("TODO: take picture from cam or file");
  }

  buttonHome() : void {
    this.navCtrl.setRoot(MainPage, {showIntro:false}).then();
  }

}
