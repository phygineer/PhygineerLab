import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  host:string="http://localhost:8000/api";
  constructor(private httpClient:HttpClient) { }

  convert_img_to_b64(imagePayload:File)
  {
    const formData = new FormData();
    formData.append('file', imagePayload, imagePayload.name); // appending the file
    return this.httpClient.post(`${this.host}/convert-image-to-b64`,formData)
  }

  convert_b64_to_img(b64image:string)
  {
    return this.httpClient.post(`${this.host}/convert-b64-to-image`,{"image":b64image})
  }

  detect_image(b64image:string)
  {
    return this.httpClient.post(`${this.host}/detect-image`,{"image":b64image})
  }

  get_detectable_objects()
  {
    return this.httpClient.get(`${this.host}/detectable-objects`)
  }

}

export interface ImageResponse{
  image:string
}