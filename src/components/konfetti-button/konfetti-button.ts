import { 
  Component,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'konfetti-button',
  templateUrl: 'konfetti-button.html'
})
export class KonfettiButtonComponent {

  @Input() count:number = 0;
  @Input() state:string = 'vote';

  constructor() {
  }

}
