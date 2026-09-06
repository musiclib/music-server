import { Injectable } from '@nestjs/common';
import { LibraryComposerDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';
import { SynologyComposerDataDto, SynologyComposerDto } from './dtos/composer.cgi.dto';
import { replaceDoubleQuotes } from 'src/utils/strings';

function personToRow(person: LibraryComposerDto): SynologyComposerDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `composer_${person.id}`,
    name: replaceDoubleQuotes(person.name),
  };
}
@Injectable()
export class SynologyComposerService {
  constructor(private readonly libraryService: LibraryService) {}

  async listComposers(accountId: number, offset: number, limit: number): Promise<SynologyComposerDataDto> {
    const composers = await this.libraryService.listComposers(accountId, {}, offset, limit);
    return {
      composers: composers.items.map(personToRow),
      offset,
      total: composers.total,
    };
  }
}
