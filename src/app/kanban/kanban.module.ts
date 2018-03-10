import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { KanbanComponent } from './kanban.component';
import { ColumnComponent } from './column/column.component';
import {CardModule} from 'primeng/card';

@NgModule({
  imports: [
    CommonModule,
      CardModule,
  ],
  declarations: [CardComponent, KanbanComponent, ColumnComponent],
    exports: [
        KanbanComponent
    ]
})
export class KanbanModule { }
