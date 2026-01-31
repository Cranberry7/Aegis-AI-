import { Injectable, Logger } from '@nestjs/common';
import { IUploadedFile } from '@app/common/types/common';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { formatBytes } from '@app/common/utils/file';
import fs from 'fs';

@Injectable()
export class CompressionService {
  readonly logger = new Logger(CompressionService.name);

  /**
   * Compresses a video buffer using ffmpeg and returns a new IUploadedFile.
   */
  async compressVideo(inputFile: IUploadedFile): Promise<IUploadedFile> {
    try {
      this.logger.log(`Started Compressing video - ${inputFile.originalname}`);

      const compressedBuffer = await this.compressBufferWithFfmpeg(
        inputFile.buffer,
        inputFile.originalname,
      );

      this.logger.log(
        `Compressed video ${inputFile.originalname} [${formatBytes(inputFile.size)} -> ${formatBytes(compressedBuffer.length)}]`,
      );

      // Return a new IUploadedFile with updated fields
      return {
        ...inputFile,
        buffer: compressedBuffer,
        size: compressedBuffer.length,
      };
    } catch (err) {
      this.logger.error(`Error in compressing video: ${err.message}`);
      return inputFile;
    }
  }

  /**
   * Compresses a video buffer using ffmpeg and returns the compressed buffer.
   */
  compressBufferWithFfmpeg(buffer: Buffer, filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      fs.writeFileSync(filename, buffer);

      outputStream.on('data', (chunk) => chunks.push(chunk));
      outputStream.on('end', () => {
        fs.unlinkSync(filename);
        resolve(Buffer.concat(chunks));
      });
      outputStream.on('error', reject);

      ffmpeg(filename)
        .inputFormat('mp4')
        .inputOptions('-fflags +genpts') // Helps avoid timestamp issues
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-crf 26',
          '-preset fast',
          '-movflags frag_keyframe+empty_moov',
          '-b:a 128k',
        ])
        .format('mp4')
        .on('start', (cmd) => this.logger.debug('FFmpeg started:', cmd))
        .on('stderr', (line) => this.logger.debug('FFmpeg stderr:', line))
        .on('error', (err) => {
          this.logger.error('FFmpeg error:', err.message);
          if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
          }
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on('end', () => {
          this.logger.debug('FFmpeg processing finished');
        })
        .pipe(outputStream, { end: true });
    });
  }
}
