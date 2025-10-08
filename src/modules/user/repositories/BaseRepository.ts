import { Document, Model, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  /**
   * Find a document by ID
   */
  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id);
  }

  /**
   * Find a document by filter
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  /**
   * Find multiple documents by filter
   */
  async findMany(filter: FilterQuery<T> = {}, options: QueryOptions<T> = {}): Promise<T[]> {
    return await this.model.find(filter, null, options);
  }

  /**
   * Update a document by ID
   */
  async updateById(id: string | Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }

  /**
   * Update a document by filter
   */
  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findOneAndUpdate(filter, update, { new: true, runValidators: true });
  }

  /**
   * Update multiple documents
   */
  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number> {
    const result = await this.model.updateMany(filter, update);
    return result.modifiedCount;
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  /**
   * Delete a document by filter
   */
  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter);
  }

  /**
   * Delete multiple documents
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount;
  }

  /**
   * Count documents matching filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  /**
   * Check if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
}
