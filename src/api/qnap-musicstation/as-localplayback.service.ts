import { Injectable } from '@nestjs/common';

@Injectable()
export class QnapAsLocalPlaybackApiService {
  // eslint-disable-next-line class-methods-use-this
  async getStatus() {
    return {
      status: false,
    };
  }
}
