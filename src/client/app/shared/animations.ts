import { trigger, style, transition, animate, query, stagger, keyframes } from '@angular/animations';

export const FlashAnimation = trigger(
  'flashAnimation',
  [
    transition('void => *', [
        animate('1s ease-in-out', keyframes([
          style({opacity: 0}),
          style({opacity: 1}),
          style({opacity: 0}),
          style({opacity: 1}),
        ]))
    ])
  ]);

// @keyframes flash {
//   from, 50%, to {
//     opacity: 1;
//   }
//
//   25%, 75% {
//     opacity: 0;
// }
// }
