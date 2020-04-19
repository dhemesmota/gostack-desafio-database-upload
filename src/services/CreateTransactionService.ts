import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoriesRepository';

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransaction): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    const categoriesRepository = getCustomRepository(CategoryRepository);
    const findCategory = await categoriesRepository.findOneOrCreate(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
