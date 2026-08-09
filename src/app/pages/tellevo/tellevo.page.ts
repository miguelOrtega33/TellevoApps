import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface WeatherResponse {
  main: {
    temp: number;
    // Otras propiedades si las hay
  };
  weather: [
    {
      icon: Blob;
      id: number;
    }
  ]
}

const API_URL = environment.API_URL;
const API_KEY = environment.API_KEY;


@Component({
  selector: 'app-tellevo',
  templateUrl: './tellevo.page.html',
  styleUrls: ['./tellevo.page.scss'],
})
export class TellevoPage implements OnInit {

  nombreUsuario = localStorage.getItem('nombreUsuario');

  constructor(public router: Router, private menu: MenuController, public httpClient: HttpClient) { }

  weatherIcon: any
  weatherDetails: any
  weatherTemp: any = {}

  loadData(){
    this.httpClient.get<WeatherResponse >(`${API_URL}/weather?lat=${-33.68909}&lon=${-71.21528}&appid=${API_KEY}`).subscribe(results =>{
      console.log(results);
      this.weatherTemp = results['main']
      this.weatherDetails = results['weather'][0]
      this.weatherIcon = `https://openweathermap.org/img/wn/${this.weatherDetails.icon}@2x.png`
      this.weatherTemp.temp = (this.weatherTemp.temp  - 273.15).toFixed(0)
      this.weatherTemp.temp_min = (this.weatherTemp.temp_min  - 273.15).toFixed(0)
      this.weatherTemp.temp_max = (this.weatherTemp.temp_max  - 273.15).toFixed(0)
    })
  }

  ngOnInit() {
    this.menu.enable(true);
    this.loadData();
  }

  abrirMapa() {
    this.router.navigate(["/mapa"]);
    this.menu.close();
  }
}
