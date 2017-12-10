import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { ChatbroService } from '../../../core/chatbro.service'

@Component({
  selector: 'app-chatbro',
  templateUrl: './chatbro.component.html',
  styleUrls: ['./chatbro.component.css']
})
export class ChatbroComponent implements AfterViewInit {
  constructor(
    private _elementRef: ElementRef,
    private _chatbroService: ChatbroService
  ) { }

  ngAfterViewInit() {
    this._chatbroService.getChatbroId()
      .then(data => {
        if (data.encodedChatId) {
          const s = document.createElement("script");
          s.type = "text/javascript";
          s.innerHTML = `
            /* Chatbro Widget Embed Code Start */
            function ChatbroLoader(chats,async){async=!1!==async;var params={embedChatsParameters:chats instanceof Array?chats:[chats],lang:navigator.language||navigator.userLanguage,needLoadCode:'undefined'==typeof Chatbro,embedParamsVersion:localStorage.embedParamsVersion,chatbroScriptVersion:localStorage.chatbroScriptVersion},xhr=new XMLHttpRequest;xhr.withCredentials=!0,xhr.onload=function(){eval(xhr.responseText)},xhr.onerror=function(){console.error('Chatbro loading error')},xhr.open('GET','//www.chatbro.com/embed.js?'+btoa(unescape(encodeURIComponent(JSON.stringify(params)))),async),xhr.send()}
            /* Chatbro Widget Embed Code End */
            ChatbroLoader({encodedChatId: '${data.encodedChatId}'});
          `;
          this._elementRef.nativeElement.appendChild(s);
        } else {
          throw new Error('You have to specify chat id in "chatbro-id.json" file like "encodedChatId": "CHAT_ID". Chat will not be loaded');
        }
      })
      .catch(err => {
        if (err.status === 404) {
          console.warn("Chatbro ID is not specified. Chat will not be loaded")
        } else {
          console.error(err);
        }
      });
  }
}
