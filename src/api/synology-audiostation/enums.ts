export enum SynologyApiEnum {
  ALBUM = 'SYNO.AudioStation.Album',
  ARTIST = 'SYNO.AudioStation.Artist',
  AUDIOSTATION_INFO = 'SYNO.AudioStation.Info',
  AUTH = 'SYNO.API.Auth',
  COMPOSER = 'SYNO.AudioStation.Composer',
  COVER = 'SYNO.AudioStation.Cover',
  ENCRYPTION = 'SYNO.API.Encryption',
  FOLDER = 'SYNO.AudioStation.Folder',
  GENRE = 'SYNO.AudioStation.Genre',
  INFO = 'SYNO.API.Info',
  PIN = 'SYNO.AudioStation.Pin',
  PLAYLIST = 'SYNO.AudioStation.Playlist',
  PROXY = 'SYNO.AudioStation.Proxy',
  RADIO = 'SYNO.AudioStation.Radio',
  SEARCH = 'SYNO.AudioStation.Search',
  SONG = 'SYNO.AudioStation.Song',
  STREAM = 'SYNO.AudioStation.Stream',
}

export enum SynologyLibraryEnum {
  ALL = 'all',
  SHARED = 'shared',
  PERSONAL = 'personal',
}

export enum SynologyMethodEnum {
  ADD = 'add',
  /**
   * Method for adding a track to a playlist via the `entry.cgi` endpoint
   */
  ADD_TRACK = 'add_track',
  /**
   * Method for creating "normal" playlists
   */
  CREATE = 'create',
  /**
   * Method for creating "smart" playlists, which are filters for songs
   */
  CREATE_SMART = 'createsmart',
  /**
   * Method for deleting playlists
   */
  DELETE = 'delete',
  /**
   * Method for un-caching the current song information when pausing a radio station
   */
  DELETE_SONG_INFO = 'deletesonginfo',
  GET_COVER = 'getcover',
  GET_SONG_COVER = 'getsongcover',
  GET_INFO = 'getinfo',
  GET_SONG_INFO = 'getsonginfo',
  /**
   * Method for creating a stream for a radio station
   */
  GET_STREAM_ID = 'getstreamid',
  /**
   * Method for returning a list of any object type
   */
  LIST = 'list',
  /**
   * Method for returning a list of "default" genres
   */
  LIST_DEFAULT_GENRE = 'list_default_genre',
  LOGOUT = 'clearSessionToken',
  PIN = 'pin',
  QUERY = 'query',
  /**
   * Method for removing missing tracks from a playlist
   */
  REMOVE_MISSING = 'removemissing',
  /**
   * Method for renaming a playlist
   */
  RENAME = 'rename',
  STREAM = 'stream',
  TRANSCODE = 'transcode',
  UNPIN = 'unpin',
  UPDATE_RADIOS = 'updateradios',
  /**
   * Method for updating a "smart" playlist
   */
  UPDATE_SMART = 'updatesmart',
  /**
   * Method for adding, updating or removing the songs in a playlist
   */
  UPDATE_SONGS = 'updatesongs',
}

export enum SynologyQueryEnum {
  ALL = 'all',
}

export enum SynologyPinTypeEnum {
  ALBUM = 'album',
  ARTIST = 'artist',
  COMPOSER = 'composer',
  GENRE = 'genre',
  FOLDER = 'folder',
  RECENTLY_ADDED = 'recently_added',
  RANDOM_100 = 'random_100',
  PLAYLIST = 'playlist',
}
