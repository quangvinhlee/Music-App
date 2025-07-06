import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): { status: string; timestamp: number } {
    return {
      status: 'healthy',
      timestamp: Date.now(),
    };
  }

  ping(): { message: string; timestamp: number } {
    return {
      message: 'pong',
      timestamp: Date.now(),
    };
  }

  keepAlive(): { status: string; message: string; timestamp: number } {
    return {
      status: 'alive',
      message: 'Service is running and will not sleep!',
      timestamp: Date.now(),
    };
  }
}
