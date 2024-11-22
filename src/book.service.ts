import { readFile } from 'node:fs/promises';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { firstValueFrom, map, tap } from 'rxjs';
import { APIBook } from './APIBook';
import type { Book } from './Book';

@Injectable()
export class BookService implements OnModuleInit {
  private readonly logger = new Logger(BookService.name);
  private readonly storage: Map<string, Book> = new Map();

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    this.logger.log('Loading books from file and API');
    await Promise.all([this.loadBooksFromFile(), this.loadBooksFromFile1()]);
    this.logger.log(`${this.storage.size} books loaded`);
  }

  private async loadBooksFromFile() {
    const data = await readFile('src/dataset.json', 'utf8');
    const jsonData = JSON.parse(data.toString());
  
    // Vérification que la structure contient une liste de services
    if (!Array.isArray(jsonData.service)) {
      throw new Error('Invalid dataset format: "service" property is missing or not an array.');
    }
  
    // Mapping des données vers l'interface Book
    const books = jsonData.service.map((item) => ({
      name: item.nom || "Unknown", // Nom du service
      commune: item.adresse?.[0]?.nom_commune || "Unknown", // Nom de la commune
      postalCode: item.adresse?.[0]?.code_postal || "Unknown", // Code postal
      latitude: item.adresse?.[0]?.latitude || "Unknown", // Latitude
      longitude: item.adresse?.[0]?.longitude || "Unknown", // Longitude
      dayStart: item.plage_ouverture?.[0]?.nom_jour_debut || "Unknown", // Jour de début
      dayEnd: item.plage_ouverture?.[0]?.nom_jour_fin || "Unknown", // Jour de fin
      startTime: item.plage_ouverture?.[0]?.valeur_heure_debut_1 || "Unknown", // Heure d'ouverture
      endTime: item.plage_ouverture?.[0]?.valeur_heure_fin_1 || "Unknown", // Heure de fermeture
      id: item.id || "Unknown", // Identifiant unique
    }));
  
    // Ajout des books au stockage
    books.forEach((book) => this.addBook(book));
  }

  private async loadBooksFromFile1() {
    const data = await readFile('src/dataset1.json', 'utf8');
    const jsonData = JSON.parse(data.toString());
  
    // Vérification que la structure contient une liste de services
    if (!Array.isArray(jsonData.service)) {
      throw new Error('Invalid dataset format: "service" property is missing or not an array.');
    }
  
    // Mapping des données vers l'interface Book
    const books = jsonData.service.map((item) => ({
      name: item.nom || "Unknown", // Nom du service
      commune: item.adresse?.[0]?.nom_commune || "Unknown", // Nom de la commune
      postalCode: item.adresse?.[0]?.code_postal || "Unknown", // Code postal
      latitude: item.adresse?.[0]?.latitude || "Unknown", // Latitude
      longitude: item.adresse?.[0]?.longitude || "Unknown", // Longitude
      dayStart: item.plage_ouverture?.[0]?.nom_jour_debut || "Unknown", // Jour de début
      dayEnd: item.plage_ouverture?.[0]?.nom_jour_fin || "Unknown", // Jour de fin
      startTime: item.plage_ouverture?.[0]?.valeur_heure_debut_1 || "Unknown", // Heure d'ouverture
      endTime: item.plage_ouverture?.[0]?.valeur_heure_fin_1 || "Unknown", // Heure de fermeture
      id: item.id || "Unknown", // Identifiant unique
    }));
  
    // Ajout des books au stockage
    books.forEach((book) => this.addBook(book));
  }

  
  addBook(book: Book) {
    this.storage.set(book.id, book);
  }

  getBook(id: string): Book {
    const book = this.storage.get(id);

    if (!book) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return book;
  }

  getAllBooks(): Book[] {
    return Array.from(this.storage.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  getBooksOf(author: string): Book[] {
    return this.getAllBooks()
      .filter((book) => book.commune === author)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  remove(id: string) {
    this.storage.delete(id);
  }

  search(term: string) {
    return Array.from(this.storage.values())
      .filter((book) => book.name.includes(term) || book.commune.includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
