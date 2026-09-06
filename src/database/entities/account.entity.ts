import { Column, DataType, Model, Sequelize, Table } from 'sequelize-typescript';
import { Guid } from 'typescript-guid';
import { UserRoleEnum } from 'src/types/enums';

/**
 * The AccountEntity holds all of the information required for a person to securely-access the
 * API including their hashed password and session secrets.
 */
@Table({
  tableName: 'accounts',
  timestamps: true,
  underscored: true,
})
export class AccountEntity extends Model<AccountEntity> {
  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are
   * inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  /**
   * The Bcrypt hash of the password used when authenticating the user.
   */
  @Column({
    field: 'password_hash',
    type: DataType.STRING(60),
  })
  declare passwordHash: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('roles');
      if (rawValue?.length) {
        const roles = rawValue.split(',').map((p: string) => p as UserRoleEnum);
        return roles;
      }
      return [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('roles', value.join(','));
      } else {
        this.setDataValue('roles', value);
      }
    },
  })
  declare roles: UserRoleEnum[];

  /**
   * The session token is a random UUID used as part of a secret token that verifies session
   * information.  A change in this value invalidates all sessions belongong to this user
   * immediately.
   */
  @Column({
    type: DataType.UUID,
    allowNull: false,
    set(value: Guid) {
      this.setDataValue('sessionKey', value.toString());
    },
  })
  declare sessionKey: Guid;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
  })
  declare updatedAt?: Date;

  /**
   * The username is the main point of authentication
   */
  @Column({
    type: DataType.STRING(255),
  })
  declare username: string;
}
