import { Component, Input } from '@angular/core';
import { 
  Events
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

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

    // the neighborhoodId the newsfeed is working on
    activeGroupId: string;

  constructor(
    private api: ApiProvider,
    private state: AppStateProvider,
    private events: Events,
    private persistence: AppPersistenceProvider,
    private translateService : TranslateService // needed in template as parameter for pipe since
  ) {

    this.isIOS = this.state.isIOS();

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

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

    this.api.getNewsFeedPosts(this.activeGroupId).subscribe((posts:Array<Post>)=>{
      // WIN

      // fake posts for now
      // TODO: use results from API
      this.posts = posts;
      this.loading = false;

    }, (error) => {
      this.loading = false;
      console.error("FAIL: Was not able to load newsfeed - using fake data");

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

    });

    setTimeout(()=>{

    },2000);

  }

  public selectCard(post:Post) : void {
    this.events.publish('notification:process',post.meta as PushNotification);
  }

  public closePost(post:Post) : void {

    alert("TODO: Activate Real Delete once no simulated content anymore");
    /*
    this.api.deleteNewsFeedPost(post._id).subscribe(
      () => {
        // WIN
      }, (error) => {
        // FAIL
      }
    );*/

    // find post and delete from array
    this.posts = this.posts.filter((arrayPost)=>{
      return arrayPost._id!=post._id;
    })

  }

}
