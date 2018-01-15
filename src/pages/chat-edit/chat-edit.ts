import { 
  Component,
  ViewChild
} from '@angular/core';

import { 
  IonicPage, 
  NavController, 
  Slides,
  NavParams,
  ToastController
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { Chat } from '../../providers/api/api';

/**
 * Generated class for the ChatEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-edit',
  templateUrl: 'chat-edit.html',
})
export class ChatEditPage {

  @ViewChild(Slides) slides: Slides;

  // input data
  chat:Chat;
  callback:any;

  // edit data
  chatTitle:string;
  chatIconIndex:number;

  // emoji catalog (sub set of emojis that make sense)
  emojiMap:Array<string> = [
    "💭","💬","😳","😔","😒","😢","😂","😕","😍","👮","👷","👶","👨","👪","👩","👴","👵","🌷","🎓","🎁","🎉","🔥","💧","💤","👂","👀","👃","👄","🙏","👏","🚶","🏃","💃",
    "💇","💅","👕","👗","👖","👙","💼","👣","🐶","🐱","🐹","🐰","🐣","🐜","🐟","🍁","🍄","🌐","🌜","⛅","❄️","⛄","🌈","🎊","🎈","🎥","📷","💻","📱","📞","📺","🔈","📢",
    "⏰","🔒","💡","🔌","🔧","🔨","✉️","📦","📝","📅","📌","📖","🔬","🔭","📰","🎤","🎧","🎵","🎹","🎸","🎮","🃏","🀄","🎲","🏈","🏀","⚽","🎱","🎳","🚴","🏆","🏊","🍵",
    "🍶","🍼","🍺","🍷","🍴","🍳","🍦","🎂","🍰","🍪","🍎","🍒","🍓","🍍","🍅","🏡","🏠","🏫","🏢","🏥","⛪","🚆","🚌","🚗","🚖","🚚","🚒","🚑","🎭","♻️"
  ];

  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private translateService: TranslateService
  ) {

    // the  parameters
    this.chat = this.navParams.get('chat');
    this.callback = this.navParams.get('callback');
    
    // when new chat
    if (this.chat==null) {

      // default for new chat
      this.chatTitle = "";
      this.chatIconIndex = 0;

    } else {

      // set as in input data
      this.chatTitle = this.chat.title;
      this.chatIconIndex = this.getIconIndexByChar(this.chat.emoji);

    }
  }

  clickIcon():void {
    let currentIndex = this.slides.getActiveIndex();
    this.slides.slideTo(currentIndex+1, 300);
  }

  clickButton():void {

    // check that title is set by user
    if (this.chatTitle.trim().length==0) {
      this.toastCtrl.create({
        message: this.translateService.instant('CHATEDIT_TOAST_ENTERTITLE'),
        cssClass: 'toast-invalid',
        duration: 3000
      }).present().then();
      return;
    }

    // set chat data and return and make callback (which will close dialog)
    this.chat = new Chat();
    this.chat.title = this.chatTitle.trim();
    this.chat.title = this.chat.title.charAt(0).toUpperCase() + this.chat.title.slice(1);
    this.chat.emoji = this.emojiMap[this.slides.getActiveIndex()];
    this.callback(this.chat);
  }

  private getIconIndexByChar(emojiStr:string):number {

    // find index of emoji set on chat
    let index = 0;
    this.emojiMap.forEach(emoji => {
      if (emoji==emojiStr) return index;
      index++;
    });

    // if not found go with default icon index
    return 0;

  }

}
