import { Component, Input } from '@angular/core';
import { 
  Events
} from 'ionic-angular';

import { AppStateProvider } from "../../providers/app-state/app-state";

import { ApiProvider, Post, PushNotification } from '../../providers/api/api';

@Component({
  selector: 'module-newsfeed',
  templateUrl: 'module-newsfeed.html'
})
export class ModuleNewsfeedComponent {

  @Input() config = null;

    // true if network request is going on
    loading:boolean = false;
  
    // chats to display
    posts:Array<Post> = [];
  
    // flag is running on iOS
    isIOS: boolean;

  constructor(
    private api: ApiProvider,
    private state: AppStateProvider,
    private events: Events,
  ) {

    this.isIOS = this.state.isIOS();

    /*
     * Event Bus
     * https://ionicframework.com/docs/api/util/Events/
     */

    this.events.subscribe("refresh:news", () => {
      console.log("Eventbus: Refresh Newsfeed");
      if (!this.loading) {
        console.log("Refreshing post list ...");
        this.refreshData();
      } else {
        console.log("Ignore refresh ... because still in loading process.");
      }
    });

    // init data
    this.refreshData();

  }

  // unsubscribe from event bus when component gets destroyed
  ngOnDestroy() {
    this.events.unsubscribe("refresh:news");
  }

  private refreshData() : void {

    this.loading = true;
    setTimeout(()=>{
      this.posts = [];
      this.posts.push({
        _id: "xxx0",
        type: "notification",
        ts: Date.now() - (60 * 60 * 2 * 1000),
        parentThread: "xxx1",
        data: {
          text: "Katja hat den Beitrag 'Katze gesucht' im Chat kommentiert."
        },
        meta: {
          pushIDs: ['xxxx1', 'xxxx2'],
          module: 'groupchats',
          itemID: '5a61d10d11adf00fcb7c3452',
          subID: null
        }
      } as Post);
      this.loading = false;
    },2000);

  }

  public selectCard(post:Post) : void {
    this.events.publish('notification:process',post.meta as PushNotification);
  }

  public closePost(post:Post) : void {
    this.posts = [];
  }

}
