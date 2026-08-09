import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TellevoPage } from './tellevo.page';

const routes: Routes = [
  {
    path: '',
    component: TellevoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TellevoPageRoutingModule {}
