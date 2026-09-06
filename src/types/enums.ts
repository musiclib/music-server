export enum UserRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SessionRestrictionEnum {
  SYNOLOGY_AUDIOSTATION = 'synology-audiostation',
  WEB_UI = 'web-ui',
}

export enum FileTypeEnum {
  FLAC = 'flac',
  M4A = 'm4a',
  MP3 = 'mp3',
  OGG = 'ogg',
}

export enum ContentTypeEnum {
  FILE = 'file',
  FOLDER = 'folder',
  REMOTE = 'remote',
}

export enum ShoutcastItemTypeEnum {
  CONTAINER = 'container',
  STATION = 'station',
}

export enum PlaylistTypeEnum {
  NORMAL = 'normal',
  SMART = 'smart',
}

export enum SmartPlaylistConjugalEnum {
  AND = 'and',
  OR = 'or',
}

export enum SmartPlaylistOperationEnum {
  /**
   * A field date value is after a rule value.
   */
  AFTER = 'after',
  /**
   * A field date value is before a rule value.
   */
  BEFORE = 'before',
  /**
   * A field string value contains a rule value.
   */
  CONTAINS = 'contains',
  /**
   * A field string value does not contain a rule value.
   */
  DOES_NOT_CONTAIN = 'does_not_contain',
  /**
   * A field string value is GTE to a rule value.
   */
  GREATER_THAN_OR_EQUAL_TO = 'greater_than_or_equal_to',
  /**
   * A field date value is in the last <rule value> <interval value>.
   */
  IN_THE_LAST = 'in_the_last',
  /**
   * A field string value is equal to a rule value.
   */
  IS = 'is',
  /**
   * A field string value is not equal to a rule value.
   */
  IS_NOT = 'is_not',
  /**
   * A field numeric value is less than a rule value.
   */
  LESS_THAN = 'less_than',
  /**
   * A field date value is not in the last <rule value> <interval value>.
   */
  NOT_IN_THE_LAST = 'not_in_the_last',
}

export enum SmartPlaylistIntervalTagEnum {
  /**
   * A field date value is in or not in the last <rule value> days.
   */
  DAYS = 'days',
  /**
   * A field date value is in or not in the last <rule value> weeks.
   */
  WEEKS = 'weeks',
  /**
   * A field date value is in or not in the last <rule value> months.
   */
  MONTHS = 'months',
}

export enum SmartPlaylistFieldEnum {
  ALBUM = 'album',
  ALBUM_ARTIST = 'album_artist',
  ARTIST = 'artist',
  BIT_RATE = 'bit_rate',
  COMPOSER = 'composer',
  DATE_ADDED = 'date_added',
  FILE_PATH = 'file_path',
  GENRE = 'genre',
  RATING = 'rating',
  YEAR = 'year',
}

export enum SortDirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export enum AlbumSortFieldEnum {
  ALBUM = 'album',
  ALBUM_ARTIST = 'album_artist',
  ARTIST = 'artist',
  COMPOSER = 'composer',
  DATE_ADDED = 'date_added',
  DATE_RELEASED = 'date_released',
  GENRE = 'genre',
  RATING = 'rating',
  YEAR = 'year',
}

export enum ArtistSortFieldEnum {
  ARTIST = 'artist',
  DATE_ADDED = 'date_added',
}

export enum ComposerSortFieldEnum {
  COMPOSER = 'composer',
  DATE_ADDED = 'date_added',
}

export enum GenreSortFieldEnum {
  GENRE = 'genre',
}

export enum TrackSortFieldEnum {
  DATE_ADDED = 'date_added',
  ARTIST = 'artist',
  ALBUM = 'album',
  ALBUM_ARTIST = 'album_artist',
  COMPOSER = 'composer',
  GENRE = 'genre',
  TITLE = 'title',
  YEAR = 'year',
}
