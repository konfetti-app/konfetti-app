import { 
  Component,
  ViewChild
} from '@angular/core';

import { 
  IonicPage, 
  Slides,
  NavParams,
  ViewController,
  ToastController
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { Chat } from '../../providers/api/api';

/**
 * Used to edit/create the metadata of a chat.
 */

@IonicPage()
@Component({
  selector: 'page-chat-edit',
  templateUrl: 'chat-edit.html',
})
export class ChatEditPage {

  @ViewChild(Slides) slides: Slides;

  // edit/new mode
  newChatMode:boolean = true;

  // input data
  chat:Chat;

  // edit data
  chatTitle:string;
  chatIconIndex:number;

  // emoji catalog (sub set of emojis that make sense)
  emojiMap:Array<string> = [
    "💭","💬","🌷","🎓","🎁","🔥","💧","💤","👂","👀","👃","👄","🙏","👏","🚶","🏃","💃","😳","😔","😒","😢","😂","😕","😍","👮","👷","👶","👨","👪","👩","👴","👵",
    "💇","💅","👕","👗","👖","👙","💼","👣","🐶","🐱","🐹","🐰","🐣","🐜","🐟","🍁","🍄","🌐","🌜","⛅","❄️","⛄","🌈","🎊","🎈","🎥","📷","💻","📱","📞","📺","🔈","📢",
    "⏰","🔒","💡","🔌","🔧","🔨","✉️","📦","📝","📅","📌","📖","🔬","🔭","📰","🎤","🎧","🎵","🎹","🎸","🎮","🃏","🀄","🎲","🏈","🏀","⚽","🎱","🎳","🚴","🏆","🏊","🍵",
    "🍶","🍼","🍺","🍷","🍴","🍳","🍦","🎂","🍰","🍪","🍎","🍒","🍓","🍍","🍅","🏡","🏠","🏫","🏢","🏥","⛪","🚆","🚌","🚗","🚖","🚚","🚒","🚑","🎭","♻️"
  ];

  constructor(
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private viewCtrl: ViewController,
    private translateService: TranslateService
  ) {

    // the  parameters
    this.chat = this.navParams.get('chat');
    
    // when new chat
    if ((this.chat==null) || (this.chat.name==""))  {

      this.newChatMode = true;
      console.log("ChatEdit: Act in NEW CHAT mode.");

      // default for new chat
      this.chatTitle = "";
      this.chatIconIndex = 0;

    } else {

      this.newChatMode = false;
      console.log("ChatEdit: Act in EDIT CHAT mode.", this.chat);

      // set as in input data
      this.chatTitle = this.chat.name;
      this.chatIconIndex = this.getIconIndexByChar(this.chat.description);

    }
  }

  ionViewDidEnter() {
    this.slides.slideTo(this.chatIconIndex, 10);
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
    if (this.chat==null) this.chat = {} as Chat;
    this.chat.name = this.chatTitle.trim();
    this.chat.name = this.chat.name.charAt(0).toUpperCase() + this.chat.name.slice(1);
    this.chat.description = this.emojiMap[this.slides.getActiveIndex()];
    this.viewCtrl.dismiss({ chat: this.chat } ).then();
  }

  buttonClose(): void {
    this.viewCtrl.dismiss(null).then();
  }  

  private getIconIndexByChar(emojiStr:string):number {

    // find index of emoji set on chat
    let index = 0;
    let result = 0;
    this.emojiMap.forEach(emoji => {
      if (emoji==emojiStr) result=index; 
      index++;
    });
    return result;

  }

}
