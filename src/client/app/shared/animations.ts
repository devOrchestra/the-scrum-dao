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

export const AlternativeControlFlashAnimation = trigger(
  'alternativeControlFlashAnimation',
  [
    transition('* => animate', [
      animate('1s ease-in-out', keyframes([
        style({opacity: 0}),
        style({opacity: 1}),
        style({opacity: 0}),
        style({opacity: 1}),
      ]))
    ])
  ]);

export const ShortEnterAnimation = trigger(
  'shortEnterAnimation',
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

export const ControlledFadeOutHighlightAnimation = trigger(
  'controlledFadeOutHighlightAnimation',
  [
    transition('* => animate', [
      animate('4s ease-in-out', keyframes([
        style({backgroundColor: '#fffa7a'}),
        style({backgroundColor: 'transparent'})
      ]))
    ]),
  ]);

export const MediumEnterLeaveAnimation = trigger(
  'mediumEnterLeaveAnimation',
  [
    transition(
      ':enter', [
        style({'opacity': 0}),
        animate('500ms', style({'opacity': 1}))
      ]
    ),
    transition(
      ':leave', [
        style({'opacity': 1}),
        animate('500ms', style({'opacity': 0}))
      ]
    )
  ]
);

export const MediumControlledEnterLeaveAnimation = trigger(
  'mediumControlledEnterLeaveAnimation',
  [
    transition('* => animate', [
      animate('500ms ease-in-out', keyframes([
        style({opacity: 0}),
        style({opacity: 1})
      ]))
    ]),
    transition('animate => void', [
      animate('500ms ease-in-out', keyframes([
        style({opacity: 1}),
        style({opacity: 0})
      ]))
    ])
  ]);

export const LongControlledEnterLeaveAnimation = trigger(
  'longControlledEnterLeaveAnimation',
  [
    transition('* => animate', [
      animate('0.6s ease-in-out', keyframes([
        style({opacity: 0}),
        style({opacity: 1})
      ]))
    ]),
    transition('* => void', [
      animate('0.6s ease-in-out', keyframes([
        style({opacity: 1}),
        style({opacity: 0})
      ]))
    ])
  ]);
