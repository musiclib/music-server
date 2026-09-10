import { Injectable } from '@nestjs/common';

@Injectable()
export class QnapAsLocalPlaybackService {
  // eslint-disable-next-line class-methods-use-this
  async getStatus() {
    return {
      status: false,
    };
  }
}
