import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { createInterface } from 'readline';

@Injectable()
export class ProcessingUtils {
  readonly logger = new Logger(ProcessingUtils.name);
  constructor() {}

  parseCSVFile(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const importedData = [];
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const readLineInterface = createInterface({
        input: stream,
        crlfDelay: Infinity,
      });

      let headers: string[] = [];

      readLineInterface.on('line', (line) => {
        const values = line.split(',');

        if (!headers.length) {
          headers = values;
        } else {
          const user: Record<string, string> = {};
          headers?.forEach((header, index) => {
            user[header.trim()] = values[index]?.trim();
          });
          importedData.push(user);
        }
      });

      readLineInterface.on('close', () => resolve(importedData));
      readLineInterface.on('error', (err) => reject(err));
    });
  }
}
