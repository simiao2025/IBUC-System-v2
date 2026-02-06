
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private drive;
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly folderId: string;

  constructor() {
    const keyPath = process.env.GOOGLE_CREDENTIALS_PATH;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!keyPath || !this.folderId) {
      this.logger.warn('Google Drive credentials or Folder ID not configured.');
      return;
    }

    try {
      const resolvedPath = path.resolve(process.cwd(), keyPath);
      const auth = new google.auth.GoogleAuth({
        keyFile: resolvedPath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      this.drive = google.drive({ version: 'v3', auth });
      this.logger.log('Google Drive Service initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Google Drive Service', error);
    }
  }

  async uploadFile(file: Express.Multer.File, subFolder?: string): Promise<{ id: string; url: string }> {
    if (!this.drive) {
      throw new InternalServerErrorException('Google Drive service not initialized');
    }

    try {
      let parentId = this.folderId;

      // Se houver uma subpasta (ex: cpf do aluno), podemos criar ou buscar ela
      if (subFolder) {
        parentId = await this.getOrCreateFolder(subFolder, this.folderId);
      }

      const fileMetadata = {
        name: `${Date.now()}_${file.originalname}`,
        parents: [parentId],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Tornar o arquivo visível para quem tem o link (opcional, dependendo da privacidade)
      // Por padrão, como é uma conta de serviço, só ela e quem ela compartilhou vêm.
      // Mas se quisermos que o admin veja sem logar na conta de serviço:
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        id: response.data.id,
        url: response.data.webViewLink,
      };
    } catch (error) {
      this.logger.error('Error uploading file to Google Drive', error);
      throw new InternalServerErrorException('Failed to upload file to Google Drive');
    }
  }

  private async getOrCreateFolder(folderName: string, parentId: string): Promise<string> {
    const response = await this.drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,
      fields: 'files(id)',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await this.drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.drive) return;
    try {
      await this.drive.files.delete({ fileId });
    } catch (error) {
      this.logger.error(`Error deleting file ${fileId} from Google Drive`, error);
    }
  }
}
