import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environments';

const url = environment.baseUrl

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private _http : HttpClient, ) { }

  public loadGraficaOne(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/tramite'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

  public loadGraficaTwo(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/estado'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }


  public loadGraficaTree(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/tiempo-atencion'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }


  public guardarData(data: any): Observable<any[]> {
    const endpoint = 'reportes/saveAll'
    return this._http.post<any[]>(`${url}/${endpoint}`, [...data])
  }

  public searchData(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/resumen'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

}
