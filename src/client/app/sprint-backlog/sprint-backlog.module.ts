import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SprintBacklogComponent } from './sprint-backlog.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [SprintBacklogComponent]
})
export class SprintBacklogModule { }
