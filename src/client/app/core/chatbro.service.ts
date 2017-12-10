import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ChatbroService {
  constructor(
    private http: Http
  ) { }

  getChatbroId(): Promise<any> {
    return this.http.get(`/static/chatbro-id.json`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error || error.message || error._body);
  }
}
