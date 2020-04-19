import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOneOrCreate(title: string): Promise<Category> {
    const findCategory = await this.findOne({
      where: { title },
    });
    if (findCategory) return findCategory;

    const category = this.create({
      title,
    });

    await this.save(category);

    return category;
  }
}

export default CategoriesRepository;
