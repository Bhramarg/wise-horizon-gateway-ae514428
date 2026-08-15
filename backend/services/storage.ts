import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

export class StorageService {
  /**
   * Save a file to local storage
   */
  static async save(buffer: Buffer, mimetype: string, originalName: string, folder = "general"): Promise<string> {
    const ext = path.extname(originalName) || "";
    const uniqueName = crypto.randomUUID() + ext;
    const folderPath = path.join(UPLOAD_DIR, folder);
    
    await fs.mkdir(folderPath, { recursive: true });
    
    const filePath = path.join(folderPath, uniqueName);
    await fs.writeFile(filePath, buffer);
    
    return `${folder}/${uniqueName}`;
  }

  /**
   * Read a file from local storage
   */
  static async read(assetPath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOAD_DIR, assetPath);
    return fs.readFile(fullPath);
  }

  /**
   * Delete a file from local storage
   */
  static async delete(assetPath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, assetPath);
    try {
      await fs.unlink(fullPath);
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  /**
   * Get a public URL (assuming our Express server serves this static folder)
   */
  static getPublicUrl(assetPath: string): string {
    // Note: Assuming Express runs on port 3001
    // A production environment would use a different base URL
    return `http://localhost:3001/uploads/${assetPath}`;
  }
}
