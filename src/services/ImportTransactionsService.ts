/* eslint-disable no-await-in-loop */
import fs from 'fs';
import csvParse from 'csv-parse';
import { join } from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';

interface Request {
  filename: string;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const parsers = csvParse({ ltrim: true, from_line: 2 });

    const csvFilePath = join(uploadConfig.directory, filename);
    const parseCSV = fs.createReadStream(csvFilePath).pipe(parsers);

    const transactions: TransactionDTO[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const storedTransaction: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const transaction of transactions) {
      storedTransaction.push(
        await createTransaction.execute({
          ...transaction,
        }),
      );
    }

    await fs.promises.unlink(csvFilePath);

    return storedTransaction;
  }
}

export default ImportTransactionsService;
