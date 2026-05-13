import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      name: 'mile-server',
      status: 'ok',
    };
  }
}
