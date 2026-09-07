import { Injectable } from '@nestjs/common';

@Injectable()
export class QnapMediaListApiService {
  // eslint-disable-next-line class-methods-use-this
  async getRandomList() {
    return {
      status: 1,
      datas: [
        {
          FileName: 'Album 5',
          FileType: 'album',
          Title: 'Album 5',
          LinkID: '24',
          ImagePath: 'image/album.png',
          Albumartist: 'Artist 3',
        },
      ],
    };
  }
}
