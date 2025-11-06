import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaCardComponent } from './components/media-card/media-card.component';
import { MediaRowComponent } from './components/media-row/media-row.component';

@NgModule({
  declarations: [MediaCardComponent, MediaRowComponent],
  imports: [CommonModule],
  exports: [MediaCardComponent, MediaRowComponent],
})
export class SharedModule {}
