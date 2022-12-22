import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  datas: any[] = [
    [
       "2022-12-05T09:15:00+0530",
       18798.9,
       18839.8,
       18792.85,
       18799,
       234600,
       11445250
    ],
    [
       "2022-12-05T09:20:00+0530",
       18800.8,
       18815.65,
       18799,
       18801.95,
       148550,
       11430750
    ],
    [
       "2022-12-05T09:25:00+0530",
       18801,
       18803.1,
       18785.5,
       18786,
       132300,
       11444700
    ],
    [
       "2022-12-05T09:30:00+0530",
       18785.5,
       18790.9,
       18778.45,
       18789,
       97700,
       11448900
    ],
    [
       "2022-12-05T09:35:00+0530",
       18788,
       18799.95,
       18780.65,
       18795.05,
       78150,
       11438600
    ],
    [
       "2022-12-05T09:40:00+0530",
       18796.45,
       18798.75,
       18787.05,
       18788,
       39150,
       11452250
    ],
    [
       "2022-12-05T09:45:00+0530",
       18788,
       18788.05,
       18765,
       18767.7,
       137850,
       11462400
    ],
    [
       "2022-12-05T09:50:00+0530",
       18768,
       18771.85,
       18736.1,
       18738.4,
       332250,
       11464650
    ],
    [
       "2022-12-05T09:55:00+0530",
       18736.15,
       18746.65,
       18726.4,
       18726.4,
       210500,
       11519800
    ],
    [
       "2022-12-05T10:00:00+0530",
       18726.6,
       18732,
       18720,
       18727.55,
       115950,
       11512100
    ],
    [
       "2022-12-05T10:05:00+0530",
       18727.55,
       18734,
       18717.3,
       18722.9,
       139400,
       11523450
    ],
    [
       "2022-12-05T10:10:00+0530",
       18722.55,
       18722.9,
       18710.45,
       18718.15,
       110450,
       11542150
    ],
    [
       "2022-12-05T10:15:00+0530",
       18718.9,
       18732,
       18716.25,
       18729.6,
       132150,
       11547300
    ],
    [
       "2022-12-05T10:20:00+0530",
       18729.6,
       18734.75,
       18721.25,
       18730.5,
       94750,
       11560700
    ],
    [
       "2022-12-05T10:25:00+0530",
       18730.05,
       18744.6,
       18728.9,
       18743.55,
       75200,
       11565550
    ],
    [
       "2022-12-05T10:30:00+0530",
       18743,
       18745.8,
       18738.45,
       18745.55,
       67150,
       11565700
    ],
    [
       "2022-12-05T10:35:00+0530",
       18745.55,
       18751.45,
       18741.6,
       18742,
       98850,
       11562050
    ],
    [
       "2022-12-05T10:40:00+0530",
       18741.45,
       18745.8,
       18736.4,
       18743.55,
       33300,
       11575900
    ],
    [
       "2022-12-05T10:45:00+0530",
       18743.55,
       18748.45,
       18742,
       18748,
       30050,
       11577050
    ],
    [
       "2022-12-05T10:50:00+0530",
       18748,
       18752,
       18744.4,
       18746.2,
       25100,
       11568350
    ],
    [
       "2022-12-05T10:55:00+0530",
       18746,
       18752.7,
       18741,
       18750.6,
       34350,
       11561050
    ],
    [
       "2022-12-05T11:00:00+0530",
       18752,
       18756.95,
       18748.55,
       18750.6,
       38200,
       11556350
    ],
    [
       "2022-12-05T11:05:00+0530",
       18751.1,
       18758,
       18748,
       18748.05,
       25150,
       11548800
    ],
    [
       "2022-12-05T11:10:00+0530",
       18748.05,
       18769,
       18748.05,
       18766,
       57450,
       11535350
    ],
    [
       "2022-12-05T11:15:00+0530",
       18769,
       18774.95,
       18767.05,
       18770.9,
       68950,
       11518750
    ],
    [
       "2022-12-05T11:20:00+0530",
       18770.9,
       18772.6,
       18762.3,
       18767,
       59100,
       11508900
    ],
    [
       "2022-12-05T11:25:00+0530",
       18767,
       18771.35,
       18762.55,
       18770.55,
       24850,
       11507550
    ],
    [
       "2022-12-05T11:30:00+0530",
       18770.55,
       18776.2,
       18768,
       18773.35,
       55550,
       11504700
    ],
    [
       "2022-12-05T11:35:00+0530",
       18773.35,
       18773.35,
       18765,
       18772.95,
       20400,
       11522950
    ],
    [
       "2022-12-05T11:40:00+0530",
       18772.95,
       18784,
       18771.45,
       18778.7,
       86350,
       11497750
    ],
    [
       "2022-12-05T11:45:00+0530",
       18778.05,
       18779.65,
       18769.8,
       18770.1,
       55300,
       11500900
    ],
    [
       "2022-12-05T11:50:00+0530",
       18770.1,
       18772.15,
       18767,
       18771.45,
       18950,
       11496650
    ],
    [
       "2022-12-05T11:55:00+0530",
       18771.45,
       18780,
       18769.2,
       18778.6,
       27400,
       11495150
    ],
    [
       "2022-12-05T12:00:00+0530",
       18777.6,
       18785.5,
       18777.4,
       18779.6,
       45800,
       11488200
    ],
    [
       "2022-12-05T12:05:00+0530",
       18778.4,
       18783.05,
       18777,
       18779.55,
       17900,
       11492150
    ],
    [
       "2022-12-05T12:10:00+0530",
       18779.8,
       18804.35,
       18773.95,
       18800.9,
       103950,
       11495050
    ],
    [
       "2022-12-05T12:15:00+0530",
       18802.25,
       18819.1,
       18802.25,
       18806,
       132850,
       11496850
    ],
    [
       "2022-12-05T12:20:00+0530",
       18806,
       18847.8,
       18804.55,
       18840.65,
       237050,
       11519100
    ],
    [
       "2022-12-05T12:25:00+0530",
       18843.4,
       18853.1,
       18838.2,
       18846.2,
       230400,
       11564800
    ],
    [
       "2022-12-05T12:30:00+0530",
       18846.9,
       18855.3,
       18838,
       18840,
       117650,
       11651450
    ],
    [
       "2022-12-05T12:35:00+0530",
       18838.4,
       18843.95,
       18829.95,
       18829.95,
       79850,
       11687000
    ],
    [
       "2022-12-05T12:40:00+0530",
       18830,
       18834,
       18820.05,
       18828.95,
       83650,
       11684000
    ],
    [
       "2022-12-05T12:45:00+0530",
       18828.95,
       18834.9,
       18822.2,
       18834.9,
       64950,
       11718700
    ],
    [
       "2022-12-05T12:50:00+0530",
       18833.9,
       18839,
       18824.75,
       18831.6,
       66550,
       11743900
    ],
    [
       "2022-12-05T12:55:00+0530",
       18831.6,
       18832.55,
       18810,
       18813.9,
       67750,
       11754300
    ],
    [
       "2022-12-05T13:00:00+0530",
       18811.95,
       18821,
       18811.25,
       18815.1,
       36500,
       11767500
    ],
    [
       "2022-12-05T13:05:00+0530",
       18815.1,
       18817.15,
       18808,
       18815,
       31600,
       11771200
    ],
    [
       "2022-12-05T13:10:00+0530",
       18815.05,
       18818,
       18801.25,
       18801.95,
       58250,
       11768950
    ],
    [
       "2022-12-05T13:15:00+0530",
       18800,
       18806.4,
       18792.5,
       18798.15,
       60150,
       11767550
    ],
    [
       "2022-12-05T13:20:00+0530",
       18798.15,
       18805.3,
       18792.5,
       18798,
       37300,
       11770700
    ],
    [
       "2022-12-05T13:25:00+0530",
       18797.25,
       18803.1,
       18784,
       18790.45,
       45000,
       11773100
    ],
    [
       "2022-12-05T13:30:00+0530",
       18791.55,
       18793.2,
       18775.1,
       18779.3,
       65900,
       11762250
    ],
    [
       "2022-12-05T13:35:00+0530",
       18779.3,
       18783.85,
       18763.1,
       18765.65,
       114200,
       11744450
    ],
    [
       "2022-12-05T13:40:00+0530",
       18763.15,
       18773.3,
       18758.35,
       18761.5,
       121500,
       11730300
    ],
    [
       "2022-12-05T13:45:00+0530",
       18762,
       18778,
       18756,
       18777.15,
       82350,
       11720100
    ],
    [
       "2022-12-05T13:50:00+0530",
       18776.8,
       18777.5,
       18761.8,
       18763.8,
       49650,
       11714600
    ],
    [
       "2022-12-05T13:55:00+0530",
       18763.8,
       18764.85,
       18756,
       18762.5,
       63000,
       11710800
    ],
    [
       "2022-12-05T14:00:00+0530",
       18762.5,
       18767.55,
       18741.4,
       18756.05,
       153500,
       11678750
    ],
    [
       "2022-12-05T14:05:00+0530",
       18757,
       18780.8,
       18756.05,
       18778.75,
       71600,
       11675400
    ],
    [
       "2022-12-05T14:10:00+0530",
       18777.9,
       18788.95,
       18765.05,
       18770.85,
       63750,
       11668050
    ],
    [
       "2022-12-05T14:15:00+0530",
       18768.15,
       18776.05,
       18755.7,
       18767.95,
       28500,
       11667200
    ],
    [
       "2022-12-05T14:20:00+0530",
       18767.95,
       18792.75,
       18767.65,
       18792.75,
       38950,
       11665850
    ],
    [
       "2022-12-05T14:25:00+0530",
       18792.4,
       18802.6,
       18789.05,
       18800.7,
       85800,
       11658150
    ],
    [
       "2022-12-05T14:30:00+0530",
       18802,
       18807.7,
       18792.05,
       18803,
       67100,
       11654650
    ],
    [
       "2022-12-05T14:35:00+0530",
       18804.45,
       18805,
       18775.75,
       18779.6,
       64200,
       11648300
    ],
    [
       "2022-12-05T14:40:00+0530",
       18780,
       18786.45,
       18763.8,
       18778.15,
       64400,
       11639550
    ],
    [
       "2022-12-05T14:45:00+0530",
       18778.55,
       18791.85,
       18776.25,
       18790,
       45100,
       11629150
    ],
    [
       "2022-12-05T14:50:00+0530",
       18791,
       18800,
       18788,
       18795,
       31600,
       11634500
    ],
    [
       "2022-12-05T14:55:00+0530",
       18795,
       18800,
       18780.25,
       18788.55,
       31150,
       11638600
    ],
    [
       "2022-12-05T15:00:00+0530",
       18783.7,
       18813.95,
       18781.45,
       18802.55,
       112350,
       11648600
    ],
    [
       "2022-12-05T15:05:00+0530",
       18802.55,
       18812.1,
       18792.85,
       18812.1,
       69050,
       11649200
    ],
    [
       "2022-12-05T15:10:00+0530",
       18813.6,
       18842.8,
       18811,
       18836,
       216750,
       11631450
    ],
    [
       "2022-12-05T15:15:00+0530",
       18835.85,
       18837.55,
       18819.05,
       18820,
       151900,
       11588250
    ]
 ]
  constructor() { }
}
