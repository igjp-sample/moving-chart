import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FilteringExpressionsTree, FilteringLogic, IgxGridComponent, IgxSliderComponent, IgxStringFilteringOperand } from '@infragistics/igniteui-angular';
import * as Data from '../assets/data.json';
import { IgxCategoryXAxisComponent, IgxDataChartComponent, IgxNumericYAxisComponent, IgxPointSeriesComponent, IgxScatterSeriesComponent, MarkerType } from 'igniteui-angular-charts';

import { DataTemplateMeasureInfo, DataTemplateRenderInfo } from 'igniteui-angular-core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'moving-chart';
  data: any = (Data as any).default//.filter(item => item.rank_number < 11);
  chartData: Array<any> = [];
  presentData: Array<any> = [];
  timeFrame = [];
  players = [];
  sliderVal:string;
  private _timer;

  @ViewChild("slider")
  public slider: IgxSliderComponent;

  @ViewChild("grid", { read: IgxGridComponent, static: true })
  public grid: IgxGridComponent;

  @ViewChild("chart", { read: IgxDataChartComponent, static: true })
  public chart: IgxDataChartComponent;

  @ViewChild("yAxis", { read: IgxNumericYAxisComponent, static: true })
  public yAxis: IgxNumericYAxisComponent;

  @ViewChild("xAxis", { read: IgxCategoryXAxisComponent, static: true })
  public xAxis: IgxCategoryXAxisComponent;

  public markerSeries: IgxPointSeriesComponent;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.timeFrame =
      this.data
      .map(function(value) {
        return value.week_title;
      }).reduce((unique,item) =>
        unique.includes(item) ? unique : [...unique, item], [])
      .reverse();

    this.players =
      this.data
      .map(function(value) {
        return value.player_slug;
      }).reduce((unique,item) =>
        unique.includes(item) ? unique : [...unique, item], []);

    this.timeFrame.forEach((element, index) => {
      let series = this.data.filter(item => item.week_title === element).map(function(value) {
        var nameKey = "'" + value.player_slug + "'";
        return { week_title : value.week_title, [nameKey]: value.ranking_points}
      });
      var t = [...series.concat(series)
        .reduce((m, o) => m.set(o.a, Object.assign(m.get(o.a) || {}, o)),
        new Map()
      ).values()];
      this.presentData.push(t[0])
    });

    this.players.forEach((element, index) => {
      this.markerSeries = this.createMarkerSeries(element,0);
      this.chart.series.add(this.markerSeries);
    });

    this.sliderVal = this.timeFrame[0];
    this.updateData(this.timeFrame[0]);
    this.updateChart(0);
    this._timer = setInterval(() => this.ticker(), 250)
  }

  public sliderChanged(event) {
    this.sliderVal = this.timeFrame[event];
    this.updateData(this.timeFrame[event]);
  }

  private ticker() {
    this.updateSlider();
  }

  private dirUpCondition = (rowData: any, columnKey: any): boolean => {
    return rowData['move_direction'] == "up";
  }

  private dirDownCondition = (rowData: any, columnKey: any): boolean => {
      return rowData['move_direction'] == "down";
  }

  public directionClasses = {
    up: this.dirUpCondition,
    down: this.dirDownCondition
  };

  private updateData(date:string) {
    const gridFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    const dateExpression = {
        condition: IgxStringFilteringOperand.instance().condition("contains"),
        fieldName: "week_title",
        ignoreCase: true,
        searchVal: date
    };
    gridFilteringExpressionsTree.filteringOperands.push(dateExpression);
    this.grid.filteringExpressionsTree = gridFilteringExpressionsTree;
    this.cdr.detectChanges();
  }

  private updateChart(number:number) {
    this.chartData = this.presentData.map(function(value,index) {
      if (index <= number) {
        return value;
      } else {
        return { week_title : value.week_title }
      }
    });
    this.chart.series.clear();
    this.players.forEach((element, index) => {
      this.markerSeries = this.createMarkerSeries(element,number);
      this.chart.series.add(this.markerSeries);
    });
  }

  public createMarkerSeries(player: string, number: number): IgxPointSeriesComponent {
    const series = new IgxPointSeriesComponent();
    series.markerType = MarkerType.Circle;
    series.xAxis = this.xAxis;
    series.yAxis = this.yAxis;
    series.markerBrush = 'white';
    series.markerOutline = '#e41c77';
    series.valueMemberPath = "'"+player+"'";
    series.markerTemplate = this.getMarker(player);
    var arr = this.presentData.map(function(value,index) {
      if (index == number) {
        return value;
      } else {
        return { week_title : value.week_title }
      }
    });
    series.dataSource = arr;
    series.showDefaultTooltip = true;
    return series;
  }

  public getIconType(cell) {
    switch (cell.row.rowData.move_direction) {
      case "up":
        return "arrow_upward";
      case "down":
        return "arrow_downward";
    }
  }

  public getBadgeType(cell) {
    switch (cell.row.rowData.move_direction) {
      case "up":
        return "success";
      case "down":
        return "error";
    }
  }

  public getMarker(player: string): any {
    var style = { color: "#e41c77", fill: "white", text: "black" };
    const size = 12;
    const radius = size / 2;
    var nameArr = player.split('-');
    const name = decodeURI(nameArr[1].charAt(0).toUpperCase() + nameArr[1].slice(1));
    return {
        measure: function (measureInfo: DataTemplateMeasureInfo) {
            const context = measureInfo.context;
            const height = context.measureText("M").width;
            const width = context.measureText(name).width;
            measureInfo.width = width;
            measureInfo.height = height + size;
        },
        render: function (renderInfo: DataTemplateRenderInfo) {
          const ctx = renderInfo.context as CanvasRenderingContext2D;
          let x = renderInfo.xPosition;
          let y = renderInfo.yPosition;
          let halfWidth = renderInfo.availableWidth / 2.0;
          let halfHeight = renderInfo.availableHeight / 2.0;
          if (renderInfo.isHitTestRender) {
              ctx.fillStyle = renderInfo.data.actualItemBrush.fill;
              ctx.fillRect(x, y, renderInfo.availableWidth, renderInfo.availableHeight);
              return;
          } else {
              ctx.beginPath();
              ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = style.fill;
              ctx.fill();
              ctx.lineWidth = 2;
              ctx.strokeStyle = style.color;
              ctx.stroke();
              ctx.closePath();
          }
          x = renderInfo.xPosition + 5;
          y = renderInfo.yPosition + 7.5;
          if (y < 0) {
              y -= renderInfo.availableHeight + 7.5;
          }
          let bottomEdge = renderInfo.passInfo.viewportTop + renderInfo.passInfo.viewportHeight;
          if (y + renderInfo.availableHeight > bottomEdge) {
              y -= renderInfo.availableHeight + 5;
          }
          let rightEdge = renderInfo.passInfo.viewportLeft + renderInfo.passInfo.viewportWidth;
          if (x + renderInfo.availableWidth > rightEdge) {
              x -= renderInfo.availableWidth + 12;
          }
          ctx.beginPath();
          ctx.fillStyle = style.color;
          ctx.fillRect(x - 2, y - 2, renderInfo.availableWidth + 8, halfHeight + 6);
          ctx.closePath();

          ctx.font = '8pt Verdana';
          ctx.textBaseline = "top";
          ctx.fillStyle = style.fill;
          ctx.fillText(name, x + 2, y + 1);
        }
      }
    }

  private updateSlider() {
    var next = Number(this.slider.value);
    if (this.timeFrame[next + 1]) {
      this.slider.value = next + 1;
      this.sliderVal = this.timeFrame[next + 1];
      this.updateData(this.timeFrame[next + 1]);
      this.updateChart(next + 1);
    } else {
      this.grid.columnList.toArray().forEach((column) => {
        column.cellClasses = {};
      })
    }
  }
}
