import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; status: string } {
    return {
      message: '🚀 NESTJS API V1.0.5-DYNAMIC-CORS IS RUNNING 🚀',
      version: '1.0.5-DYNAMIC-CORS',
      status: 'OK',
    };
  }
}






