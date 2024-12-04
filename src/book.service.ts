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
    await Promise.all([this.loadBooksFromFile(), this.loadBooksFromApi()]);
    this.logger.log(`${this.storage.size} books loaded`);
  }

  private async loadBooksFromFile() {}
  

  private async loadBooksFromApi() {
    await firstValueFrom(
      this.httpService
        .get<APIBook[]>('https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/fr-229200506-arbres-remarquables@hauts-de-seine/exports/json?lang=fr&timezone=Europe%2FBerlin')
        .pipe(
          map((response) => response.data),
          map((apiBooks) =>
            apiBooks.map((apiBook) => ({
              name: apiBook.nom_francais || "Nom inconnu",
              commune: apiBook.commune || "Commune inconnue",
              date: apiBook.date_releve || "Date inconnue",
              latitude: apiBook.geo_point_2d.lat.toString(),
              longitude: apiBook.geo_point_2d.lon.toString(),
              envergure: apiBook.envergure?.toString() || "0",
              circonference: apiBook.circonference?.toString() || "0",
              hauteur: apiBook.hauteur?.toString() || "0",
              id: apiBook.matricule || "ID inconnu",
              est_favori: "non",
              photoUrl: apiBook.photo?.url || null,
            })),
          ),
          tap((books) => books.forEach((book) => this.addBook(book))),
        ),
    );
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
