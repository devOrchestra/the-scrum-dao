import { Loc8rViaAngular2Page } from './app.po';

describe('loc8r-via-angular2 App', () => {
  let page: Loc8rViaAngular2Page;

  beforeEach(() => {
    page = new Loc8rViaAngular2Page();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
