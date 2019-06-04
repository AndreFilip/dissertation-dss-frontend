import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private uploadUrl = 'https://mydssathenstech.herokuapp.com/files/uploadKml';
  private deleteUrl = 'https://mydssathenstech.herokuapp.com/files/deleteKml';
  private downloadUrl = 'https://mydssathenstech.herokuapp.com/files/downloadFile/getIfExists';


  constructor(private http: HttpClient) { }

  uploadFile(formData: FormData) {
    return this.http.post(this.uploadUrl, formData);
  }

  deleteFile() {
    return this.http.delete(this.deleteUrl);
  }

  getIfExists() {
    return this.http.get(this.downloadUrl);
  }

}
