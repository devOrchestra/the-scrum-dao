import { Component } from '@angular/core';

@Component({
  selector: 'app-project-backlog-add-track-dialog',
  templateUrl: './project-backlog-add-track-dialog.component.html',
  styleUrls: ['./project-backlog-add-track-dialog.component.css']
})
export class ProjectBacklogAddTrackDialogComponent {
  track: string;
  storyDescription: string;

  sendData() {
    return {track: this.track, storyDescription: this.storyDescription};
  }
}
