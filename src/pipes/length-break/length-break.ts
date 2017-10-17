import { Pipe, PipeTransform } from '@angular/core';

/**
 * Breaks a string longer than given length with a <br>
 * Content needs to included like this:
 * [innerHTML]="'INTRO_REDEEMCOUPON' | translate | lengthBreak:10"
 */
@Pipe({
  name: 'lengthBreak',
})
export class LengthBreakPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {

    let length : number = 10;
    if (args.length>0) {
      try {
        length = args[0];
      } catch (e) {
        console.error("LengthBreakPipe - First Parameter not parseable to number.");
      }
    }

    let i = value.indexOf(' ',length);
    if (i>=length) value = value.substr(0, i) + '<br>' +  value.substring(i+1);

    return value;
  }
}
