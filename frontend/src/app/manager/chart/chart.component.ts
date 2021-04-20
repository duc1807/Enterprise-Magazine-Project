import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { StatisticsService } from '../../services/statistics.service';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  // Bar chart
  barChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: 'IT articles stats',
      display: true,
    },
  };
  barChartLabels: Label[] = [
    ',Apple',
    'Banana',
    'Kiwifruit',
    'Blueberry',
    'Orange',
    'Grapes',
  ];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];
  barChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: '#0275d8',
      hoverBackgroundColor: '#5bc0de',
    },
  ];

  barChartData: ChartDataSets[] = [
    { data: [45, 37, 60, 70, 46, 33], label: 'Best Fruits' },
  ];

  // Line chart for General
  generalChartOptions: ChartOptions = {
    responsive: true,
    title: {
      text: "This year's trend",
      display: true,
    },
  };
  generalChartLabels: Label[] = [
    'Jan',
    'Fer',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  generalChartType: ChartType = 'line';
  generalChartLegend = true;
  generalChartPlugins = [];
  generalChartColors: Color[] = [
    {
      borderColor: 'black',
      hoverBackgroundColor: '#5bc0de',
    },
    // {
    //   borderColor: 'red',
    //   hoverBackgroundColor: '#5bc0de',
    // },
  ];

  generalChartData: ChartDataSets[] = [
    { data: [10, 15, 10, 10, 16, 13, 15, 12, 12, 10, 11, 11], label: '2020' },
    // { data: [10, 10, 10, 10, 10, 10, 20, 10, 10, 10, 10, 10], label: '2021' },
  ];

  stats: any;
  dataByFaculty: any;

  constructor(private statisticService: StatisticsService) {}

  ngOnInit(): void {
    this.getOverall();
    this.getDataByFaculty();
  }

  getOverall(): void {
    this.statisticService.getOverall(2021).subscribe(
      (res) => {
        this.stats = res.stats;
        // console.log('This is my overall stats ', this.stats);
        // console.log(
        //   'Key or value? ',
        //   Object.values(this.stats.contributionStatsOf2021)
        // );

        // Push to array
        const newData: ChartDataSets = {
          data: Object.values(this.stats.contributionStatsOf2021) as number[],
          label: '2021',
          backgroundColor: 'rgba(54,162,235,0.4)',
          borderColor: 'rgba(54,162,235,1)',
          pointBackgroundColor: 'rgba(54,162,235,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54,162,235,0.8)',
        };
        this.generalChartData.push(newData);
        // console.log(this.generalChartData);
      },
      (err: HttpErrorResponse) => {
        console.log(err);
      }
    );
  }

  getDataByFaculty(): void {
    this.statisticService.getByFaculty(1).subscribe(
      (res) => {
        // console.log('Response overall ', res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
