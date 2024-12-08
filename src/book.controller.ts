import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { Book } from './Book';
import { BookService } from './book.service';

@Controller('/books')
export class BookController {
  private favoriteBooks: Book[] = [];
  constructor(private readonly bookService: BookService) {}

  @Post()
  createBook(@Body() book: Book): Book {
    this.bookService.addBook(book);
    return this.bookService.getBook(book.id);
  }

  @Get()
  getBooks(@Query('Commune') author: string): Book[] {
    if (author) {
      return this.bookService.getBooksOf(author);
    }
    return this.bookService.getAllBooks();
  }

    // Voir la liste des favoris
    @Get('favoris')
    getFavoriteBooks(): Book[] {
      return this.favoriteBooks;
    }

  @Get(':id')
  getBook(@Param('id') id: string): Book {
    return this.bookService.getBook(id);
  }

  @Delete(':id')
  deleteBook(@Param('id') id: string): void {
    this.bookService.remove(id);
  }

  @Post('search')
  @HttpCode(200)
  searchBooks(@Body() { term }: { term: string }): Book[] {
    return this.bookService.search(term);
  }

      // *** Gestion des livres favoris ***



    // Ajouter un livre dans les favoris
    @Post('favoris')
    @HttpCode(201)
    addFavoriteBook(@Body('id') id: string): string {
      const book = this.bookService.getBook(id);
      if (!book) {
        return `Livre avec l'ID ${id} introuvable.`;
      }
      if (this.favoriteBooks.some(favBook => favBook.id === id)) {
        return `Livre avec l'ID ${id} est déjà dans les favoris.`;
      }
      book.est_favori = "oui"
      this.favoriteBooks.push(book);
      return `Livre avec l'ID ${id} ajouté aux favoris.`;
    }
  
    // Supprimer un livre des favoris
    @Delete('favoris/:id')
    removeFavoriteBook(@Param('id') id: string): string {
      const index = this.favoriteBooks.findIndex(favBook => favBook.id === id);
      if (index === -1) {
        return `Livre avec l'ID ${id} n'est pas dans les favoris.`;
      }
      const book = this.favoriteBooks[index];
      book.est_favori = "non";
      this.favoriteBooks.splice(index, 1);
      return `Livre avec l'ID ${id} supprimé des favoris.`;
    }
}
