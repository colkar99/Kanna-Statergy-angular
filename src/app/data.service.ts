import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  datas: any[] = [
    [
      "2022-11-23T09:15:00+0530",
      18401.05,
      18432.8,
      18401.05,
      18425.75,
      155950,
      4702400
    ],
    [
      "2022-11-23T09:20:00+0530",
      18426,
      18429.55,
      18418,
      18425.5,
      82200,
      4746050
    ],
    [
      "2022-11-23T09:25:00+0530",
      18426.5,
      18430.9,
      18425,
      18428.3,
      159650,
      4813300
    ],
    [
      "2022-11-23T09:30:00+0530",
      18429.75,
      18436.75,
      18422.55,
      18432.3,
      121600,
      4929500
    ],
    [
      "2022-11-23T09:35:00+0530",
      18432.3,
      18434.6,
      18420.5,
      18424.05,
      78550,
      4974950
    ],
    [
      "2022-11-23T09:40:00+0530",
      18422.25,
      18424.05,
      18410,
      18411.4,
      62350,
      5002050
    ],
    [
      "2022-11-23T09:45:00+0530",
      18411.45,
      18414.85,
      18401.95,
      18414.85,
      68050,
      5016000
    ],
    [
      "2022-11-23T09:50:00+0530",
      18412.6,
      18418.65,
      18399.35,
      18400.2,
      45150,
      5045600
    ],
    [
      "2022-11-23T09:55:00+0530",
      18400,
      18403.5,
      18395.9,
      18398,
      101400,
      5068350
    ],
    [
      "2022-11-23T10:00:00+0530",
      18398,
      18408.7,
      18396.1,
      18403.45,
      56450,
      5081050
    ],
    [
      "2022-11-23T10:05:00+0530",
      18403.45,
      18405.65,
      18396.15,
      18398,
      35600,
      5114050
    ],
    [
      "2022-11-23T10:10:00+0530",
      18398,
      18403.55,
      18393.05,
      18399,
      39750,
      5143200
    ],
    [
      "2022-11-23T10:15:00+0530",
      18399,
      18401.7,
      18388,
      18392.8,
      38550,
      5156950
    ],
    [
      "2022-11-23T10:20:00+0530",
      18392.8,
      18398.9,
      18388,
      18391.7,
      55500,
      5215650
    ],
    [
      "2022-11-23T10:25:00+0530",
      18391.5,
      18394.5,
      18386,
      18391.7,
      16850,
      5228150
    ],
    [
      "2022-11-23T10:30:00+0530",
      18392,
      18399.4,
      18390.95,
      18392.15,
      28000,
      5235700
    ],
    [
      "2022-11-23T10:35:00+0530",
      18392.15,
      18404,
      18392.15,
      18401.35,
      35050,
      5267350
    ],
    [
      "2022-11-23T10:40:00+0530",
      18399.05,
      18401.3,
      18390,
      18391.25,
      77700,
      5334800
    ],
    [
      "2022-11-23T10:45:00+0530",
      18391.25,
      18400.6,
      18390.1,
      18399.7,
      20050,
      5339050
    ],
    [
      "2022-11-23T10:50:00+0530",
      18400.6,
      18404,
      18397.05,
      18402.25,
      33250,
      5363650
    ],
    [
      "2022-11-23T10:55:00+0530",
      18402.15,
      18405.7,
      18399.6,
      18403.6,
      22400,
      5387700
    ],
    [
      "2022-11-23T11:00:00+0530",
      18402.7,
      18405,
      18398.3,
      18399.25,
      119600,
      5417200
    ],
    [
      "2022-11-23T11:05:00+0530",
      18399.25,
      18404.95,
      18398.2,
      18403.05,
      17850,
      5515350
    ],
    [
      "2022-11-23T11:10:00+0530",
      18403.05,
      18403.2,
      18397.5,
      18401,
      84150,
      5587350
    ],
    [
      "2022-11-23T11:15:00+0530",
      18401,
      18404,
      18399.5,
      18401.55,
      23050,
      5605100
    ],
    [
      "2022-11-23T11:20:00+0530",
      18401.55,
      18406.8,
      18401,
      18402,
      40800,
      5638150
    ],
    [
      "2022-11-23T11:25:00+0530",
      18402.2,
      18405,
      18397.25,
      18404.5,
      58800,
      5665200
    ],
    [
      "2022-11-23T11:30:00+0530",
      18404,
      18409,
      18403.25,
      18408.95,
      22400,
      5705300
    ],
    [
      "2022-11-23T11:35:00+0530",
      18408.5,
      18412.55,
      18408.25,
      18409.95,
      23300,
      5716150
    ],
    [
      "2022-11-23T11:40:00+0530",
      18409.95,
      18410,
      18406,
      18409.8,
      29900,
      5728250
    ],
    [
      "2022-11-23T11:45:00+0530",
      18409.8,
      18411,
      18406.35,
      18409.95,
      27250,
      5748650
    ],
    [
      "2022-11-23T11:50:00+0530",
      18409.95,
      18414.1,
      18409.9,
      18410.35,
      24700,
      5771250
    ],
    [
      "2022-11-23T11:55:00+0530",
      18410.55,
      18413,
      18408.6,
      18412,
      27050,
      5785450
    ],
    [
      "2022-11-23T12:00:00+0530",
      18412,
      18415,
      18408.3,
      18412.85,
      55400,
      5814050
    ],
    [
      "2022-11-23T12:05:00+0530",
      18411.4,
      18415.5,
      18409.95,
      18411.6,
      66950,
      5808600
    ],
    [
      "2022-11-23T12:10:00+0530",
      18411.6,
      18415.15,
      18409.65,
      18413.8,
      62500,
      5828450
    ],
    [
      "2022-11-23T12:15:00+0530",
      18413.8,
      18415.75,
      18406.75,
      18406.95,
      62400,
      5890200
    ],
    [
      "2022-11-23T12:20:00+0530",
      18406.95,
      18408.85,
      18401.6,
      18402.6,
      37300,
      5938150
    ],
    [
      "2022-11-23T12:25:00+0530",
      18402.1,
      18403.35,
      18398,
      18401.75,
      41250,
      5971500
    ],
    [
      "2022-11-23T12:30:00+0530",
      18401.25,
      18404.95,
      18399.05,
      18404.15,
      39750,
      6016100
    ],
    [
      "2022-11-23T12:35:00+0530",
      18404.15,
      18406.75,
      18401.5,
      18401.65,
      33250,
      6048850
    ],
    [
      "2022-11-23T12:40:00+0530",
      18401.55,
      18404,
      18400,
      18401.35,
      55200,
      6085200
    ],
    [
      "2022-11-23T12:45:00+0530",
      18401.45,
      18405.45,
      18401,
      18404,
      39500,
      6134700
    ],
    [
      "2022-11-23T12:50:00+0530",
      18404.45,
      18406.95,
      18402.2,
      18402.2,
      54150,
      6172200
    ],
    [
      "2022-11-23T12:55:00+0530",
      18401.95,
      18412.6,
      18401.95,
      18410.85,
      50600,
      6208700
    ],
    [
      "2022-11-23T13:00:00+0530",
      18410.85,
      18413.95,
      18410.3,
      18412,
      32450,
      6255000
    ],
    [
      "2022-11-23T13:05:00+0530",
      18412,
      18413.55,
      18407.1,
      18407.45,
      32650,
      6279400
    ],
    [
      "2022-11-23T13:10:00+0530",
      18408.95,
      18410.6,
      18406,
      18408.8,
      58950,
      6306350
    ],
    [
      "2022-11-23T13:15:00+0530",
      18408.85,
      18417.4,
      18406.4,
      18416.35,
      81700,
      6368800
    ],
    [
      "2022-11-23T13:20:00+0530",
      18417.4,
      18421.95,
      18416,
      18416.15,
      82750,
      6454850
    ],
    [
      "2022-11-23T13:25:00+0530",
      18416.55,
      18418.55,
      18408.25,
      18408.4,
      72000,
      6480850
    ],
    [
      "2022-11-23T13:30:00+0530",
      18408.5,
      18411.8,
      18403.05,
      18406.4,
      72600,
      6561300
    ],
    [
      "2022-11-23T13:35:00+0530",
      18405.45,
      18411.5,
      18404.55,
      18410.1,
      40400,
      6601350
    ],
    [
      "2022-11-23T13:40:00+0530",
      18410.1,
      18416.3,
      18408.9,
      18411.65,
      83850,
      6636100
    ],
    [
      "2022-11-23T13:45:00+0530",
      18411.85,
      18412.05,
      18409.35,
      18412,
      65750,
      6694750
    ],
    [
      "2022-11-23T13:50:00+0530",
      18412,
      18419.95,
      18411.35,
      18417.1,
      47500,
      6746450
    ],
    [
      "2022-11-23T13:55:00+0530",
      18417.1,
      18422.4,
      18415.85,
      18418.1,
      95000,
      6782250
    ],
    [
      "2022-11-23T14:00:00+0530",
      18417.55,
      18419.9,
      18413,
      18418.75,
      71500,
      6870250
    ],
    [
      "2022-11-23T14:05:00+0530",
      18419.5,
      18422.85,
      18417.1,
      18417.5,
      59600,
      6946150
    ],
    [
      "2022-11-23T14:10:00+0530",
      18417.15,
      18420.9,
      18415.25,
      18420.9,
      49050,
      6966900
    ],
    [
      "2022-11-23T14:15:00+0530",
      18420.9,
      18421,
      18415,
      18415,
      56900,
      6928200
    ],
    [
      "2022-11-23T14:20:00+0530",
      18415,
      18418.2,
      18408.35,
      18410.3,
      70900,
      6988850
    ],
    [
      "2022-11-23T14:25:00+0530",
      18411.45,
      18430,
      18410,
      18426.35,
      87150,
      7016550
    ],
    [
      "2022-11-23T14:30:00+0530",
      18426.4,
      18428,
      18422.05,
      18424.55,
      49850,
      7084900
    ],
    [
      "2022-11-23T14:35:00+0530",
      18424.4,
      18425.55,
      18421.45,
      18425.1,
      69600,
      7153700
    ],
    [
      "2022-11-23T14:40:00+0530",
      18425.1,
      18434.9,
      18425,
      18434.5,
      56350,
      7181100
    ],
    [
      "2022-11-23T14:45:00+0530",
      18434.45,
      18436.7,
      18427.3,
      18432.8,
      81150,
      7247350
    ],
    [
      "2022-11-23T14:50:00+0530",
      18432.75,
      18442.05,
      18430.15,
      18440,
      100000,
      7313850
    ],
    [
      "2022-11-23T14:55:00+0530",
      18438.7,
      18448,
      18438.7,
      18445.1,
      90950,
      7353900
    ],
    [
      "2022-11-23T15:00:00+0530",
      18448.7,
      18451,
      18420,
      18421.55,
      91800,
      7409300
    ],
    // [
    //   "2022-11-23T15:05:00+0530",
    //   18422.85,
    //   18422.95,
    //   18388.65,
    //   18394.65,
    //   111400,
    //   7440500
    // ],
    // [
    //   "2022-11-23T15:10:00+0530",
    //   18392.75,
    //   18404.95,
    //   18391.35,
    //   18400.9,
    //   118200,
    //   7489900
    // ],
    // [
    //   "2022-11-23T15:15:00+0530",
    //   18402.25,
    //   18402.8,
    //   18384,
    //   18388.1,
    //   128000,
    //   7539600
    // ]
  ]
  constructor() { }
}
