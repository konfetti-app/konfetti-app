import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

/**
 * Takes a timestamp from server and prints it like 'since 2 hours'
 */
@Pipe({
  name: 'since',
})
export class SincePipe implements PipeTransform {

  transform(value: string, ...args) {

    let translateService: TranslateService = null;
    if (args.length>0) {
      try {
        translateService = args[0] as TranslateService;
      } catch (e) {
        console.error("SincePipe - First Parameter not parseable to TranslateService.");
      }
    }

    let translate = (key:string) => {
      if (translateService==null) return key;
      return translateService.instant('PIPE_SINCE_'+key.toUpperCase());
    }

    // timestamp diff to now
    let timediff = Date.now()-Number(value);

    // just in case something is off
    if (timediff<0) return "vor kurzem";

    // to minutes and return if not an hour yet
    let minutes = Math.floor(timediff / (60 * 1000));
    if (minutes<2) minutes=2;
    if (minutes < 60) {
      return translate("since")+" "+minutes+" "+translate("minutes");
    }

    // to hours and return if not a day yet
    let hours = Math.floor(minutes / 60);
    if (hours<1) hours=1;
    if (hours==1) {
      return translate("since")+" 1 "+translate("hour");
    }
    if (hours<24) {
      return translate("since")+" "+hours+" "+translate("hours");
    }

    // to days
    let days = Math.floor(hours / 24);
    if (days==1) {
      return translate("since")+" 1 "+translate("day");
    }
    return translate("since")+" "+days+" "+translate("days");

  }
}
