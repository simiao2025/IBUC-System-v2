import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string } {
    return {
      message: 'IBUC System API está funcionando!',
      version: '1.0.0',
    };
  }
}






