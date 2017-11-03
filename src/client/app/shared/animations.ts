import { trigger, style, transition, animate, query, stagger, keyframes } from '@angular/animations';

export const FlashAnimation = trigger(
  'flashAnimation',
  [
    transition('void => animate', [
        animate('1s ease-in-out', keyframes([
          style({opacity: 0}),
          style({opacity: 1}),
          style({opacity: 0}),
          style({opacity: 1}),
        ]))
    ]),
    transition('animate => void', [
      animate('1s ease-in-out', keyframes([
        style({opacity: 1}),
        style({opacity: 0}),
        style({opacity: 1}),
        style({opacity: 0}),
      ]))
    ])
  ]);

export const InputEnterLeaveAnimation = trigger(
  'inputEnterLeaveAnimation',
  [
    transition(
      ':enter', [
        style({'opacity': 0}),
        animate('300ms', style({'opacity': 1}))
      ]
    ),
    transition(
      ':leave', [
        style({'opacity': 1}),
        animate('0ms', style({'opacity': 0}))
      ]
    )
  ]
);
