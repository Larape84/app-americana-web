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


  /**
   * @description: api para cargar la data de la grafica de tramites
   * @param rangoFechas rango de fechas a consultar en el backend
   * @returns
   */
  public loadGraficaOne(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/tramite'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

  /**
   * @description: api para cargar la data de la grafica de estados
   * @param rangoFechas rango de fechas a consultar en el backend
   * @returns
   */
  public loadGraficaTwo(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/estado'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

  /**
   * @description: api para cargar la data de la grafica de tiempo de atencion
   * @param rangoFechas rango de fechas a consultar en el backend
   * @returns
   */
  public loadGraficaTree(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/tiempo-atencion'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

  /**
   * @description: api para guardar la data del reporte JSON en el backend
   * @param data: reporte excel convertido en JSON para guardar en el backend
   * @returns
   */
  public guardarData(data: any): Observable<any[]> {
    const endpoint = 'reportes/saveAll'
    return this._http.post<any[]>(`${url}/${endpoint}`, [...data])
  }

  /**
   * @description: api para consultar los datos del reporte segun filtro de rango de fechas
   * @param rangoFechas rango de fechas a consultar en el backend
   * @returns
   */
  public searchData(rangoFechas: any): Observable<any[]>{
    const endpoint = 'reportes/resumen'
    return this._http.post<any[]>(`${url}/${endpoint}`, {...rangoFechas})
  }

}
