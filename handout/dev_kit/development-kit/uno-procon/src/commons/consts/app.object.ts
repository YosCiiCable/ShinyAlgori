export class AppObject {
  static readonly UPLOAD_KEY = {
    ICON: 'icon',
  };
  /**
   * @field SCHEMA_OPTIONS
   * @description define option schema
   * @type any
   */
  static readonly SCHEMA_OPTIONS = {
    versionKey: false,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    id: false,
    timestamps: {
      createdAt: 'dateCreated',
      updatedAt: 'dateUpdated',
    },
  };
  static readonly BOOLEAN = {
    TRUE: 'true',
    FALSE: 'false',
  };

  static readonly REDIS_PREFIX = {
    DESK: 'desk',
    ROOM: 'room',
    PLAYER: 'player',
  };
}
