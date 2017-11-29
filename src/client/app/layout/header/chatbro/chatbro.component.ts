import { Component, AfterViewInit, ElementRef } from '@angular/core';
import * as chatbro_json from '../../../../../../credentials/chatbro-id.json';

@Component({
  selector: 'app-chatbro',
  templateUrl: './chatbro.component.html',
  styleUrls: ['./chatbro.component.css']
})
export class ChatbroComponent implements AfterViewInit {
  constructor(
    private _elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
    const chatbroId = (<any>chatbro_json).encodedChatId;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.innerHTML = `
      /* Chatbro Widget Embed Code Start */
      function ChatbroLoader(chats,async){async=!1!==async;var params={embedChatsParameters:chats instanceof Array?chats:[chats],lang:navigator.language||navigator.userLanguage,needLoadCode:'undefined'==typeof Chatbro,embedParamsVersion:localStorage.embedParamsVersion,chatbroScriptVersion:localStorage.chatbroScriptVersion},xhr=new XMLHttpRequest;xhr.withCredentials=!0,xhr.onload=function(){eval(xhr.responseText)},xhr.onerror=function(){console.error('Chatbro loading error')},xhr.open('GET','//www.chatbro.com/embed.js?'+btoa(unescape(encodeURIComponent(JSON.stringify(params)))),async),xhr.send()}
      /* Chatbro Widget Embed Code End */
      ChatbroLoader({encodedChatId: '${chatbroId}'});
    `;
    this._elementRef.nativeElement.appendChild(s);
  }
}
