/**
 * Base entity class that all domain entities extend
 * Provides common properties like id and createdAt
 */
export abstract class BaseEntity {
  private readonly _id: string
  private _createdAt: Date

  constructor(id: string, createdAt: Date) {
    this._id = id
    this._createdAt = createdAt
  }

  get id(): string {
    return this._id
  }

  get createdAt(): Date {
    return this._createdAt
  }

  equals(entity: BaseEntity): boolean {
    if (!(entity instanceof BaseEntity)) {
      return false
    }
    return this._id === entity._id
  }
}
