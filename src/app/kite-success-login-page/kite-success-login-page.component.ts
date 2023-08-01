import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { ApiServiceService } from '../api-service.service';

@Component({
  selector: 'app-kite-success-login-page',
  templateUrl: './kite-success-login-page.component.html',
  styleUrls: ['./kite-success-login-page.component.css']
})
export class KiteSuccessLoginPageComponent implements OnInit {

  constructor(public router: ActivatedRoute,public apiservice: ApiServiceService) { }

  ngOnInit(): void {
    let request_token = this.router.snapshot.queryParams.request_token;
    console.log(request_token);

    this.apiservice.setRequestToken({request_token}).subscribe({
      next: (data) => {alert("Token successfully saved")},
      error(err) {
        alert(err.error)
      }
    })
  }

}
