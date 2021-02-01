import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IgxSliderModule, IgxGridModule } from "@infragistics/igniteui-angular";
import {
	IgxDataChartCoreModule,
	IgxDataChartCategoryModule,
	IgxLegendModule,
  IgxDataChartInteractivityModule,
  IgxValueOverlayModule,
  IgxCalloutLayerModule,
  IgxDataChartAnnotationModule
 } from "igniteui-angular-charts";
import { NamePipe } from './name.pipe';
import 'hammerjs';
@NgModule({
  declarations: [
    AppComponent,
    NamePipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IgxSliderModule,
    IgxGridModule,
    IgxDataChartCoreModule,
		IgxDataChartCategoryModule,
		IgxLegendModule,
    IgxDataChartInteractivityModule,
    FormsModule,
    IgxValueOverlayModule,
    IgxCalloutLayerModule,
    IgxDataChartAnnotationModule,
    HammerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
